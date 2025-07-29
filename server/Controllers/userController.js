const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require("../utils/sendEmail"); // تأكد من وجودها
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      profileImage: req.file ? `uploads/${req.file.filename}` : ''
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        address: user.address,
        phone: user.phone,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // إنشاء JWT token (بدون role لأنك ما بتستخدمه)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    // إرسال الرد
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // إخفاء كلمة السر
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      firstName,
      lastName,
      phone,
      address
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ تحديث الحقول إذا تم إرسالها
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // ✅ تحديث صورة البروفايل إن وُجدت
    if (req.file) {
      user.profileImage = req.file.filename;
    }

    await user.save();

    // ✅ إخفاء كلمة السر من الرد
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;

    res.status(200).json({ message: "User profile updated", user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
};

//delete user 
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        username: deletedUser.username,
        email: deletedUser.email,
        role: deletedUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

//change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // التحقق من كلمة السر الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // منع تكرار كلمة السر
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different from the current one" });
    }

    // تحديث كلمة السر
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password", error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verifyToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.verified = true;
    user.verifyToken = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // ✅ لا تكشف أن الإيميل موجود أو لا (أفضل أمنيًا)
    if (!user || !user.verified) {
      return res.status(200).json({
        message: "If this email exists and is verified, a reset link will be sent.",
      });
    }

    // ✅ إنشاء توكن صالح لمدة 15 دقيقة
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "15m" }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    // ✅ إعداد رابط إعادة التعيين
const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // ✅ إرسال الإيميل
    const message = `
      <h3>Reset Your Password</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail(user.email, "Password Reset", message);

    res.status(200).json({ message: "If this email exists and is verified, a reset link will be sent." });

  } catch (err) {
    res.status(500).json({ message: "Error requesting password reset", error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) return res.status(400).json({ message: "Token is missing" });

    // 1. فك تشفير التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // 2. تحقق من أن كلمة السر مختلفة
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different" });
    }

    // 3. عيّن الباسورد الجديد واحذف التوكن
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password", error: err.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // إخفاء كلمة السر
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};
exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // أنشئ مستخدم جديد
      user = new User({
        username: email.split('@')[0],
        email,
        fullName: name,
        profileImage: picture,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // باسورد عشوائي
        role: 'user'
      });

      await user.save();
    }

    // أنشئ JWT token
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
};

