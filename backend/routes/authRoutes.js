const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  firebaseSync
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/firebase-sync', firebaseSync);
router.get('/profile', protect, getUserProfile);

module.exports = router;
