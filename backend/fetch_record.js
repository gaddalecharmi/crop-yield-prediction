const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Prediction = require('./models/Prediction');

const fetchRecordById = async () => {
  try {
    // Establish database connection
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection established successfully.\n');

    const recordId = '68fc6e2b02d2099248b9809b';
    
    // Try to fetch the record by ID
    const record = await Prediction.findById(recordId);

    if (record) {
      console.log('✅ Record found successfully!\n');
      console.log('📋 Record Details:');
      console.log('─'.repeat(60));
      console.log(`ID:                  ${record._id}`);
      console.log(`Crop:                ${record.Crop}`);
      console.log(`Crop Year:           ${record.Crop_Year || 'N/A'}`);
      console.log(`Season:              ${record.Season}`);
      console.log(`State:               ${record.State}`);
      console.log(`Area:                ${record.Area} hectares`);
      console.log(`Production:          ${record.Production || 'N/A'} tons`);
      console.log(`Annual Rainfall:     ${record.Annual_Rainfall} mm`);
      console.log(`Fertilizer:          ${record.Fertilizer} kg`);
      console.log(`Pesticide:           ${record.Pesticide} kg`);
      console.log(`─`.repeat(60));
      console.log(`Predicted Yield:     ${record.predicted_yield} tons/hectare`);
      console.log(`Estimated Production: ${record.estimated_production} tons`);
      console.log(`Model Version:       ${record.model_version || 'N/A'}`);
      console.log(`Prediction Date:     ${record.prediction_date || record.createdAt}`);
      console.log(`Created At:          ${record.createdAt}`);
      console.log(`Updated At:          ${record.updatedAt}`);
      console.log('─'.repeat(60));
      
      console.log('\n📊 Full Record (JSON):');
      console.log(JSON.stringify(record.toObject(), null, 2));
    } else {
      console.log(`⚠️ No record found with ID: ${recordId}`);
      console.log('\nTrying to find recent predictions...');
      
      const recentPredictions = await Prediction.find().sort({ createdAt: -1 }).limit(5);
      console.log(`\n📋 Found ${recentPredictions.length} recent predictions:`);
      recentPredictions.forEach((pred, index) => {
        console.log(`\n${index + 1}. ID: ${pred._id}`);
        console.log(`   Crop: ${pred.Crop}, State: ${pred.State}, Season: ${pred.Season}`);
        console.log(`   Predicted Yield: ${pred.predicted_yield}`);
        console.log(`   Created: ${pred.createdAt}`);
      });
    }
  } catch (error) {
    console.error('❌ Error while fetching record.');
    console.error(`Exact error: ${error.message}`);
    
    if (error.name === 'CastError') {
      console.error('\n⚠️ Invalid ID format. MongoDB ObjectId should be 24 hex characters.');
    }
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  }
};

fetchRecordById();
