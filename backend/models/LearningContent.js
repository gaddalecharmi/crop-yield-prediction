const mongoose = require('mongoose');

const learningContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['MANURE_MAKING', 'FERTILIZER_GUIDE', 'CROP_GUIDE', 'PEST_MANAGEMENT', 'SOIL_HEALTH', 'IRRIGATION', 'ORGANIC_FARMING', 'ADVANCED_TECHNIQUES']
  },
  subcategory: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  crop: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'te', 'ta', 'mr', 'bn', 'gu', 'kn', 'ml', 'pa', 'or']
  },
  difficulty: {
    type: String,
    default: 'BEGINNER',
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  estimatedReadTime: {
    type: Number,
    default: 5
  },
  videoUrl: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    caption: String
  }],
  tags: [String],
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    default: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
learningContentSchema.index({ category: 1, crop: 1 });
learningContentSchema.index({ tags: 1 });
learningContentSchema.index({ language: 1 });

module.exports = mongoose.model('LearningContent', learningContentSchema);
