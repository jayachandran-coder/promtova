const User = require('../models/User');
const Prompt = require('../models/Prompt');
const Activity = require('../models/Activity');

// @desc    Toggle Like for a prompt
// @route   POST /api/user/like/:id
// @access  Private
const toggleLikePrompt = async (req, res) => {
  try {
    const promptId = req.params.id;
    const userId = req.user._id;

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });

    const user = await User.findById(userId);

    const isLiked = prompt.likedBy.some(id => id.toString() === userId.toString());

    if (isLiked) {
      // Unlike
      prompt.likedBy = prompt.likedBy.filter(id => id.toString() !== userId.toString());
      prompt.likes = Math.max(0, prompt.likes - 1);
      user.likedPrompts = user.likedPrompts.filter(id => id.toString() !== promptId.toString());
    } else {
      // Like
      prompt.likedBy.push(userId);
      prompt.likes += 1;
      user.likedPrompts.push(promptId);
    }

    // Update trending score
    prompt.trendingScore = (prompt.likes || 0) + (prompt.views || 0) + (prompt.copies || 0) + (prompt.saves || 0);

    // Log activity
    if (!isLiked) {
      await Activity.create({
        user: userId,
        prompt: promptId,
        action: 'like',
        category: prompt.category
      });
    }

    await prompt.save();
    await user.save();

    res.json({ 
      liked: !isLiked, 
      likesCount: prompt.likes,
      likedPrompts: user.likedPrompts 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Save for a prompt
// @route   POST /api/user/save/:id
// @access  Private
const toggleSavePrompt = async (req, res) => {
  try {
    const promptId = req.params.id;
    const userId = req.user._id;

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });

    const user = await User.findById(userId);

    const isSaved = user.savedPrompts.some(id => id.toString() === promptId);

    if (isSaved) {
      // Unsave
      user.savedPrompts = user.savedPrompts.filter(id => id.toString() !== promptId.toString());
      prompt.savedBy = prompt.savedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Save
      user.savedPrompts.push(promptId);
      prompt.savedBy.push(userId);
    }

    // Update saves count and trending score
    prompt.saves = prompt.savedBy.length;
    prompt.trendingScore = (prompt.likes || 0) + (prompt.views || 0) + (prompt.copies || 0) + (prompt.saves || 0);

    // Log activity
    if (!isSaved) {
      await Activity.create({
        user: userId,
        prompt: promptId,
        action: 'save',
        category: prompt.category
      });
    }

    await user.save();
    await prompt.save();

    res.json({ 
      saved: !isSaved, 
      savedPrompts: user.savedPrompts 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's saved prompts
// @route   GET /api/user/saved
// @access  Private
const getSavedPrompts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPrompts',
      options: { sort: { createdAt: -1 } }
    }).lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.savedPrompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  toggleLikePrompt,
  toggleSavePrompt,
  getSavedPrompts
};
