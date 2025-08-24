// routes/adminStatsRoutes.js
const router = require('express').Router();
const AdminAuth = require('../middleware/adminAuth');
const AdminStatsController = require('../Controllers/AdminStatsController');

router.get('/summary', AdminAuth, AdminStatsController.summary);
router.get('/sales-timeseries', AdminAuth, AdminStatsController.salesTimeseries);
router.get('/orders-by-status', AdminAuth, AdminStatsController.ordersByStatus);
router.get('/top-products', AdminAuth, AdminStatsController.topProducts);
router.get('/recent-orders', AdminAuth, AdminStatsController.recentOrders);

module.exports = router;
