const mongoose = require('mongoose');

const subsidyApplicationSchema = new mongoose.Schema({
  applicationNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  farmerDetails: {
    name: String,
    aadharNumber: String,
    farmerIdCard: String,
    phone: String,
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String
    }
  },
  farmDetails: {
    landArea: Number,
    district: String,
    state: String,
    crops: [String]
  },
  subsidyType: {
    type: String,
    required: true,
    enum: ['FERTILIZER', 'MANURE', 'SEEDS', 'EQUIPMENT', 'GENERAL']
  },
  subsidyScheme: {
    type: String,
    trim: true
  },
  requestedAmount: {
    type: Number,
    required: true
  },
  approvedAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'SUBMITTED',
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED']
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    comment: String,
    updatedBy: String
  }],
  documents: [{
    type: String,
    name: String,
    url: String
  }],
  rejectionReason: String,
  disbursementDate: Date,
  transactionId: String,
  remarks: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique application number
subsidyApplicationSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const count = await mongoose.model('SubsidyApplication').countDocuments();
    this.applicationNumber = `SUB${Date.now()}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('SubsidyApplication', subsidyApplicationSchema);
