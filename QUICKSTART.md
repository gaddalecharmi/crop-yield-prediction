# 🚀 Quick Start Guide

Get your Crop Yield Prediction system running in 15 minutes!

## ⚡ Prerequisites Check

Before starting, ensure you have:

```powershell
# Check Node.js (need v16+)
node --version

# Check npm
npm --version

# Check Python (need 3.8+)
python --version

# Check pip
pip --version
```

If any are missing, install them:
- **Node.js**: https://nodejs.org (download LTS version)
- **Python**: https://www.python.org/downloads/

---

## 📋 Quick Setup (3 Steps)

### 1️⃣ MongoDB Setup (5 minutes)

**Option A: MongoDB Atlas (Recommended - FREE)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create FREE M0 cluster
3. Create database user: `cropuser` / `YourPassword123`
4. Whitelist IP: "Allow Access from Anywhere"
5. Copy connection string

**Full detailed guide**: See `MONGODB_SETUP.md`

### 2️⃣ Backend Setup (3 minutes)

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install
npm install csvtojson

# Create .env file
Copy-Item .env.example .env

# Edit .env with your MongoDB connection string
notepad .env
```

In `.env`:
```
MONGODB_URI=mongodb+srv://cropuser:YourPassword123@cluster.xxxxx.mongodb.net/crop_yield_db?retryWrites=true&w=majority
PORT=5000
ML_SERVICE_URL=http://localhost:5001
```

```powershell
# Seed database
npm run seed

# Start server
npm run dev
```

✅ Backend running at http://localhost:5000

### 3️⃣ ML Service Setup (3 minutes)

**New Terminal:**
```powershell
# Navigate to ml-service
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start ML service
python app.py
```

✅ ML Service running at http://localhost:5001

### 4️⃣ Frontend Setup (4 minutes)

**New Terminal:**
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

✅ Frontend running at http://localhost:3000

---

## 🎯 Verify Everything Works

### Test 1: Backend Health
Open browser: http://localhost:5000
Should see: `{"message": "Crop Yield Prediction API is running!"}`

### Test 2: ML Service Health
Open browser: http://localhost:5001
Should see: `{"message": "Crop Yield Prediction ML Service", "status": "running"}`

### Test 3: Frontend
Browser should auto-open at http://localhost:3000
You should see the Crop Yield Prediction interface

### Test 4: Make a Prediction
1. Go to "Predict Yield" tab
2. Select: Crop = "Rice", Season = "Kharif", State = "Punjab"
3. Enter: Area = 1000, Rainfall = 1200, Fertilizer = 50000, Pesticide = 1500
4. Click "Predict Yield"
5. Should see predicted yield!

---

## 🐛 Quick Troubleshooting

### ❌ Backend won't start
```powershell
# Check if MongoDB connection string is correct
# Check .env file exists
# Try: npm install again
```

### ❌ ML Service error
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt

# Check if crop_yield.csv exists in parent directory
```

### ❌ Frontend can't connect
```powershell
# Make sure backend is running on port 5000
# Clear browser cache
# Check package.json has: "proxy": "http://localhost:5000"
```

### ❌ MongoDB connection failed
```powershell
# Check Network Access in MongoDB Atlas
# Add IP: 0.0.0.0/0 (allow from anywhere)
# Verify username/password in connection string
# Check if cluster is active (green status)
```

---

## 📁 Project Structure Overview

```
DM/
├── 📁 backend/              ← Node.js API server
│   ├── models/             ← Database schemas
│   ├── routes/             ← API endpoints
│   ├── scripts/            ← Seeding script
│   └── server.js           ← Main entry point
│
├── 📁 ml-service/           ← Python ML API
│   ├── app.py             ← Flask app + ML model
│   └── requirements.txt    ← Python packages
│
├── 📁 frontend/             ← React UI
│   └── src/
│       ├── components/     ← React components
│       └── App.js         ← Main app
│
├── 📄 crop_yield.csv        ← Your dataset
└── 📄 README.md            ← Full documentation
```

---

## 🎨 Application Features

### 1. Predict Yield Page
- Select crop parameters
- Get instant ML predictions
- See estimated production

### 2. View Data Page
- Browse all 20,000 records
- Filter by crop, state, season
- Paginated results

### 3. Statistics Page
- Total records count
- Average yield calculation
- Top 10 crops visualization

---

## 💻 Development Commands

### Backend
```powershell
npm start        # Production mode
npm run dev      # Development with nodemon
npm run seed     # Import CSV to MongoDB
```

### ML Service
```powershell
python app.py                    # Start service
.\venv\Scripts\Activate.ps1     # Activate venv
deactivate                       # Deactivate venv
```

### Frontend
```powershell
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

---

## 🔧 Ports Used

| Service | Port | URL |
|---------|------|-----|
| Backend | 5000 | http://localhost:5000 |
| ML Service | 5001 | http://localhost:5001 |
| Frontend | 3000 | http://localhost:3000 |
| MongoDB | 27017 | (Cloud - MongoDB Atlas) |

---

## 📊 Sample API Requests

### Get All Crops
```bash
GET http://localhost:5000/api/crops
```

### Get Filters
```bash
GET http://localhost:5000/api/crops/filters
```

### Predict Yield
```bash
POST http://localhost:5000/api/crops/predict
Content-Type: application/json

{
  "Crop": "Rice",
  "Season": "Kharif",
  "State": "Punjab",
  "Area": 1000,
  "Annual_Rainfall": 1200,
  "Fertilizer": 50000,
  "Pesticide": 1500
}
```

---

## 🎓 Next Steps

1. ✅ **Basic Setup**: Complete the quick start
2. 📚 **Learn**: Read full README.md for details
3. 🎨 **Customize**: Modify frontend styles
4. 🤖 **Improve ML**: Try different algorithms
5. 🚀 **Deploy**: Deploy to Heroku/Vercel

---

## 📚 Additional Resources

- **Full Documentation**: README.md
- **MongoDB Guide**: MONGODB_SETUP.md
- **MongoDB Atlas**: https://cloud.mongodb.com
- **React Docs**: https://react.dev
- **Flask Docs**: https://flask.palletsprojects.com

---

## 🆘 Need Help?

1. Check the Troubleshooting section above
2. Read MONGODB_SETUP.md for database issues
3. Check console logs for error messages
4. Verify all services are running

---

**🎉 Happy Coding! Your ML-powered crop prediction system is ready!**
