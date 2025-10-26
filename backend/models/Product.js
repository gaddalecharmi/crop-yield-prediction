const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['ORGANIC_FERTILIZER', 'ORGANIC_MANURE', 'BIO_PESTICIDE', 'SEEDS', 'FARMING_TOOLS', 'SOIL_AMENDMENTS']
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['KG', 'LITER', 'PACK', 'BAG', 'BOTTLE', 'PIECE']
  },
  quantity: {
    type: Number,
    required: true
  },
  suitableFor: [{
    type: String,
    trim: true
  }],
  composition: {
    type: String,
    trim: true
  },
  applicationMethod: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    isPrimary: Boolean
  }],
  governmentSubsidyEligible: {
    type: Boolean,
    default: false
  },
  subsidyPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  manufacturer: {
    type: String,
    trim: true
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isCertified: {
    type: Boolean,
    default: false
  },
  certifications: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index for search and filtering
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ suitableFor: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
