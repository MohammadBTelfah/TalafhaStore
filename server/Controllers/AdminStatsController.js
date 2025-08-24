// controllers/AdminStatsController.js
const Orders = require("../models/Orders");
const Product = require("../models/Products"); // غيّر المسار حسب مشروعك
const User = require("../models/User");       // غيّر المسار حسب مشروعك
const { Types } = require("mongoose");

/* Helper: parse ?range=30d / 12w / 6m (افتراضي 30d) */
function parseRangeToDate(range) {
  const now = new Date();
  const m = String(range || "30d").match(/^(\d+)([dwm])$/i);
  if (!m) return new Date(now.getTime() - 30 * 864e5);
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const days = unit === "d" ? n : unit === "w" ? n * 7 : unit === "m" ? n * 30 : 30;
  return new Date(now.getTime() - days * 864e5);
}

/* ===== /summary =====
   - usersTotal / usersNew7d
   - ordersTotal
   - revenueTotal (من العناصر)
   - revenue7d (آخر 7 أيام)
   - productsTotal / outOfStock
*/
// GET /api/admin/stats/summary
exports.summary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 864e5);

    const [usersTotal, usersNew7d, ordersTotal, productsTotal, outOfStock] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Orders.countDocuments({}),
        Product.countDocuments({}),
        Product.countDocuments({ prodStock: { $lte: 0 } }),
      ]);

    // إجمالي الإيراد الكلي
    const revenueAgg = await Orders.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          lineRevenue: {
            $multiply: [
              {
                $toDouble: {
                  $ifNull: [
                    "$items.quantity",
                    { $ifNull: ["$items.qty", { $ifNull: ["$items.count", 0] }] },
                  ],
                },
              },
              {
                $toDouble: {
                  $ifNull: [
                    "$items.price",
                    { $ifNull: ["$p.prodPrice", { $ifNull: ["$p.price", 0] }] },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          revenueTotal: { $sum: "$lineRevenue" },
        },
      },
    ]);

    // الإيراد خلال آخر 7 أيام
    const revenue7dAgg = await Orders.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          lineRevenue: {
            $multiply: [
              {
                $toDouble: {
                  $ifNull: [
                    "$items.quantity",
                    { $ifNull: ["$items.qty", { $ifNull: ["$items.count", 0] }] },
                  ],
                },
              },
              {
                $toDouble: {
                  $ifNull: [
                    "$items.price",
                    { $ifNull: ["$p.prodPrice", { $ifNull: ["$p.price", 0] }] },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue7d: { $sum: "$lineRevenue" },
        },
      },
    ]);

    res.json({
      usersTotal,
      usersNew7d,
      ordersTotal,
      revenueTotal: Number(revenueAgg[0]?.revenueTotal || 0),
      revenue7d: Number(revenue7dAgg[0]?.revenue7d || 0),
      productsTotal,
      outOfStock,
    });
  } catch (err) {
    res.status(500).json({ message: "Error building summary", error: err.message });
  }
};

/* ===== /sales-timeseries?range=30d =====
   يرجّع [{ date: 'YYYY-MM-DD', orders, revenue }]
*/
exports.salesTimeseries = async (req, res) => {
  try {
    const from = parseRangeToDate(req.query.range);

    // لتجنب عدّ الطلبات أكثر من مرة بعد الـ $unwind:
    // 1) أضيف تاريخ كسلسلة
    // 2) أفك العناصر + أجيب السعر
    // 3) أجمع لكل (order,date) revenue
    // 4) أجمع لكل date: مجموع الإيراد + عدد الطلبات (distinct)
    const rows = await Orders.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $addFields: {
          day: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          lineRevenue: {
            $multiply: [
              { $toDouble: { $ifNull: ["$items.qty", 0] } },
              { $toDouble: { $ifNull: ["$p.prodPrice", 0] } },
            ],
          },
        },
      },
      {
        $group: {
          _id: { day: "$day", order: "$_id" },
          revenuePerOrder: { $sum: "$lineRevenue" },
        },
      },
      {
        $group: {
          _id: "$_id.day",
          orders: { $sum: 1 },
          revenue: { $sum: "$revenuePerOrder" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", orders: 1, revenue: 1 } },
    ]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error building time series", error: err.message });
  }
};

/* ===== /orders-by-status =====
   يرجّع counts ككائن
*/
exports.ordersByStatus = async (req, res) => {
  try {
    const rows = await Orders.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const out = { pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 };
    rows.forEach((r) => { if (r?._id) out[r._id] = r.count; });
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: "Error grouping by status", error: err.message });
  }
};

/* ===== /top-products?limit=5 =====
   يرجّع [{productId, prodName, prodImage, totalQty, revenue}]
*/
// GET /api/admin/stats/top-products?limit=5
exports.topProducts = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 5, 50));

    const rows = await Orders.aggregate([
      // كل عنصر طلب كسطر مستقل
      { $unwind: "$items" },

      // نجيب بيانات المنتج (الاسم/الصورة/السعر)
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "p",
        },
      },
      { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },

      // نحسب الكمية والسعر مع أخذ جميع التسميات المحتملة بالحسبان:
      // quantity أولاً، ثم qty ثم count
      // السعر: items.price (لو مخزّن وقت الطلب) وإلا prodPrice ثم price من المنتج
      {
        $addFields: {
          lineQty: {
            $toDouble: {
              $ifNull: [
                "$items.quantity",
                { $ifNull: ["$items.qty", { $ifNull: ["$items.count", 0] }] },
              ],
            },
          },
          unitPrice: {
            $toDouble: {
              $ifNull: [
                "$items.price",
                { $ifNull: ["$p.prodPrice", { $ifNull: ["$p.price", 0] }] },
              ],
            },
          },
        },
      },
      { $addFields: { lineRevenue: { $multiply: ["$lineQty", "$unitPrice"] } } },

      // نجمع على مستوى المنتج
      {
        $group: {
          _id: "$items.product",
          totalQty: { $sum: "$lineQty" },
          revenue: { $sum: "$lineRevenue" },
          anyProd: { $first: "$p" }, // نأخذ أول سجل منتج لاسم/صورة
        },
      },

      // الأكثر طلباً
      { $sort: { totalQty: -1 } },
      { $limit: limit },

      // الإخراج النهائي
      {
        $project: {
          _id: 0,
          productId: "$_id",
          prodName: "$anyProd.prodName",
          prodImage: "$anyProd.prodImage",
          totalQty: 1,
          revenue: 1,
          prodStock: "$anyProd.prodStock" // المخزون المتبقي

        },
      },
    ]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error building top products", error: err.message });
  }
};

/* ===== /recent-orders?limit=8 =====
   يرجّع أحدث الطلبات مع معلومات مختصرة
*/
exports.recentOrders = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 8, 50));
    const rows = await Orders.find({}, { items: 0 }) // مش ضروري العناصر هون
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name fullName email")
      .lean();

    // لو بدك تتأكد من وجود total، خليه رقم
    const cleaned = rows.map((o) => ({
      ...o,
      total: Number(o.total || 0),
    }));

    res.json(cleaned);
  } catch (err) {
    res.status(500).json({ message: "Error reading recent orders", error: err.message });
  }
};
