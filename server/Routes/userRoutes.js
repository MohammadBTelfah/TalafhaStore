const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const auth = require('../middleware/authMiddleware'); // Auth middleware for normal users
const AdminAuth = require('../middleware/adminAuth'); // Middleware to ensure admin role
const multer = require('multer'); // For handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// ✅ Register new user
router.post('/register', upload.single('profileImage'), userController.register);
// ✅ Login
router.post('/login', userController.login);

// ✅ Get user profile
router.get('/profile', auth, userController.getUserProfile);

// ✅ Update user profile (including profile image)
router.put('/update-profile', auth, upload.single('profileImage'), userController.updateProfile);
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
router.post('/google-login', userController.googleLogin);

module.exports = router;
