const express = require('express');
const router = express.Router();
const LearningContent = require('../models/LearningContent');

// Get all learning content with filters
router.get('/content', async (req, res) => {
  try {
    const { category, crop, language, difficulty, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (crop) query.crop = crop;
    if (language) query.language = language;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const content = await LearningContent.find(query).sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    console.error('Error fetching learning content:', error);
    res.status(500).json({ error: 'Failed to fetch learning content' });
  }
});

// Get content by ID and increment views
router.get('/content/:id', async (req, res) => {
  try {
    const content = await LearningContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // Increment views
    content.views += 1;
    await content.save();
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get manure making guides
router.get('/manure-guides', async (req, res) => {
  try {
    const guides = await LearningContent.find({ 
      category: 'MANURE_MAKING' 
    }).sort({ createdAt: -1 });
    res.json(guides);
  } catch (error) {
    console.error('Error fetching manure guides:', error);
    res.status(500).json({ error: 'Failed to fetch manure guides' });
  }
});

// Get fertilizer recommendations for specific crop
router.get('/fertilizer-guide/:crop', async (req, res) => {
  try {
    const crop = req.params.crop;
    const guides = await LearningContent.find({ 
      category: 'FERTILIZER_GUIDE',
      crop: crop
    }).sort({ createdAt: -1 });
    res.json(guides);
  } catch (error) {
    console.error('Error fetching fertilizer guides:', error);
    res.status(500).json({ error: 'Failed to fetch fertilizer guides' });
  }
});

// Get crop-specific guides
router.get('/crop-guide/:crop', async (req, res) => {
  try {
    const crop = req.params.crop;
    const guides = await LearningContent.find({ 
      category: 'CROP_GUIDE',
      crop: crop
    }).sort({ createdAt: -1 });
    res.json(guides);
  } catch (error) {
    console.error('Error fetching crop guides:', error);
    res.status(500).json({ error: 'Failed to fetch crop guides' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'MANURE_MAKING', label: 'Manure Making', icon: '🌱' },
      { value: 'FERTILIZER_GUIDE', label: 'Fertilizer Guide', icon: '🧪' },
      { value: 'CROP_GUIDE', label: 'Crop Guide', icon: '🌾' },
      { value: 'PEST_MANAGEMENT', label: 'Pest Management', icon: '🐛' },
      { value: 'SOIL_HEALTH', label: 'Soil Health', icon: '🏞️' },
      { value: 'IRRIGATION', label: 'Irrigation', icon: '💧' },
      { value: 'ORGANIC_FARMING', label: 'Organic Farming', icon: '🌿' },
      { value: 'ADVANCED_TECHNIQUES', label: 'Advanced Techniques', icon: '🚜' }
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Like a content
router.post('/content/:id/like', async (req, res) => {
  try {
    const content = await LearningContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    content.likes += 1;
    await content.save();
    
    res.json({ likes: content.likes });
  } catch (error) {
    console.error('Error liking content:', error);
    res.status(500).json({ error: 'Failed to like content' });
  }
});

// Create new learning content (Admin)
router.post('/content', async (req, res) => {
  try {
    const content = new LearningContent(req.body);
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

module.exports = router;
