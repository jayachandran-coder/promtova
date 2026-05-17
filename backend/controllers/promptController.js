const mongoose = require('mongoose');
const Prompt = require('../models/Prompt');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');

// ── SEO slug generator: "Cyberpunk City Night" → "cyberpunk-city-night" ──────
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .substring(0, 80);               // max 80 chars
};

// @desc    Get all prompts (with optional category + search filter)
// @route   GET /api/prompts
// @access  Public
const getPrompts = async (req, res) => {
  const { category, search, excludeId, page = 1, limit = 20 } = req.query;
  let query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: regex },
      { category: regex },
      { tags: { $in: [regex] } },
      { prompt: regex }
    ];
  }

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const sortOrder = search
    ? { engagementScore: -1, createdAt: -1 }
    : { engagementScore: -1, createdAt: -1 };

  try {
    const skip = (page - 1) * parseInt(limit);
    const prompts = await Prompt.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search prompts by query (title, category, tags)
// @route   GET /api/prompts/search?q=
// @access  Public
const searchPrompts = async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || !q.trim()) {
    return res.json([]);
  }

  try {
    const regex = new RegExp(q.trim(), 'i');
    const skip = (page - 1) * parseInt(limit);

    const prompts = await Prompt.find({
      $or: [
        { title: regex },
        { category: regex },
        { tags: { $in: [regex] } },
        { prompt: regex }
      ]
    })
      .sort({ engagementScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get viral feed (sorted by engagement: copies*3 + likes*2 + saves)
// @route   GET /api/prompts/feed
// @access  Public
const getFeedPrompts = async (req, res) => {
  const { excludeId, page = 1, limit = 12 } = req.query;
  try {
    const skip = (page - 1) * parseInt(limit);
    const matchQuery = {};
    if (excludeId) matchQuery._id = { $ne: new mongoose.Types.ObjectId(excludeId) };

    const prompts = await Prompt.aggregate([
      ...(excludeId ? [{ $match: matchQuery }] : []),
      {
        $addFields: {
          computedScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$copies', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$likes', 0] }, 2] },
              { $ifNull: ['$saves', 0] }
            ]
          }
        }
      },
      { $sort: { computedScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single prompt
// @route   GET /api/prompts/:id
// @access  Public
const getPromptById = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id).lean();
    if (prompt) {
      res.json(prompt);
    } else {
      res.status(404).json({ message: 'Prompt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a prompt
// @route   POST /api/prompts
// @access  Private/Admin
const createPrompt = async (req, res) => {
  const { title, prompt, category, tags } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image' });
  }

  try {
    const imageUrl = await uploadToCloudinary(req.file.buffer);
    const baseSlug = generateSlug(title);
    // Ensure unique slug by appending timestamp if needed
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const newPrompt = await Prompt.create({
      title,
      slug,
      prompt,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imageUrl
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a prompt
// @route   PUT /api/prompts/:id
// @access  Private/Admin
const updatePrompt = async (req, res) => {
  const { title, prompt, category, tags } = req.body;

  try {
    const promptToUpdate = await Prompt.findById(req.params.id);

    if (promptToUpdate) {
      promptToUpdate.title = title || promptToUpdate.title;
      promptToUpdate.prompt = prompt || promptToUpdate.prompt;
      promptToUpdate.category = category || promptToUpdate.category;
      if (tags) {
        promptToUpdate.tags = tags.split(',').map(tag => tag.trim());
      }

      const updatedPrompt = await promptToUpdate.save();
      res.json(updatedPrompt);
    } else {
      res.status(404).json({ message: 'Prompt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a prompt
// @route   DELETE /api/prompts/:id
// @access  Private/Admin
const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    if (prompt) {
      await prompt.deleteOne();
      res.json({ message: 'Prompt removed' });
    } else {
      res.status(404).json({ message: 'Prompt not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track interaction (view, copy, like, save)
// @route   POST /api/prompts/:id/track
// @access  Public
const trackInteraction = async (req, res) => {
  const { action } = req.body;
  const promptId = req.params.id;
  const userId = req.user ? req.user._id : null;

  try {
    const update = {};
    if (action === 'view') update.views = 1;
    if (action === 'copy') update.copies = 1;
    if (action === 'like') update.likes = 1;
    if (action === 'save') update.saves = 1;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const prompt = await Prompt.findByIdAndUpdate(
      promptId,
      { $inc: update },
      { new: true }
    );

    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });

    // Recalculate engagement score: copies*3 + likes*2 + saves
    const newEngagementScore =
      (prompt.copies || 0) * 3 +
      (prompt.likes || 0) * 2 +
      (prompt.saves || 0);

    // Update trendingScore (all metrics) and engagementScore
    prompt.trendingScore = (prompt.likes || 0) + (prompt.views || 0) + (prompt.copies || 0) + (prompt.saves || 0);
    prompt.engagementScore = newEngagementScore;
    await prompt.save();

    // Log activity
    await Activity.create({
      user: userId,
      prompt: promptId,
      action,
      category: prompt.category
    });

    res.json({ success: true, copies: prompt.copies, engagementScore: newEngagementScore, trendingScore: prompt.trendingScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending prompts (Most Copied)
// @route   GET /api/prompts/trending
// @access  Public
const getTrendingPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ copies: -1 }).limit(10).lean();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get most liked prompts
// @route   GET /api/prompts/most-liked
// @access  Public
const getMostLikedPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ likes: -1 }).limit(10).lean();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
const getFeaturedCategories = async (req, res) => {
  const categories = [
    { name: 'Cinematic', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=400' },
    { name: 'Anime', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=400' },
    { name: 'Fantasy', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400' },
    { name: 'Portrait', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400' },
    { name: 'Architecture', image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=400' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400' },
    { name: 'Product', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' }
  ];
  res.json(categories);
};

// @desc    Get recommended prompts (Highest Engagement: likes + saves + copies)
// @route   GET /api/prompts/recommended
// @access  Public
const getRecommendedPrompts = async (req, res) => {
  try {
    // Use an aggregation or virtual to sort by sum if needed, 
    // but we can also use the existing trendingScore if we update it to only use these 3
    // For simplicity, we'll sort by the calculated engagement
    const prompts = await Prompt.aggregate([
      {
        $addFields: {
          engagementScore: { $add: ["$likes", "$saves", "$copies"] }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 10 }
    ]);
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics/stats
// @route   GET /api/prompts/stats
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalPrompts = await Prompt.countDocuments();
    const totalUsers = await User.countDocuments();

    // Aggregate engagement metrics
    const engagement = await Prompt.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $ifNull: ["$likes", 0] } },
          totalCopies: { $sum: { $ifNull: ["$copies", 0] } },
          totalSaves: { $sum: { $ifNull: ["$saves", 0] } }
        }
      }
    ]);

    const stats = engagement[0] || { totalLikes: 0, totalCopies: 0, totalSaves: 0 };
    
    // Find trending category (most engagement)
    const categoryEngagement = await Prompt.aggregate([
      {
        $group: {
          _id: "$category",
          score: { 
            $sum: { 
              $add: [
                { $ifNull: ["$likes", 0] }, 
                { $ifNull: ["$saves", 0] }, 
                { $ifNull: ["$copies", 0] }
              ] 
            } 
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 1 }
    ]);

    const trendingCategory = categoryEngagement[0]?._id || 'N/A';
    
    // Calculate category distribution for the chart
    const totalEngagement = (stats.totalLikes || 0) + (stats.totalCopies || 0) + (stats.totalSaves || 0);
    const topCategories = await Prompt.aggregate([
      {
        $group: {
          _id: "$category",
          count: { 
            $sum: { 
              $add: [
                { $ifNull: ["$likes", 0] }, 
                { $ifNull: ["$saves", 0] }, 
                { $ifNull: ["$copies", 0] }
              ] 
            } 
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $project: {
          name: "$_id",
          percentage: {
            $cond: [
              { $gt: [totalEngagement, 0] },
              { $round: [{ $multiply: [{ $divide: ["$count", totalEngagement] }, 100] }, 0] },
              0
            ]
          }
        }
      }
    ]);

    // Calculate daily activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$createdAt" }
          },
          views: { $sum: { $cond: [{ $eq: ["$action", "view"] }, 1, 0] } },
          copies: { $sum: { $cond: [{ $eq: ["$action", "copy"] }, 1, 0] } },
          uploads: { $sum: { $cond: [{ $eq: ["$action", "upload"] }, 1, 0] } }
        }
      },
      { $sort: { "_id.day": 1 } }
    ]);

    const dayNames = {
      1: 'Sun',
      2: 'Mon',
      3: 'Tue',
      4: 'Wed',
      5: 'Thu',
      6: 'Fri',
      7: 'Sat'
    };

    const formattedDaily = dailyActivity.map(d => ({
      name: dayNames[d._id.day] || 'Unknown',
      views: d.views,
      copies: d.copies,
      uploads: d.uploads || 0
    }));

    // If daily activity is empty, provide some default structure but with 0s
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const finalDaily = days.map(day => {
      const found = formattedDaily.find(d => d.name === day);
      return found || { name: day, views: 0, copies: 0, uploads: 0 };
    });

    res.json({
      totalPrompts,
      totalUsers,
      totalCopies: stats.totalCopies || 0,
      totalLikes: stats.totalLikes || 0,
      totalSaves: stats.totalSaves || 0,
      trendingCategory,
      topCategories,
      dailyActivity: finalDaily,
      categoryDistribution: topCategories.map(c => ({ name: c.name, value: c.percentage }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get best prompts (highest likes, saves, and copies)
// @route   GET /api/prompts/best
// @access  Public
const getBestPrompts = async (req, res) => {
  try {
    // Sort by a composite of likes, saves, and copies
    const prompts = await Prompt.find().sort({ 
      likes: -1,
      saves: -1,
      copies: -1
    }).limit(20).lean();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related prompts (same category/style, excluding self, sorted by tags similarity and engagement)
// @route   GET /api/prompts/related/:id
// @access  Public
const getRelatedPrompts = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const promptId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(promptId)) {
    return res.status(400).json({ message: 'Invalid prompt ID' });
  }

  try {
    const currentPrompt = await Prompt.findById(promptId).lean();
    if (!currentPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    const skip = (page - 1) * parseInt(limit);

    // Filter to only same category, excluding currently viewed prompt
    const query = {
      category: currentPrompt.category,
      _id: { $ne: currentPrompt._id }
    };

    const currentTags = currentPrompt.tags || [];

    const prompts = await Prompt.aggregate([
      { $match: query },
      {
        $addFields: {
          tagOverlap: {
            $size: {
              $setIntersection: [{ $ifNull: ["$tags", []] }, currentTags]
            }
          }
        }
      },
      {
        $addFields: {
          similarityScore: {
            $add: [
              { $multiply: ["$tagOverlap", 3] }, // 3 points per matching tag
              { $multiply: [{ $ifNull: ["$engagementScore", 0] }, 0.1] } // engagement score weight
            ]
          }
        }
      },
      { $sort: { similarityScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  getFeedPrompts,
  getRelatedPrompts
};


