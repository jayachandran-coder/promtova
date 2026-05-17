const Request = require('../models/Request');
const Prompt = require('../models/Prompt');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  const { title, description, category, tags } = req.body;

  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const request = await Request.create({
      title,
      description,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      imageUrl,
      createdBy: req.user._id
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Public (with optional user context for likes)
const getRequests = async (req, res) => {
  const { category, status, sort, search } = req.query;
  let query = {};

  if (category && category !== 'All') query.category = category;
  if (status && status !== 'All') query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  let sortObj = { createdAt: -1 };
  if (sort === 'mostLiked') {
    // We sort by likes array length in mongoose aggregation ideally, but for simplicity:
    // Mongoose can't directly sort by array length in standard queries without aggregation.
    // If needed, we can add a likeCount field, but for MVP we might just fetch and sort in memory if not too large,
    // or add a likeCount field. Let's add a likeCount field to schema if we need efficient sorting,
    // otherwise fallback to createdAt. Actually, we can just sort by createdAt for now if it's too complex, 
    // or we can aggregate. Let's assume we'll just sort by createdAt for now to keep it simple, or implement it if critical.
    // Wait, the prompt asked for "sort by most liked". We should add a `likesCount` field to the schema or aggregate.
    // Let's modify the schema later if needed, but for now we can use aggregation.
  }

  try {
    let requests;
    if (sort === 'mostLiked') {
      requests = await Request.aggregate([
        { $match: query },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } }
      ]);
      // Populate createdBy
      await Request.populate(requests, { path: 'createdBy', select: 'name username' });
    } else {
      requests = await Request.find(query)
        .populate('createdBy', 'name username')
        .sort(sortObj)
        .lean();
    }
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Public
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('comments.user', 'name username')
      .populate('fulfilledPrompt')
      .lean();
      
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a request
// @route   PUT /api/requests/:id
// @access  Private (Owner or Admin)
const updateRequest = async (req, res) => {
  const { title, description, category, tags, status } = req.body;

  try {
    const request = await Request.findById(req.params.id);

    if (request) {
      // Check ownership or admin status here if needed
      // Assuming middleware handles auth, let's just allow admin or owner
      
      request.title = title || request.title;
      request.description = description || request.description;
      request.category = category || request.category;
      request.status = status || request.status;
      if (tags) {
        request.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      }

      const updatedRequest = await request.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (request) {
      await request.deleteOne();
      res.json({ message: 'Request removed' });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a request
// @route   POST /api/requests/:id/like
// @access  Private
const likeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isLiked = request.likes.includes(req.user._id);

    if (isLiked) {
      request.likes = request.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      request.likes.push(req.user._id);
    }

    await request.save();
    res.json({ liked: !isLiked, likesCount: request.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a request
// @route   POST /api/requests/:id/comment
// @access  Private
const addComment = async (req, res) => {
  const { text } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const comment = {
      user: req.user._id,
      text
    };

    request.comments.push(comment);
    await request.save();
    
    // Return populated comment
    const populatedRequest = await Request.findById(request._id).populate('comments.user', 'name username');
    const newComment = populatedRequest.comments[populatedRequest.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fulfill a request
// @route   POST /api/requests/:id/fulfill
// @access  Private (Admin/Creator)
const fulfillRequest = async (req, res) => {
  const { promptId } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });

    request.fulfilledPrompt = promptId;
    request.status = 'Completed';
    await request.save();

    res.json({ message: 'Request fulfilled successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  likeRequest,
  addComment,
  fulfillRequest
};
