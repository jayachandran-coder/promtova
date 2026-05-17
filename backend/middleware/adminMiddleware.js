const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'admin')
        return res.status(403).json({ message: 'Access denied. Admins only.' });

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin)
        return res.status(401).json({ message: 'Admin account not found.' });

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token invalid.' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token.' });
  }
};

module.exports = { protectAdmin };
