const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
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
    default: '0000000000' // رقم وهمي، يجب تغييره لاحقاً من الواجهة
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'admin'
  },
  profileImage: {
    type: String,
    default: '' // صورة افتراضية إن لزم
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
