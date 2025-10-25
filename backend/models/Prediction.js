const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  // Input data
  Crop: {
    type: String,
    required: true,
    trim: true
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
    default: null
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
  
  // Prediction output
  predicted_yield: {
    type: Number,
    required: true
  },
  estimated_production: {
    type: Number,
    required: true
  },
  
  // Metadata
  model_version: {
    type: String,
    default: 'Random_Forest_v1.0'
  },
  prediction_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
predictionSchema.index({ Crop: 1, State: 1 });
predictionSchema.index({ prediction_date: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
