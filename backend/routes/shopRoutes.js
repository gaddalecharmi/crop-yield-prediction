const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products with filters
router.get('/products', async (req, res) => {
  try {
    const { category, suitableFor, isOrganic, minPrice, maxPrice, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (suitableFor) query.suitableFor = suitableFor;
    if (isOrganic !== undefined) query.isOrganic = isOrganic === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query).sort({ rating: -1, createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get recommended products based on crop prediction
router.post('/products/recommendations', async (req, res) => {
  try {
    const { crop, fertilizer, pesticide } = req.body;
    
    // Find products suitable for the predicted crop
    const products = await Product.find({
      isActive: true,
      $or: [
        { suitableFor: crop },
        { category: 'ORGANIC_FERTILIZER' },
        { category: 'ORGANIC_MANURE' }
      ]
    }).limit(10);

    res.json(products);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'ORGANIC_FERTILIZER', label: 'Organic Fertilizers', icon: '🌿' },
      { value: 'ORGANIC_MANURE', label: 'Organic Manure', icon: '🌱' },
      { value: 'BIO_PESTICIDE', label: 'Bio Pesticides', icon: '🐛' },
      { value: 'SEEDS', label: 'Seeds', icon: '🌾' },
      { value: 'FARMING_TOOLS', label: 'Farming Tools', icon: '🚜' },
      { value: 'SOIL_AMENDMENTS', label: 'Soil Amendments', icon: '🏞️' }
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Calculate subsidy for product
router.post('/calculate-subsidy', async (req, res) => {
  try {
    const { productId, quantity, userAadhar, state } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const basePrice = product.price * quantity;
    let subsidyAmount = 0;

    if (product.governmentSubsidyEligible && userAadhar) {
      subsidyAmount = (basePrice * product.subsidyPercentage) / 100;
    }

    res.json({
      basePrice,
      subsidyAmount,
      finalPrice: basePrice - subsidyAmount,
      subsidyPercentage: product.subsidyPercentage
    });
  } catch (error) {
    console.error('Error calculating subsidy:', error);
    res.status(500).json({ error: 'Failed to calculate subsidy' });
  }
});

module.exports = router;
