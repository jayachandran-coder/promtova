const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    index: true
  },
  prompt: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  copies: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  engagementScore: {
    type: Number,
    default: 0,
    index: true
  },
  author: {
    type: String,
    default: 'Admin'
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Full-text search index
promptSchema.index({ title: 'text', prompt: 'text', tags: 'text' });

// Compound index for feed sorting: engagementScore desc, createdAt desc
promptSchema.index({ engagementScore: -1, createdAt: -1 });

const Prompt = mongoose.model('Prompt', promptSchema);
module.exports = Prompt;
