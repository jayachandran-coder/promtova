const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { 
  toggleLikePrompt, 
  toggleSavePrompt, 
  getSavedPrompts 
} = require('../controllers/userInteractionController');
const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('image'), updateUserProfile);
router.post('/like/:id', protect, toggleLikePrompt);
router.post('/save/:id', protect, toggleSavePrompt);
router.get('/saved', protect, getSavedPrompts);

module.exports = router;
