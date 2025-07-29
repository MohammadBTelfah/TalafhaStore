const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const passport = require('passport'); // Using passport directly
const auth = require('../middleware/authMiddleware'); // Auth middleware for normal users
const AdminAuth = require('../middleware/adminAuth'); // Middleware to ensure admin role
const uploader = require('../middleware/upload'); // For handling profile image uploads

// ✅ Register new user
router.post('/register', uploader.single('profileImage'), userController.register);

// ✅ Login
router.post('/login', userController.login);

// ✅ Get user profile
router.get('/profile', auth, userController.getUserProfile);

// ✅ Update user profile (including profile image)
router.put('/profile', auth, uploader.single('profileImage'), userController.updateUserProfile);

// ✅ Request password reset
router.post('/reset-password/request', userController.requestPasswordReset);

// ✅ Reset password
router.post('/reset-password', userController.resetPassword);

// ✅ Email verification after registration
router.get('/verify-email', userController.verifyEmail);

// ✅ Change password (while logged in)
router.post('/change-password', auth, userController.changePassword);

// ✅ Delete user account
router.delete('/delete', auth, userController.deleteUser);

// ✅ Get all users (admin only)
router.get('/get-all', AdminAuth, userController.getAllUsers);

// ✅ Login with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ✅ Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // On successful authentication, respond with user data (or send a token if needed)
    res.status(200).json({ message: 'Google login successful', user: req.user });
  }
);

module.exports = router;
