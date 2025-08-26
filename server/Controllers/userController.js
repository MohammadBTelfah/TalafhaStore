const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require("../utils/sendEmail"); // تأكد من وجودها
const cloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}


exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // ✅ تحقق إذا المستخدم موجود
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    // ✅ تحقق من صيغة الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    // ✅ تحقق من قوة كلمة المرور
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must include at least one uppercase, one lowercase, one number, and be at least 8 characters long.'
      });
    }

    // ✅ تشفير كلمة السر
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ تجهيز رابط صورة الحساب (إن وُجدت) كرابط كامل
   let profileImage = '';
if (req.file?.buffer) {
  const result = await uploadToCloudinary(req.file.buffer, 'talafha/avatars');
  profileImage = result.secure_url;
}


    // ✅ إنشاء المستخدم
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      profileImage, // ← صار URL كامل جاهز للعرض
    });

    // ✅ إنشاء توكن التحقق
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    user.verifyToken = token;

    await user.save();

    // ✅ تحديد رابط الواجهة
    const clientURL = process.env.FRONTEND_URL || 'http://localhost:3000';

    // ✅ رابط التفعيل
    const verificationUrl = `${clientURL}/verify-email?token=${token}`;

    const html = `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your account:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - TalafhaStore',
      html,
    });

    // ✅ الرد
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage, // (URL)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // ✅ تحقق إذا الحساب مفعل
    if (!user.verified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    // ✅ تحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ إنشاء التوكن وفيه الدور
    const token = jwt.sign(
      { id: user._id, role: user.role }, // ← لازم تتأكد إنها هيك
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    // ✅ إرسال الرد
    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role, // ← ضروري ترجع الدور هون
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role, // ← ممكن تستخدمه بالفرونت
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

    // 🔗 حضّر معلومات البروتوكول/الدومين (تدعم البروكسي)
if (req.file?.buffer) {
  const result = await uploadToCloudinary(req.file.buffer, 'talafha/avatars');
  user.profileImage = result.secure_url;
}

    await user.save();

    // ✅ تجهيز ردّ آمن + ضمان إرجاع URL كامل لو كان قديمًا filename فقط
    const safeUser = user.toObject();
    delete safeUser.password;

    if (safeUser.profileImage && !String(safeUser.profileImage).startsWith("http")) {
      safeUser.profileImage = `${protocol}://${host}/uploads/${String(safeUser.profileImage).replace(/\\/g, "/")}`;
    }

    return res.status(200).json({ message: "User profile updated", user: safeUser });
  } catch (err) {
    console.error("updateUserProfile error:", err);
    return res.status(500).json({ message: "Error", error: err.message });
  }
};

//delete user 
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id); // ← الحل الصحيح

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


exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // ✅ ما تكشف إذا الإيميل موجود أو لا
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link will be sent.",
      });
    }

    // ✅ أنشئ توكن قصير العمر
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "15m" }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 دقيقة
    await user.save();

    // ✅ خذ الرابط من env
    const clientURL = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${clientURL}/reset-password?token=${resetToken}`;

    const message = `
      <h3>Reset Your Password</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset - TalafhaStore",
      html: message,
    });

    res.status(200).json({
      message: "If this email exists, a reset link will be sent.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error requesting password reset",
      error: err.message,
    });
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
// ✅ التحقق من صلاحية توكن إعادة تعيين الباسورد
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ valid: false });

    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(400).json({ valid: false });
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
      // ✅ أنشئ مستخدم جديد
      user = new User({
        username: email.split('@')[0],
        email,
        fullName: name,
        profileImage: picture,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        role: 'user', // ← هون تقدر تغيرها لـ 'admin' لو بدك
        verified: true
      });

      await user.save();
    } else if (!user.verified) {
      user.verified = true;
      await user.save();
    }

    // ✅ تأكد إنك تجيب الدور الصحيح قبل إنشاء التوكن
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role }, // ← هاي السطر المهم
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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


exports.googleCallback = async (req, res) => {
  try {
    const { displayName = '', emails = [], photos = [] } = req.user || {};
    const email = emails[0]?.value;
    const picture = photos[0]?.value || '';

    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // اسم مستخدم مقصوص ومبسّط
      const baseUsername = displayName.toLowerCase().replace(/\s+/g, '') || email.split('@')[0];
      let username = baseUsername;
      let n = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${n++}`;
      }

      user = new User({
        username,
        email,
        firstName: displayName.split(' ')[0] || '',
        lastName: displayName.split(' ')[1] || '',
        profileImage: picture,
        role: 'user',
        password: 'GoogleOAuthUser',   // مش مستخدم فعليًا للتسجيل بالدخول
        verified: true
      });

      await user.save();
    } else {
      // فعّل وحسّن البروفايل لو ناقص
      let changed = false;
      if (!user.verified) { user.verified = true; changed = true; }
      if (!user.profileImage && picture) { user.profileImage = picture; changed = true; }
      if (changed) await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // استخدم عنوان الفرونت من env
    const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

    // مهم ترميز القيم
    const redirectUrl = `${CLIENT_URL}/google-success` +
      `?token=${encodeURIComponent(token)}` +
      `&role=${encodeURIComponent(user.role)}` +
      `&name=${encodeURIComponent(user.firstName || '')}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Google login failed' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.verified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (user.verifyToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.verified = true;
    user.verifyToken = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};
// 🔍 Check if username already exists
exports.checkUsername = async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length < 4) {
    return res.json({ available: true }); // ما نتحقق إذا أقل من 4 حروف
  }

  try {
    const user = await User.findOne({ username: username.trim() });
    res.json({ available: !user }); // موجود = false
  } catch (err) {
    console.log(error)
    console.error('Username check error:', err.message);
    res.status(500).json({ available: false });
  }
};
exports.updateAnyUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, fullName, phone, role } = req.body;

    const updateData = {
      username,
      email,
      fullName,
      phone,
      role
    };

   if (req.file?.buffer) {
  const result = await uploadToCloudinary(req.file.buffer, 'talafha/avatars');
  updateData.profileImage = result.secure_url;
}


    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
};
