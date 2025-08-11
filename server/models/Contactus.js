const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200, index: true },
  phone: { type: String, trim: true, maxlength: 25, default: '' },
  subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  status: { type: String, enum: ['new', 'read', 'closed'], default: 'new', index: true },
  source: { type: String, default: 'web' },
  ip: String,
  userAgent: String,
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
