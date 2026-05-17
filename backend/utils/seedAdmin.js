/**
 * Admin seed script — creates the default admin if none exists.
 * Run once: node utils/seedAdmin.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const Admin = require('../models/Admin');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  const exists = await Admin.findOne({ adminId: process.env.DEFAULT_ADMIN_ID || 'promptova_admin' });
  if (exists) {
    console.log('Admin already exists. Skipping seed.');
    process.exit(0);
  }

  await Admin.create({
    adminId: process.env.DEFAULT_ADMIN_ID || 'promptova_admin',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026!'
  });

  console.log('✅ Default admin created successfully.');
  console.log('   Admin ID  :', process.env.DEFAULT_ADMIN_ID || 'promptova_admin');
  console.log('   Password  :', process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
