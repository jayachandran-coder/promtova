const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  updateAdminCredentials,
  seedAdmin,
  resetAdmin,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public
router.post('/login', adminLogin);
router.get('/seed', seedAdmin);     // Create admin if not exists
router.get('/reset', resetAdmin);   // ⚠️ DELETES & recreates admin from .env

// Protected
router.get('/profile', protectAdmin, getAdminProfile);
router.put('/credentials', protectAdmin, updateAdminCredentials);
router.get('/users', protectAdmin, getAllUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

module.exports = router;
