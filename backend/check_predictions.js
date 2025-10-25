const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Prediction = require('./models/Prediction');

const checkPredictions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection established.\n');

    // Count total predictions
    const totalCount = await Prediction.countDocuments();
    console.log(`📊 Total predictions in database: ${totalCount}`);

    // Get the latest 10 predictions
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(10);
    
    if (predictions.length > 0) {
      console.log(`\n📋 Latest ${predictions.length} predictions:\n`);
      console.log('─'.repeat(80));
      
      predictions.forEach((pred, index) => {
        console.log(`\n${index + 1}. ID: ${pred._id}`);
        console.log(`   Crop: ${pred.Crop} | State: ${pred.State} | Season: ${pred.Season}`);
        console.log(`   Area: ${pred.Area} hectares`);
        console.log(`   Predicted Yield: ${pred.predicted_yield} tons/hectare`);
        console.log(`   Estimated Production: ${pred.estimated_production} tons`);
        console.log(`   Created: ${pred.createdAt}`);
      });
      console.log('\n' + '─'.repeat(80));
    } else {
      console.log('\n⚠️ No predictions found in the database.');
    }

    // Test creating a new prediction
    console.log('\n\n🧪 Testing prediction creation...');
    const testPrediction = {
      Crop: 'Test Rice',
      Season: 'Kharif     ',
      State: 'Test State',
      Area: 100,
      Annual_Rainfall: 1200,
      Fertilizer: 50000,
      Pesticide: 150,
      predicted_yield: 2.5,
      estimated_production: 250,
      model_version: 'Test_v1.0'
    };

    const newPred = await Prediction.create(testPrediction);
    console.log('✅ Test prediction created successfully!');
    console.log(`   ID: ${newPred._id}`);
    
    // Delete the test prediction
    await Prediction.findByIdAndDelete(newPred._id);
    console.log('✅ Test prediction deleted.');

    // Check count again
    const finalCount = await Prediction.countDocuments();
    console.log(`\n📊 Final count: ${finalCount} predictions`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  }
};

checkPredictions();
