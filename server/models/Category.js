const mongoose = require('mongoose');
const Product = require('./Products'); 

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

// ✅ حذف المنتجات المرتبطة عند حذف التصنيف
categorySchema.pre('findOneAndDelete', async function (next) {
  const categoryId = this.getQuery()["_id"];
  await Product.deleteMany({ prodCategory: categoryId });
  next();
});

module.exports = mongoose.model('Category', categorySchema);
