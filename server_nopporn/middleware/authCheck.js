// authCheck.js (CommonJS)
const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');

exports.authCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.SECRET); // ✅ จะ throw ถ้า token หมดอายุ
    req.user = decoded;

    const user = await prisma.user.findFirst({
      where: { email: decoded?.email }
    });
    if (!user) return res.status(401).json({ message: 'Account not found' });
    if (user.enabled === false)
      return res.status(403).json({ message: 'This account cannot access' });

    req.user.role = user.role;
    next();
  } catch (err) {
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Token invalid' });
  }
};


exports.allowRoles = (...allowed) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.email) return res.status(401).json({ message: 'Unauthenticated' });

      const user = await prisma.user.findFirst({
        where: { email: req.user.email },
        select: { role: true, enabled: true },
      });
      if (!user || user.enabled === false) {
        return res.status(403).json({ message: 'This account cannot access' });
      }

      if (!allowed.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient role' });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

exports.adminOnly = exports.allowRoles('admin');
exports.staffOnly = exports.allowRoles('admin', 'employee'); // ✅ ให้ admin & employee เข้าได้
