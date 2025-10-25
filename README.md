# 🌾 Crop Yield Prediction System

A full-stack machine learning application for predicting crop yields based on agricultural parameters including rainfall, fertilizer, pesticide, and historical data.

## 🚀 Features

- **ML Prediction**: Random Forest model for accurate crop yield prediction
- **RESTful API**: Backend with MongoDB integration
- **Responsive UI**: Modern React frontend
- **Data Management**: View, filter, and analyze crop data

## 📊 Tech Stack

- **Backend**: Node.js, Express, MongoDB
- **ML Service**: Python, Flask, Scikit-learn, Pandas
- **Frontend**: React 18
- **Model**: Random Forest Regressor (22.8 MB .pkl format)

## 🔧 Quick Setup

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB Atlas account

### 1. MongoDB Setup
See `MONGODB_SETUP.md` for detailed instructions.

### 2. Backend
```bash
cd backend
npm install
# Create .env with MONGODB_URI, PORT=5000, ML_SERVICE_URL=http://localhost:5001
npm run seed    # Import data
npm run dev     # Start server
```

### 3. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python app.py   # Runs on port 5001
```

### 4. Frontend
```bash
cd frontend
npm install
npm start       # Runs on port 3000
```

## 🔌 API Endpoints

**Backend (Port 5000)**
- `GET /api/crops` - Get crops with pagination/filters
- `GET /api/crops/filters` - Get filter options
- `POST /api/crops/predict` - Predict yield
- `GET /api/crops/stats` - Get statistics

**ML Service (Port 5001)**
- `POST /predict` - Make prediction
- `POST /train` - Retrain model
- `GET /model-info` - Model details

## 📊 Dataset

~20,000 records with: Crop, Season, State, Area, Rainfall, Fertilizer, Pesticide, Yield

## 🛠️ Troubleshooting

- **MongoDB**: Whitelist your IP in Atlas Network Access
- **Backend**: Check if port 5000 is available
- **ML Service**: Ensure `crop_yield_cleaned.csv` exists
- **Frontend**: Verify backend/ML service are running

## 📄 License

MIT License

---

**Built with ❤️ for Agricultural Innovation**
