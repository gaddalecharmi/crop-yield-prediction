const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String
  },
  aadharNumber: {
    type: String,
    trim: true
  },
  farmerIdCard: {
    type: String,
    trim: true
  },
  address: {
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  farmDetails: {
    landArea: Number,
    crops: [String],
    soilType: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEligibleForSubsidy: {
    type: Boolean,
    default: false
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  learningProgress: [{
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningContent'
    },
    completed: Boolean,
    completedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
