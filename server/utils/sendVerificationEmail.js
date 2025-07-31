const jwt = require('jsonwebtoken');
const sendEmail = require('./sendEmail');

const sendVerificationEmail = async (user) => {
  // إنشاء التوكن
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // ينتهي بعد يوم
  );

  // حفظ التوكن في قاعدة البيانات
  user.verifyToken = token;
  await user.save();

  // رابط التفعيل
  const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

  // محتوى الإيميل
  const html = `
    <h2>Hello ${user.fullName},</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationLink}" target="_blank" style="padding:10px 20px;background:#28a745;color:white;border-radius:5px;text-decoration:none;">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
  `;

  // إرسال الإيميل
  await sendEmail(user.email, 'Verify Your Email', html);
};

module.exports = sendVerificationEmail;
