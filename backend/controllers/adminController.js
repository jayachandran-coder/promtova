const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const generateAdminToken = (id) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ─────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────
const adminLogin = async (req, res) => {
  const { adminId, password } = req.body;

  if (!adminId || !password)
    return res.status(400).json({ message: 'Admin ID and password are required.' });

  try {
    const admin = await Admin.findOne({ adminId });

    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid Admin ID or password.' });

    res.json({
      token: generateAdminToken(admin._id),
      adminId: admin.adminId
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/profile   (protected)
// ─────────────────────────────────────────────
const getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');
  if (!admin) return res.status(404).json({ message: 'Admin not found.' });
  res.json({ adminId: admin.adminId });
};

// ─────────────────────────────────────────────
// PUT /api/admin/credentials   (protected)
// ─────────────────────────────────────────────
const updateAdminCredentials = async (req, res) => {
  const { currentPassword, newAdminId, newPassword, confirmPassword } = req.body;

  if (!currentPassword)
    return res.status(400).json({ message: 'Current password is required.' });

  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    const passwordMatch = await admin.matchPassword(currentPassword);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Current password is incorrect.' });

    // Validate new admin ID uniqueness (if changed)
    if (newAdminId && newAdminId !== admin.adminId) {
      const exists = await Admin.findOne({ adminId: newAdminId });
      if (exists)
        return res.status(400).json({ message: 'That Admin ID is already taken.' });
      admin.adminId = newAdminId;
    }

    // Validate new password
    if (newPassword) {
      if (newPassword.length < 8)
        return res.status(400).json({ message: 'New password must be at least 8 characters.' });
      if (newPassword !== confirmPassword)
        return res.status(400).json({ message: 'New passwords do not match.' });
      admin.password = newPassword; // pre-save hook hashes it
    }

    await admin.save();

    // Re-issue a fresh token (adminId may have changed)
    const token = generateAdminToken(admin._id);
    res.json({ message: 'Credentials updated successfully.', token, adminId: admin.adminId });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating credentials.' });
  }
};

const seedAdmin = async (req, res) => {
  try {
    const adminId = process.env.DEFAULT_ADMIN_ID || 'promptova_admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026!';

    const exists = await Admin.findOne({ adminId });
    if (exists) {
      return res.status(200).json({ message: 'Admin already exists.', adminId });
    }

    await Admin.create({ adminId, password });

    res.status(201).json({
      message: '✅ Default admin created successfully.',
      adminId,
      password: 'Check .env file'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding admin.', error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/reset  — DELETES all admins and recreates from .env
// ─────────────────────────────────────────────
const resetAdmin = async (req, res) => {
  try {
    const adminId = process.env.DEFAULT_ADMIN_ID || 'promptova_admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026!';

    const deleted = await Admin.deleteMany({});

    const newAdmin = await Admin.create({ adminId, password });

    res.status(201).json({
      message: '✅ Admin reset successfully. You can now log in.',
      adminId,
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026!'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting admin.', error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/users   (protected)
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/admin/users/:id   (protected)
// ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user.' });
  }
};

module.exports = { 
  adminLogin, 
  getAdminProfile, 
  updateAdminCredentials, 
  seedAdmin, 
  resetAdmin,
  getAllUsers,
  deleteUser
};
