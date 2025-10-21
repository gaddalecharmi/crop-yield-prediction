# ✅ Setup Checklist

Use this checklist to ensure everything is properly configured!

## 📋 Pre-Setup Requirements

### Software Installation
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pip installed (`pip --version`)
- [ ] Git installed (optional) (`git --version`)
- [ ] Code editor (VS Code recommended)

---

## 🗄️ MongoDB Atlas Setup

### Account & Cluster
- [ ] MongoDB Atlas account created
- [ ] Email verified
- [ ] FREE M0 cluster created (CropYieldCluster)
- [ ] Cluster status is "Active" (green)
- [ ] Cluster fully provisioned (3-5 minutes wait)

### Security Configuration
- [ ] Database user created (username: `cropuser`)
- [ ] Strong password generated and saved
- [ ] Password stored securely (e.g., password manager)
- [ ] IP whitelist configured (0.0.0.0/0 for development)
- [ ] Network access confirmed

### Connection Setup
- [ ] Connection string copied
- [ ] `<password>` replaced with actual password
- [ ] Database name added: `/crop_yield_db`
- [ ] Connection string tested (optional: use MongoDB Compass)

**Example Connection String:**
```
mongodb+srv://cropuser:YourSecurePassword@cropyieldcluster.xxxxx.mongodb.net/crop_yield_db?retryWrites=true&w=majority
```

---

## 🔧 Backend Setup

### Initial Setup
- [ ] Navigated to `backend` directory
- [ ] `npm install` completed successfully
- [ ] `npm install csvtojson` completed
- [ ] No error messages during installation

### Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `MONGODB_URI` updated with connection string
- [ ] `PORT` set to 5000
- [ ] `ML_SERVICE_URL` set to http://localhost:5001

### Database Seeding
- [ ] `npm run seed` executed
- [ ] Saw "Connected to MongoDB" message
- [ ] Saw "Cleared existing data" message
- [ ] Saw progress: "Inserted X / 19690 records"
- [ ] Saw "Database seeded successfully!"
- [ ] Process exited without errors

### Server Launch
- [ ] `npm run dev` executed
- [ ] Saw "Server running on port 5000"
- [ ] Saw "MongoDB Connected Successfully"
- [ ] No error messages in console

### Verification
- [ ] Opened http://localhost:5000 in browser
- [ ] Saw: `{"message": "Crop Yield Prediction API is running!"}`
- [ ] API health check successful

---

## 🤖 ML Service Setup

### Virtual Environment
- [ ] Navigated to `ml-service` directory
- [ ] `python -m venv venv` completed
- [ ] Virtual environment created (`venv` folder exists)
- [ ] `.\venv\Scripts\Activate.ps1` executed
- [ ] Saw `(venv)` prefix in terminal

### Dependencies
- [ ] `pip install -r requirements.txt` executed
- [ ] All packages installed successfully
- [ ] Flask installed
- [ ] Pandas installed
- [ ] Scikit-learn installed
- [ ] No error messages

### Service Launch
- [ ] `python app.py` executed
- [ ] Saw "Model trained successfully!"
- [ ] Saw training and testing R² scores
- [ ] Saw "Running on http://0.0.0.0:5001"
- [ ] No error messages

### Verification
- [ ] Opened http://localhost:5001 in browser
- [ ] Saw JSON response with "status": "running"
- [ ] Model loaded successfully
- [ ] `crop_yield_model.pkl` file created
- [ ] `label_encoders.pkl` file created

---

## 🎨 Frontend Setup

### Initial Setup
- [ ] Navigated to `frontend` directory
- [ ] `npm install` completed successfully
- [ ] React and dependencies installed
- [ ] No error messages during installation

### Server Launch
- [ ] `npm start` executed
- [ ] Compilation successful
- [ ] Browser automatically opened to http://localhost:3000
- [ ] No compilation errors

### Verification
- [ ] Application loaded in browser
- [ ] Saw header: "Crop Yield Prediction System"
- [ ] Three tabs visible: "Predict Yield", "View Data", "Statistics"
- [ ] No console errors in browser DevTools (F12)

---

## 🧪 Functional Testing

### Test 1: Prediction Form
- [ ] Clicked "Predict Yield" tab
- [ ] Dropdowns populated with options
- [ ] Selected: Crop = "Rice"
- [ ] Selected: Season = "Kharif"
- [ ] Selected: State = "Punjab"
- [ ] Entered: Area = 1000
- [ ] Entered: Annual Rainfall = 1200
- [ ] Entered: Fertilizer = 50000
- [ ] Entered: Pesticide = 1500
- [ ] Clicked "Predict Yield" button
- [ ] Saw loading indicator
- [ ] Prediction result displayed
- [ ] "Predicted Yield" value shown
- [ ] "Estimated Production" value shown
- [ ] No error messages

### Test 2: View Data
- [ ] Clicked "View Data" tab
- [ ] Data table loaded with records
- [ ] Table shows: Crop, Year, Season, State, Area, Production, Yield, Rainfall
- [ ] Pagination buttons visible
- [ ] Filter inputs visible
- [ ] Entered filter (e.g., crop = "Rice")
- [ ] Data filtered correctly
- [ ] "Clear Filters" button works
- [ ] "Previous" and "Next" pagination works

### Test 3: Statistics
- [ ] Clicked "Statistics" tab
- [ ] "Total Records" card displayed
- [ ] "Average Yield" card displayed
- [ ] "Top 10 Crops" list displayed
- [ ] Bar charts visible for each crop
- [ ] Numbers make sense (no NaN or undefined)

---

## 🔍 Backend API Testing

### Using Browser or Postman

#### Endpoint 1: Health Check
- [ ] GET http://localhost:5000
- [ ] Response: `{"message": "Crop Yield Prediction API is running!"}`

#### Endpoint 2: Get Crops
- [ ] GET http://localhost:5000/api/crops
- [ ] Response contains "crops" array
- [ ] Response contains pagination info

#### Endpoint 3: Get Filters
- [ ] GET http://localhost:5000/api/crops/filters
- [ ] Response contains "crops" array
- [ ] Response contains "states" array
- [ ] Response contains "seasons" array
- [ ] Response contains "years" array

#### Endpoint 4: Get Statistics
- [ ] GET http://localhost:5000/api/crops/stats
- [ ] Response contains "totalRecords"
- [ ] Response contains "averageYield"
- [ ] Response contains "topCrops" array

---

## 🚦 ML Service Testing

### Using Browser or Postman

#### Endpoint 1: Health Check
- [ ] GET http://localhost:5001
- [ ] Response: `{"status": "running", "model_loaded": true}`

#### Endpoint 2: Model Info
- [ ] GET http://localhost:5001/model-info
- [ ] Response contains "available_crops"
- [ ] Response contains "available_seasons"
- [ ] Response contains "available_states"
- [ ] Response contains "feature_importance"

#### Endpoint 3: Predict (via Postman)
- [ ] POST http://localhost:5001/predict
- [ ] Body (JSON):
```json
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
- [ ] Response contains "predicted_yield"
- [ ] Response contains "estimated_production"
- [ ] Response "status": "success"

---

## 📁 File System Verification

### Backend Files
- [ ] `backend/server.js` exists
- [ ] `backend/package.json` exists
- [ ] `backend/.env` exists (not .env.example)
- [ ] `backend/models/Crop.js` exists
- [ ] `backend/routes/cropRoutes.js` exists
- [ ] `backend/scripts/seedData.js` exists
- [ ] `backend/node_modules/` folder exists

### ML Service Files
- [ ] `ml-service/app.py` exists
- [ ] `ml-service/requirements.txt` exists
- [ ] `ml-service/venv/` folder exists
- [ ] `ml-service/crop_yield_model.pkl` exists (after first run)
- [ ] `ml-service/label_encoders.pkl` exists (after first run)

### Frontend Files
- [ ] `frontend/package.json` exists
- [ ] `frontend/src/App.js` exists
- [ ] `frontend/src/components/PredictionForm.js` exists
- [ ] `frontend/src/components/DataTable.js` exists
- [ ] `frontend/src/components/Statistics.js` exists
- [ ] `frontend/node_modules/` folder exists
- [ ] `frontend/build/` folder exists (after `npm run build`)

### Root Files
- [ ] `crop_yield.csv` exists
- [ ] `README.md` exists
- [ ] `MONGODB_SETUP.md` exists
- [ ] `QUICKSTART.md` exists
- [ ] `PROJECT_STRUCTURE.md` exists

---

## 🌐 Terminal Windows Check

### You Should Have 3 Terminals Running:

#### Terminal 1: Backend
```
Location: DM/backend
Command: npm run dev
Status: [ ] Running
Output: "Server running on port 5000"
```

#### Terminal 2: ML Service
```
Location: DM/ml-service
Command: python app.py
Status: [ ] Running
Output: "Running on http://0.0.0.0:5001"
```

#### Terminal 3: Frontend
```
Location: DM/frontend
Command: npm start
Status: [ ] Running
Output: "webpack compiled successfully"
```

---

## 🐛 Common Issues Resolution

### Issue: MongoDB Connection Failed
- [ ] Checked IP whitelist in MongoDB Atlas
- [ ] Verified username and password
- [ ] Confirmed cluster is active
- [ ] Tested connection string format
- [ ] No spaces in connection string

### Issue: Backend Won't Start
- [ ] Ran `npm install` again
- [ ] Checked `.env` file exists
- [ ] Verified port 5000 is available
- [ ] Checked for typos in `.env`

### Issue: ML Service Error
- [ ] Activated virtual environment
- [ ] Ran `pip install -r requirements.txt` again
- [ ] Verified `crop_yield.csv` is in parent directory
- [ ] Checked Python version (3.8+)

### Issue: Frontend Can't Connect
- [ ] Confirmed backend is running
- [ ] Cleared browser cache
- [ ] Checked proxy in `package.json`
- [ ] Verified no CORS errors in browser console

---

## 🎓 Knowledge Verification

### I Understand:
- [ ] What MongoDB Atlas is and why we use it
- [ ] What the backend API does
- [ ] What the ML service does
- [ ] How the frontend communicates with backend
- [ ] How to make predictions using the UI
- [ ] How to view and filter data
- [ ] Where to find logs when something goes wrong

### I Can:
- [ ] Start all three services
- [ ] Make a crop yield prediction
- [ ] View the data in the database
- [ ] Filter and search the data
- [ ] Read and understand the API responses
- [ ] Troubleshoot common errors

---

## 🚀 Ready for Development

### Final Checks:
- [ ] All services running without errors
- [ ] Can make predictions successfully
- [ ] Can view data in all three tabs
- [ ] MongoDB cluster shows activity
- [ ] Comfortable navigating the codebase
- [ ] Read through README.md
- [ ] Reviewed PROJECT_STRUCTURE.md

---

## 📝 Notes & Issues

*Use this space to note any issues or customizations:*

```
Issue 1: _______________________________________________
Solution: ______________________________________________

Issue 2: _______________________________________________
Solution: ______________________________________________

Custom Changes: _______________________________________
_____________________________________________________
```

---

## 🎉 Completion

### When ALL checkboxes are marked:
✅ **Your Crop Yield Prediction System is fully operational!**

You can now:
- Make machine learning predictions
- Analyze agricultural data
- Build upon this foundation
- Deploy to production
- Add new features

**Next Steps:**
1. Explore the code
2. Make customizations
3. Add new features
4. Deploy to cloud
5. Share with others

---

**🌾 Happy Farming & Coding! 🚀**
