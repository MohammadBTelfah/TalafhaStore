const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  prodName: { type: String, required: true },
  prodImage: { type: String, required: true }, // صورة أساسية
  prodPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // خصم (اختياري)
  prodDescription: { type: String, required: true },
  prodCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  prodBrand: { type: String }, // ماركة أو اسم تجاري
  prodStock: { type: Number, required: true, default: 0 },
  prodRating: { type: Number, default: 0 },
  prodReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
