const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  Crop: {
    type: String,
    required: true,
    trim: true
  },
  Crop_Year: {
    type: Number,
    required: true
  },
  Season: {
    type: String,
    required: true,
    trim: true
  },
  State: {
    type: String,
    required: true,
    trim: true
  },
  Area: {
    type: Number,
    required: true
  },
  Production: {
    type: Number,
    required: true
  },
  Annual_Rainfall: {
    type: Number,
    required: true
  },
  Fertilizer: {
    type: Number,
    required: true
  },
  Pesticide: {
    type: Number,
    required: true
  },
  Yield: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cropSchema.index({ Crop: 1, State: 1, Crop_Year: 1 });
cropSchema.index({ State: 1 });
cropSchema.index({ Crop: 1 });

module.exports = mongoose.model('Crop', cropSchema);
