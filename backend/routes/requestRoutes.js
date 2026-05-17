const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  getRequestById,
  updateRequest,
  deleteRequest,
  likeRequest,
  addComment,
  fulfillRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { optionalProtect } = require('../middleware/optionalAuthMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
  .get(optionalProtect, getRequests)
  .post(protect, upload.single('image'), createRequest);

router.route('/:id')
  .get(optionalProtect, getRequestById)
  .put(protectAdmin, updateRequest) // Admin can update status
  .delete(protectAdmin, deleteRequest);

router.post('/:id/like', protect, likeRequest);
router.post('/:id/comment', protect, addComment);
router.post('/:id/fulfill', protectAdmin, fulfillRequest);

module.exports = router;
