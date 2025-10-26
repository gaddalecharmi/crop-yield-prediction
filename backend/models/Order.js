const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  subsidyApplied: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userDetails: {
    name: String,
    phone: String,
    email: String,
    aadharNumber: String
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  totalSubsidy: {
    type: Number,
    default: 0
  },
  shippingCharges: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['RAZORPAY', 'COD', 'UPI', 'NETBANKING', 'CARD']
  },
  paymentStatus: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
  },
  paymentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  shippingAddress: {
    addressLine1: String,
    addressLine2: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    landmark: String
  },
  orderStatus: {
    type: String,
    default: 'PLACED',
    enum: ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    comment: String
  }],
  trackingNumber: String,
  courierPartner: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  subsidyApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubsidyApplication'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
