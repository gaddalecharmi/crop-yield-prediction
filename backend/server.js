const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cropRoutes = require('./routes/cropRoutes');
const translateRoutes = require('./routes/translateRoutes');
const learningRoutes = require('./routes/learningRoutes');
const shopRoutes = require('./routes/shopRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subsidyRoutes = require('./routes/subsidyRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/crops', cropRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subsidy', subsidyRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Crop Yield Prediction API is running!',
    features: ['Crop Yield Prediction', 'Data Management', 'Statistics', 'Multilingual Support'],
    endpoints: {
      crops: '/api/crops',
      learning: '/api/learning',
      shop: '/api/shop',
      payment: '/api/payment',
      subsidy: '/api/subsidy'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
