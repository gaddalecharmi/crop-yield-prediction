const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const Prediction = require('../models/Prediction');
const axios = require('axios');

// State coordinates for weather API (major cities as reference points)
const STATE_COORDINATES = {
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lon: 94.7278 },
  'Assam': { lat: 26.2006, lon: 92.9376 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'Goa': { lat: 15.2993, lon: 74.1240 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 },
  'Jharkhand': { lat: 23.6102, lon: 85.2799 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Kerala': { lat: 10.8505, lon: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Manipur': { lat: 24.6637, lon: 93.9063 },
  'Meghalaya': { lat: 25.4670, lon: 91.3662 },
  'Mizoram': { lat: 23.1645, lon: 92.9376 },
  'Nagaland': { lat: 26.1584, lon: 94.5624 },
  'Odisha': { lat: 20.9517, lon: 85.0985 },
  'Punjab': { lat: 31.1471, lon: 75.3412 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'Sikkim': { lat: 27.5330, lon: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
  'Telangana': { lat: 18.1124, lon: 79.0193 },
  'Tripura': { lat: 23.9408, lon: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'West Bengal': { lat: 22.9868, lon: 87.8550 },
  'Delhi': { lat: 28.7041, lon: 77.1025 },
  'Puducherry': { lat: 11.9416, lon: 79.8083 },
  'Jammu and Kashmir': { lat: 33.7782, lon: 76.5762 },
  'Ladakh': { lat: 34.1526, lon: 77.5771 }
};

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

// Get all data for statistics (no pagination)
router.get('/stats/all', async (req, res) => {
  try {
    console.log('📊 Fetching all crops for statistics...');
    const crops = await Crop.find({}).select('-__v').lean();
    console.log(`✅ Fetched ${crops.length} records for statistics`);
    res.json(crops);
  } catch (error) {
    console.error('❌ Error fetching statistics data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rainfall data for a state
router.get('/rainfall/:state', async (req, res) => {
  try {
    const stateName = req.params.state;
    const coordinates = STATE_COORDINATES[stateName];
    
    if (!coordinates) {
      return res.status(400).json({ 
        error: 'State not found',
        message: `Rainfall data not available for ${stateName}`,
        availableStates: Object.keys(STATE_COORDINATES)
      });
    }

    // Regional average rainfall for Indian states (mm/year)
    const regionalAverages = {
      'Andhra Pradesh': 940, 'Arunachal Pradesh': 2800, 'Assam': 2818,
      'Bihar': 1205, 'Chhattisgarh': 1292, 'Goa': 2813, 'Gujarat': 803,
      'Haryana': 617, 'Himachal Pradesh': 1469, 'Jharkhand': 1400,
      'Karnataka': 1136, 'Kerala': 3107, 'Madhya Pradesh': 1178,
      'Maharashtra': 1181, 'Manipur': 1467, 'Meghalaya': 2818,
      'Mizoram': 2500, 'Nagaland': 2000, 'Odisha': 1482, 'Punjab': 649,
      'Rajasthan': 575, 'Sikkim': 3500, 'Tamil Nadu': 998,
      'Telangana': 906, 'Tripura': 2200, 'Uttar Pradesh': 1025,
      'Uttarakhand': 1550, 'West Bengal': 1582, 'Delhi': 611,
      'Puducherry': 1200, 'Jammu and Kashmir': 1011, 'Ladakh': 92
    };

    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // Check if API key is valid
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.warn('⚠️ OpenWeather API key not configured. Using regional averages.');
      return res.json({
        state: stateName,
        coordinates,
        estimated_annual_rainfall: regionalAverages[stateName] || 1000,
        weather: 'Unknown (API key not configured)',
        temperature: null,
        humidity: null,
        current_rainfall: null,
        message: 'Using regional average rainfall (API key not configured)',
        source: 'Regional Average Data'
      });
    }
    
    // Get current weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
    
    const response = await axios.get(weatherUrl);
    
    // Calculate annual rainfall estimate from current data
    const currentRainfall = response.data.rain ? response.data.rain['1h'] || 0 : 0;
    const humidity = response.data.main.humidity;
    
    // Use regional average as base, adjust with current conditions
    const baseRainfall = regionalAverages[stateName] || 1000;
    const estimatedAnnualRainfall = Math.round(
      baseRainfall * (humidity / 65) // Adjust by humidity (65% is average)
    );
    
    res.json({
      state: stateName,
      coordinates,
      current_rainfall: currentRainfall,
      humidity: humidity,
      estimated_annual_rainfall: estimatedAnnualRainfall,
      weather: response.data.weather[0].description,
      temperature: response.data.main.temp,
      message: 'Rainfall data retrieved successfully',
      source: 'OpenWeatherMap API + Regional Data'
    });
    
  } catch (error) {
    console.error('Weather API Error:', error.message);
    
    // Fallback to regional averages
    const regionalAverages = {
      'Andhra Pradesh': 940, 'Arunachal Pradesh': 2800, 'Assam': 2818,
      'Bihar': 1205, 'Chhattisgarh': 1292, 'Goa': 2813, 'Gujarat': 803,
      'Haryana': 617, 'Himachal Pradesh': 1469, 'Jharkhand': 1400,
      'Karnataka': 1136, 'Kerala': 3107, 'Madhya Pradesh': 1178,
      'Maharashtra': 1181, 'Manipur': 1467, 'Meghalaya': 2818,
      'Mizoram': 2500, 'Nagaland': 2000, 'Odisha': 1482, 'Punjab': 649,
      'Rajasthan': 575, 'Sikkim': 3500, 'Tamil Nadu': 998,
      'Telangana': 906, 'Tripura': 2200, 'Uttar Pradesh': 1025,
      'Uttarakhand': 1550, 'West Bengal': 1582, 'Delhi': 611,
      'Puducherry': 1200, 'Jammu and Kashmir': 1011, 'Ladakh': 92
    };
    
    const stateName = req.params.state;
    const fallbackRainfall = regionalAverages[stateName] || 1000;
    
    res.json({ 
      state: stateName,
      estimated_annual_rainfall: fallbackRainfall,
      weather: 'Unknown (API Error)',
      temperature: null,
      humidity: null,
      current_rainfall: null,
      message: 'Using regional average rainfall (API unavailable)',
      source: 'Regional Average Data (Fallback)',
      api_error: error.message
    });
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
    console.log('📊 Received prediction request:', req.body);
    
    // Validate required fields
    const { Crop, Season, State, Area, Annual_Rainfall, Fertilizer, Pesticide } = req.body;
    
    if (!Crop || !Season || !State || !Area || !Annual_Rainfall || !Fertilizer || !Pesticide) {
      return res.status(400).json({ 
        error: 'All fields are required: Crop, Season, State, Area, Annual_Rainfall, Fertilizer, Pesticide' 
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    // Prepare data for ML service (only include required fields)
    // Note: Season values in the model have trailing spaces, so we pad them
    const mlData = {
      Crop: String(Crop).trim(),
      Season: String(Season).trim().padEnd(11, ' '),  // Pad to 11 chars to match encoder
      State: String(State).trim(),
      Area: parseFloat(Area),
      Annual_Rainfall: parseFloat(Annual_Rainfall),
      Fertilizer: parseFloat(Fertilizer),
      Pesticide: parseFloat(Pesticide)
    };
    
    // Call ML service for prediction
    console.log('🔄 Calling ML service at:', mlServiceUrl);
    console.log('📤 Sending to ML service:', mlData);
    const response = await axios.post(`${mlServiceUrl}/predict`, mlData);
    console.log('✅ ML service response:', response.data);
    
    // Calculate estimated production (Area * Predicted Yield)
    const estimatedProduction = parseFloat(Area) * response.data.predicted_yield;
    
    // Save prediction to database
    const predictionData = {
      ...req.body,
      predicted_yield: response.data.predicted_yield,
      estimated_production: estimatedProduction,
      model_version: response.data.model_version || 'Random_Forest_v1.0',
      prediction_date: new Date()
    };
    
    const savedPrediction = await Prediction.create(predictionData);
    console.log('💾 Saved prediction to database:', savedPrediction._id);
    
    // Return response with prediction details
    res.json({
      success: true,
      prediction_id: savedPrediction._id,
      input_data: req.body,
      predicted_yield: response.data.predicted_yield,
      estimated_production: estimatedProduction,
      model_version: response.data.model_version || 'Random_Forest_v1.0',
      prediction_date: savedPrediction.createdAt,
      message: '🎯 Prediction completed successfully!'
    });
    
  } catch (error) {
    console.error('❌ Error in prediction:', error.message);
    res.status(500).json({ 
      error: 'ML Service error', 
      details: error.message 
    });
  }
});

// Predict Fertilizer and Pesticide requirements (auto-fill inputs)
router.post('/predict-inputs', async (req, res) => {
  try {
    console.log('🌾 Received input prediction request:', req.body);
    
    // Validate required fields (no Fertilizer/Pesticide needed)
    const { Crop, Crop_Year, Season, State, Area, Annual_Rainfall } = req.body;
    
    if (!Crop || !Crop_Year || !Season || !State || !Area || !Annual_Rainfall) {
      return res.status(400).json({ 
        error: 'Required fields: Crop, Crop_Year, Season, State, Area, Annual_Rainfall' 
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    // Prepare data for ML service
    const mlData = {
      Crop: String(Crop).trim(),
      Crop_Year: parseInt(Crop_Year),
      Season: String(Season).trim(),
      State: String(State).trim(),
      Area: parseFloat(Area),
      Annual_Rainfall: parseFloat(Annual_Rainfall)
    };
    
    console.log('🔄 Calling ML service for input prediction:', mlServiceUrl);
    console.log('📤 Sending data:', mlData);
    
    // Call ML service for fertilizer/pesticide prediction
    const response = await axios.post(`${mlServiceUrl}/predict-inputs`, mlData);
    console.log('✅ ML service response:', response.data);
    
    // Return predicted fertilizer and pesticide values
    res.json({
      success: true,
      predicted_fertilizer: response.data.predicted_fertilizer,
      predicted_pesticide: response.data.predicted_pesticide,
      input_data: mlData,
      status: 'success',
      message: '✅ Successfully predicted fertilizer and pesticide requirements'
    });
    
  } catch (error) {
    console.error('❌ Error in input prediction:', error.message);
    res.status(500).json({ 
      error: 'Input prediction error', 
      details: error.response?.data?.error || error.message 
    });
  }
});

// Get all predictions with pagination
router.get('/predictions', async (req, res) => {
  try {
    const { page = 1, limit = 50, crop, state, season } = req.query;
    
    const filter = {};
    if (crop) filter.Crop = new RegExp(crop, 'i');
    if (state) filter.State = new RegExp(state, 'i');
    if (season) filter.Season = new RegExp(season, 'i');

    const predictions = await Prediction.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ prediction_date: -1 });

    const count = await Prediction.countDocuments(filter);

    res.json({
      predictions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get predictions statistics
router.get('/predictions/stats', async (req, res) => {
  try {
    const totalPredictions = await Prediction.countDocuments();
    const avgPredictedYield = await Prediction.aggregate([
      { $group: { _id: null, avgYield: { $avg: '$predicted_yield' } } }
    ]);
    
    const recentPredictions = await Prediction.find()
      .sort({ prediction_date: -1 })
      .limit(10);

    res.json({
      totalPredictions,
      averagePredictedYield: avgPredictedYield[0]?.avgYield || 0,
      recentPredictions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger model retraining
router.post('/retrain', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${mlServiceUrl}/retrain`);
    
    res.json({
      message: 'Model retraining triggered successfully',
      ...response.data
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error triggering retraining', 
      details: error.message 
    });
  }
});

// Get retraining logs
router.get('/retrain/logs', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${mlServiceUrl}/retraining-logs`);
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching retraining logs', 
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
