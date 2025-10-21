const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const Crop = require('../models/Crop');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Crop.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Read CSV file
    const csvFilePath = path.join(__dirname, '../../crop_yield.csv');
    const cropData = await csv().fromFile(csvFilePath);

    // Clean and transform data
    const cleanedData = cropData.map(row => ({
      Crop: row.Crop?.trim(),
      Crop_Year: parseInt(row.Crop_Year),
      Season: row.Season?.trim(),
      State: row.State?.trim(),
      Area: parseFloat(row.Area),
      Production: parseFloat(row.Production),
      Annual_Rainfall: parseFloat(row.Annual_Rainfall),
      Fertilizer: parseFloat(row.Fertilizer),
      Pesticide: parseFloat(row.Pesticide),
      Yield: parseFloat(row.Yield)
    }));

    // Insert data in batches
    const batchSize = 1000;
    for (let i = 0; i < cleanedData.length; i += batchSize) {
      const batch = cleanedData.slice(i, i + batchSize);
      await Crop.insertMany(batch);
      console.log(`📥 Inserted ${Math.min(i + batchSize, cleanedData.length)} / ${cleanedData.length} records`);
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
