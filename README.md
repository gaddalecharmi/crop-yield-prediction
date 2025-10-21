# 🌾 Crop Yield Prediction System

A full-stack machine learning application for predicting crop yields based on various agricultural parameters including rainfall, fertilizer usage, pesticide application, and historical data.

## 📋 Project Structure

```
DM/
├── backend/              # Node.js + Express + MongoDB
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeding scripts
│   ├── server.js        # Main server file
│   └── package.json
├── ml-service/          # Python Flask ML API
│   ├── app.py          # Flask application
│   └── requirements.txt
├── frontend/            # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── crop_yield.csv       # Dataset
```

## 🚀 Features

- **ML Prediction**: Random Forest model for accurate crop yield prediction
- **Data Visualization**: Interactive statistics and data tables
- **Filter & Search**: Advanced filtering by crop, state, season, and year
- **RESTful API**: Well-structured backend with MongoDB integration
- **Responsive UI**: Modern React frontend with beautiful gradients

## 📊 Tech Stack

### Backend
- Node.js & Express.js
- MongoDB (with Mongoose ODM)
- Axios for HTTP requests

### ML Service
- Python 3.x
- Flask & Flask-CORS
- Scikit-learn (Random Forest)
- Pandas & NumPy

### Frontend
- React 18
- Axios for API calls
- CSS3 with modern styling

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

---

## 📦 Step 1: MongoDB Atlas Setup

### Creating a MongoDB Cluster

1. **Sign Up / Log In to MongoDB Atlas**
   - Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free" or "Sign In"
   - Create a new account or log in with existing credentials

2. **Create a New Cluster**
   - Click "Build a Cluster"
   - Choose the **FREE tier** (M0 Sandbox)
   - Select your preferred **Cloud Provider** (AWS, Google Cloud, or Azure)
   - Choose a **Region** closest to your location
   - Cluster Name: `CropYieldCluster` (or any name you prefer)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Authentication Method: **Password**
   - Username: `cropuser` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Option 1: Click "Allow Access from Anywhere" (0.0.0.0/0) - for development
   - Option 2: Add your current IP address - more secure
   - Click "Confirm"

5. **Get Your Connection String**
   - Go to "Clusters" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: **Node.js**
   - Version: **4.1 or later**
   - Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cropyieldcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<username>` and `<password>` with your database user credentials

---

## 💻 Step 2: Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create .env file**
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Edit .env file** (use notepad or any text editor)
   ```powershell
   notepad .env
   ```

   Update with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://cropuser:YOUR_PASSWORD@cropyieldcluster.xxxxx.mongodb.net/crop_yield_db?retryWrites=true&w=majority
   PORT=5000
   ML_SERVICE_URL=http://localhost:5001
   ```

5. **Install csvtojson for data seeding**
   ```powershell
   npm install csvtojson
   ```

6. **Seed the database with crop data**
   ```powershell
   npm run seed
   ```
   This will import all data from `crop_yield.csv` into MongoDB.

7. **Start the backend server**
   ```powershell
   npm run dev
   ```
   Server should run on `http://localhost:5000`

---

## 🤖 Step 3: ML Service Setup

1. **Open a new terminal and navigate to ml-service directory**
   ```powershell
   cd ml-service
   ```

2. **Create a virtual environment (recommended)**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Python dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Start the ML service**
   ```powershell
   python app.py
   ```
   The ML service will:
   - Load the crop_yield.csv dataset
   - Train a Random Forest model
   - Save the model for future predictions
   - Run on `http://localhost:5001`

---

## 🎨 Step 4: Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Start the React development server**
   ```powershell
   npm start
   ```
   Application opens at `http://localhost:3000`

---

## 🔄 Running the Complete Application

You need **THREE terminals** running simultaneously:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - ML Service:**
```powershell
cd ml-service
.\venv\Scripts\Activate.ps1
python app.py
```

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm start
```

## 📱 Using the Application

### 1. Predict Yield Tab
- Select crop type, season, and state from dropdowns
- Enter area, rainfall, fertilizer, and pesticide amounts
- Click "Predict Yield" to get ML-based predictions

### 2. View Data Tab
- Browse the complete crop yield dataset
- Filter by crop, state, season, or year
- Paginated view of all records

### 3. Statistics Tab
- View total records and average yields
- See top 10 crops by average yield
- Visual bar charts for comparison

## 🔌 API Endpoints

### Backend API (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crops` | Get all crops (with pagination & filters) |
| GET | `/api/crops/filters` | Get unique values for filters |
| GET | `/api/crops/stats` | Get agricultural statistics |
| POST | `/api/crops/predict` | Predict crop yield |
| GET | `/api/crops/:id` | Get specific crop by ID |
| POST | `/api/crops` | Add new crop data |

### ML Service API (Port 5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service health check |
| POST | `/train` | Train/retrain the ML model |
| POST | `/predict` | Make yield prediction |
| GET | `/model-info` | Get model information |

## 📊 Dataset Information

The `crop_yield.csv` contains approximately 20,000 records with the following fields:
- **Crop**: Type of crop (Rice, Wheat, etc.)
- **Crop_Year**: Year of cultivation
- **Season**: Growing season (Kharif, Rabi, Whole Year, etc.)
- **State**: Indian state
- **Area**: Cultivation area in hectares
- **Production**: Total production
- **Annual_Rainfall**: Rainfall in mm
- **Fertilizer**: Fertilizer used in kg
- **Pesticide**: Pesticide used in kg
- **Yield**: Crop yield (target variable)

## 🧠 Machine Learning Model

- **Algorithm**: Random Forest Regressor
- **Features**: Crop, Season, State, Area, Rainfall, Fertilizer, Pesticide
- **Target**: Yield (tons per hectare)
- **Preprocessing**: Label encoding for categorical variables
- **Train-Test Split**: 80-20 ratio

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Check username and password in connection string
- Ensure no spaces in the connection string
- Check if firewall is blocking port 27017

### Backend Issues
- Check if port 5000 is available
- Verify .env file is properly configured
- Ensure MongoDB is connected before seeding

### ML Service Issues
- Verify Python version (3.8+)
- Check if crop_yield.csv exists in the parent directory
- Ensure all dependencies are installed
- Check if port 5001 is available

### Frontend Issues
- Clear browser cache
- Check if backend is running
- Verify proxy setting in package.json

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
ML_SERVICE_URL=http://localhost:5001
```

## 🚀 Deployment Recommendations

### Backend & ML Service
- **Heroku** or **Railway**
- **AWS EC2** or **Azure VM**
- **Google Cloud Run**

### Frontend
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

### Database
- **MongoDB Atlas** (already cloud-hosted)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open-source and available under the MIT License.

## 👨‍💻 Support

For issues or questions:
- Check the Troubleshooting section
- Review MongoDB Atlas documentation
- Check console logs for error messages

---

**Built with ❤️ for Agricultural Innovation**
