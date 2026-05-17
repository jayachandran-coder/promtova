const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be anonymous
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  action: {
    type: String,
    enum: ['like', 'save', 'copy', 'view'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookups
activitySchema.index({ user: 1, action: 1 });
activitySchema.index({ prompt: 1 });

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
