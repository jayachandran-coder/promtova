const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getPrompts, 
  searchPrompts,
  getPromptById, 
  createPrompt, 
  updatePrompt, 
  deletePrompt,
  getAnalytics,
  trackInteraction,
  getTrendingPrompts,
  getMostLikedPrompts,
  getRecommendedPrompts,
  getFeaturedCategories,
  getBestPrompts,
  getFeedPrompts
} = require('../controllers/promptController');


const { protectAdmin } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware'); 
const { optionalProtect } = require('../middleware/optionalAuthMiddleware');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', getPrompts);
router.get('/search', searchPrompts);
router.get('/feed', getFeedPrompts);
router.get('/trending', getTrendingPrompts);
router.get('/most-liked', getMostLikedPrompts);
router.get('/recommended', optionalProtect, getRecommendedPrompts);
router.get('/featured-categories', getFeaturedCategories);
router.get('/best', getBestPrompts);
router.get('/stats', protectAdmin, getAnalytics);
router.get('/:id', getPromptById);


router.post('/:id/track', optionalProtect, trackInteraction);
router.post('/', protectAdmin, upload.single('image'), createPrompt);
router.put('/:id', protectAdmin, updatePrompt);
router.delete('/:id', protectAdmin, deletePrompt);

module.exports = router;
