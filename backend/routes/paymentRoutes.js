const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json(razorpayOrder);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update order with payment details
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'COMPLETED';
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.orderStatus = 'CONFIRMED';
        order.statusHistory.push({
          status: 'CONFIRMED',
          timestamp: new Date(),
          comment: 'Payment completed successfully'
        });
        await order.save();

        // Update product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Calculate totals
    let subtotal = 0;
    let totalSubsidy = 0;
    
    const items = await Promise.all(orderData.items.map(async (item) => {
      const product = await Product.findById(item.product);
      const itemPrice = product.price * item.quantity;
      const subsidyApplied = product.governmentSubsidyEligible 
        ? (itemPrice * product.subsidyPercentage) / 100 
        : 0;
      
      subtotal += itemPrice;
      totalSubsidy += subsidyApplied;
      
      return {
        product: item.product,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subsidyApplied,
        finalPrice: itemPrice - subsidyApplied
      };
    }));

    const totalAmount = subtotal - totalSubsidy + (orderData.shippingCharges || 0);

    const order = new Order({
      ...orderData,
      items,
      subtotal,
      totalSubsidy,
      totalAmount,
      statusHistory: [{
        status: 'PLACED',
        timestamp: new Date(),
        comment: 'Order placed successfully'
      }]
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders by phone number
router.get('/orders/user/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ 'userDetails.phone': req.params.phone })
      .sort({ createdAt: -1 })
      .populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, comment } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      comment
    });

    if (status === 'DELIVERED') {
      order.deliveredAt = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Razorpay webhook
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature === expectedSignature) {
      const event = req.body.event;
      const paymentEntity = req.body.payload.payment.entity;

      if (event === 'payment.captured') {
        // Handle successful payment
        console.log('Payment captured:', paymentEntity);
      } else if (event === 'payment.failed') {
        // Handle failed payment
        console.log('Payment failed:', paymentEntity);
      }

      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
