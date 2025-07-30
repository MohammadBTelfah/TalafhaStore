const express = require('express');
const router = express.Router();
const passport = require('passport');
const generateToken = require('../utils/generateToken');
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
router.get('/profile', auth, userController.getUserProfile);
router.put('/update-profile', auth, upload.single('profileImage'), userController.updateUserProfile);
router.post('/change-password', auth, userController.changePassword);
router.delete('/delete', auth, userController.deleteUser);

/* ========== ✅ Password Reset & Email ========== */
router.post('/reset-password/request', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);
router.get('/verify-email', userController.verifyEmail);

/* ========== ✅ Admin ========== */
router.get('/get-all', AdminAuth, userController.getAllUsers);

/* ========== ✅ Google Login ========== */
// 1. بدء المصادقة مع Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. بعد المصادقة، استلام البيانات والرد
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  async (req, res) => {
    try {
      // ✅ تأكد إنه فيه req.user
      if (!req.user) {
        return res.redirect('http://localhost:3000/login?error=GoogleAuthFailed');
      }

      // ✅ إنشاء التوكن
      const token = generateToken(req.user._id);
      const role = req.user.role;

      // ✅ إرسالهم بالرابط لفرونت إند
      res.redirect(`http://localhost:3000/success?token=${token}&role=${role}`);
    } catch (error) {
      console.error('Google Auth error:', error);
      res.redirect('http://localhost:3000/login?error=GoogleAuthError');
    }
  }
);


module.exports = router;
