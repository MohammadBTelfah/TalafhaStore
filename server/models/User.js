const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false,
    default: '0000000000'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: ''
  },

  // ✅ الحقول الجديدة
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },

  verified: {
  type: Boolean,
  default: false
},
verifyToken: {
  type: String,
  default: null
}


}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
