const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const AdminAuth = require('../middleware/adminAuth');

// ✅ Create category
router.post('/create', AdminAuth, categoryController.createCategory);
// ✅ Get all categories
router.get('/getAll', categoryController.getAllCategories);
// ✅ Get category by ID
router.get('/getbyid/:id', categoryController.getCategoryById);
// ✅ Update category
router.put('/update/:id', AdminAuth, categoryController.updateCategory);
// ✅ Delete category
router.delete('/delete/:id', AdminAuth, categoryController.deleteCategory);

module.exports = router;