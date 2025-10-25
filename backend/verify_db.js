const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Crop = require('./models/Crop'); // Assuming a model exists for the collection

const verifyDatabase = async () => {
  try {
    // Establish database connection
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connection established successfully.');

    // Try reading the clean dataset table
    const data = await Crop.find({}); // Fetches all documents from the collection associated with the Crop model

    if (data.length > 0) {
      console.log('✅ Cleaned dataset successfully loaded from the database.');
      // Assuming the data is an array of documents, and each document is a row
      const rowCount = data.length;
      // Assuming all documents have the same keys, using the first document to get column count
      const columnCount = Object.keys(data[0].toObject()).length;
      console.log(`Number of rows: ${rowCount}`);
      console.log(`Number of columns: ${columnCount}`);
      console.log('Sample data (first 5 rows):');
      console.log(data.slice(0, 5));
    } else {
      console.log('⚠️ Connection successful, but no data found.');
    }
  } catch (error) {
    console.error('❌ Error while connecting or fetching data.');
    console.error(`Exact error: ${error.message}`);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
  }
};

verifyDatabase();
