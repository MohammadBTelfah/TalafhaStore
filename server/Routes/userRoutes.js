const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const userController = require('../Controllers/userController');
const auth = require('../middleware/authMiddleware');
const AdminAuth = require('../middleware/adminAuth');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// إعدادات رفع الصور
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// 📌 إنشاء المجلد إذا مش موجود
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .trim()
      .replace(/\s+/g, '-')      // استبدال الفراغات بـ -
      .replace(/[^a-zA-Z0-9-_]/g, ''); // منع الرموز الغريبة
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({ storage });


/* ========== ✅ Auth Routes ========== */
router.post('/register', upload.single('profileImage'), userController.register);
router.post('/login', userController.login);
router.get('/profile', auth , userController.getUserProfile);
router.put('/update-profile', auth, upload.single('profileImage'), userController.updateUserProfile);
router.post('/change-password', auth, userController.changePassword);
router.delete('/delete/:id', auth, userController.deleteUser);
router.post('/check-username', userController.checkUsername);
router.get('/get-all-user', AdminAuth, userController.getAllUsers);
router.put('/update/:id', AdminAuth, upload.single('profileImage'), userController.updateAnyUserByAdmin);



/* ========== ✅ Password Reset & Email ========== */
// طلب رابط إعادة تعيين الباسورد
router.post('/request-password-reset', userController.requestPasswordReset);

// تنفيذ إعادة تعيين الباسورد
router.post('/reset-password', userController.resetPassword);

router.post('/verify-reset-token', userController.verifyResetToken);

router.get('/verify-email', userController.verifyEmail);



/* ========== ✅ Admin ========== */
router.get('/get-all', AdminAuth, userController.getAllUsers);

/* ========== ✅ Google Login ========== */
// 1. بدء المصادقة مع Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. بعد المصادقة، استلام البيانات والرد
// بعد المصادقة
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login`,
    session: false, // اختياري إذا ما بتستخدم جلسات
  }),
  async (req, res) => {
    try {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const role = req.user.role || 'user';
      // وجه للفرونت (Vercel بالإنتاج)
      res.redirect(`${FRONTEND_URL}/oauth-success?token=${encodeURIComponent(token)}&role=${role}`);
    } catch (err) {
      console.error('🔴 Redirect error after Google login:', err);
      res.redirect(`${FRONTEND_URL}/login`);
    }
  }
);



module.exports = router;
