const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json({
      success: true,
      data: user
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.newPassword) {
      // Check current password first
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid current password' });
      }
      user.password = req.body.newPassword;
    }

    if (req.file) {
      try {
        user.profileImage = await uploadToCloudinary(req.file.buffer);
      } catch (err) {
        console.error('Cloudinary upload failed', err);
      }
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        savedPrompts: updatedUser.savedPrompts,
        likedPrompts: updatedUser.likedPrompts,
        profileImage: updatedUser.profileImage
      }
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
