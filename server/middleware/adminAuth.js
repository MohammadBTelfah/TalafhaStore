const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // حفظ بيانات المستخدم في req.user
    req.user = {
      _id: decoded.id,
      role: decoded.role
    };

    // التحقق من الصلاحية
    if (decoded.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied, admins only' });
    }

    next();
  } catch (err) {
    return res.status(400).json({ msg: 'Invalid token', error: err.message });
  }
};

module.exports = adminAuth;
