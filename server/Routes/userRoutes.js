const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');

const userController = require('../Controllers/userController');
const auth = require('../middleware/authMiddleware');
const AdminAuth = require('../middleware/adminAuth');

// إعدادات رفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
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
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  async (req, res) => {
    try {
      const jwt = require('jsonwebtoken');
      const jwtToken = jwt.sign(
        { id: req.user._id, role: req.user.role }, // ✅ ضفنا الدور داخل التوكن أيضاً
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1d' }
      );

      const role = req.user.role || 'user';

      // ✅ إعادة التوجيه مع التوكن والدور
      const redirectURL = `http://localhost:3000/oauth-success?token=${jwtToken}&role=${role}`;
      res.redirect(redirectURL);
    } catch (err) {
      console.error('🔴 Redirect error after Google login:', err);
      res.redirect('http://localhost:3000/login');
    }
  }
);


module.exports = router;
