const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const axios = require('axios');

// Get all crops with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, crop, state, season, year } = req.query;
    
    const filter = {};
    if (crop) filter.Crop = new RegExp(crop, 'i');
    if (state) filter.State = new RegExp(state, 'i');
    if (season) filter.Season = new RegExp(season, 'i');
    if (year) filter.Crop_Year = parseInt(year);

    const crops = await Crop.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ Crop_Year: -1 });

    const count = await Crop.countDocuments(filter);

    res.json({
      crops,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique values for filters
router.get('/filters', async (req, res) => {
  try {
    const crops = await Crop.distinct('Crop');
    const states = await Crop.distinct('State');
    const seasons = await Crop.distinct('Season');
    const years = await Crop.distinct('Crop_Year');

    res.json({
      crops: crops.sort(),
      states: states.sort(),
      seasons: seasons.sort(),
      years: years.sort()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalRecords = await Crop.countDocuments();
    const avgYield = await Crop.aggregate([
      { $group: { _id: null, avgYield: { $avg: '$Yield' } } }
    ]);
    
    const topCrops = await Crop.aggregate([
      { $group: { 
          _id: '$Crop', 
          avgYield: { $avg: '$Yield' },
          totalProduction: { $sum: '$Production' }
        }
      },
      { $sort: { avgYield: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalRecords,
      averageYield: avgYield[0]?.avgYield || 0,
      topCrops
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predict crop yield
router.post('/predict', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${mlServiceUrl}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'ML Service error', 
      details: error.message 
    });
  }
});

// Add new crop data
router.post('/', async (req, res) => {
  try {
    const crop = new Crop(req.body);
    await crop.save();
    res.status(201).json(crop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get crop by ID
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
