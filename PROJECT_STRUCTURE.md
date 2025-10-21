# 🎯 Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│                 http://localhost:3000                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  REACT FRONTEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Prediction  │  │  Data Table  │  │ Statistics   │      │
│  │    Form      │  │   Component  │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Axios HTTP Requests
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS BACKEND (Express)                       │
│                  Port: 5000                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                           │  │
│  │  • GET  /api/crops         (get all crops)          │  │
│  │  • GET  /api/crops/filters (get filter options)     │  │
│  │  • GET  /api/crops/stats   (get statistics)         │  │
│  │  • POST /api/crops/predict (predict yield)          │  │
│  │  • POST /api/crops         (add new data)           │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┬────────────────────────────────────────┬────────────┘
        │                                        │
        ↓                                        ↓
┌──────────────────────┐           ┌──────────────────────┐
│   MONGODB ATLAS      │           │   PYTHON ML SERVICE  │
│   (Cloud Database)   │           │   Flask API          │
│                      │           │   Port: 5001         │
│  • crops collection  │           │                      │
│  • 20,000 records    │           │  • Train Model       │
│  • Indexed queries   │           │  • Make Predictions  │
│                      │           │  • Random Forest     │
└──────────────────────┘           └──────────────────────┘
```

---

## Data Flow

### 1. User Makes a Prediction

```
User Input (Frontend)
    ↓
React Form Component
    ↓
axios.post('/api/crops/predict', data)
    ↓
Express Backend (server.js)
    ↓
Route Handler (cropRoutes.js)
    ↓
axios.post('http://localhost:5001/predict', data)
    ↓
Flask ML Service (app.py)
    ↓
Random Forest Model
    ↓
Prediction Result
    ↓
JSON Response
    ↓
Frontend Display
```

### 2. User Views Data

```
User Click (Frontend)
    ↓
React DataTable Component
    ↓
axios.get('/api/crops?page=1&limit=20')
    ↓
Express Backend
    ↓
MongoDB Query
    ↓
Crop.find().limit(20).skip(0)
    ↓
JSON Response
    ↓
Table Rendering
```

---

## Technology Stack Details

### Frontend Layer
```
React 18
├── Components
│   ├── PredictionForm.js    (Input form + prediction display)
│   ├── DataTable.js          (Paginated data viewer)
│   └── Statistics.js         (Analytics dashboard)
├── Styling
│   ├── CSS3 with Gradients
│   └── Responsive Design
└── State Management
    └── React Hooks (useState, useEffect)
```

### Backend Layer
```
Node.js + Express
├── Server (server.js)
│   ├── CORS enabled
│   ├── JSON parsing
│   └── Error handling
├── Models (Mongoose)
│   └── Crop Schema
├── Routes
│   └── CRUD operations
└── Database
    └── MongoDB Atlas connection
```

### ML Service Layer
```
Python Flask
├── Machine Learning
│   ├── Scikit-learn
│   ├── Random Forest Regressor
│   └── Label Encoding
├── Data Processing
│   ├── Pandas DataFrames
│   └── NumPy arrays
└── Model Persistence
    └── Pickle files
```

### Database Layer
```
MongoDB Atlas (Cloud)
├── Database: crop_yield_db
├── Collection: crops
├── Indexes
│   ├── Crop + State + Year
│   ├── State
│   └── Crop
└── Features
    ├── Auto-scaling
    ├── Backups (paid tier)
    └── Monitoring
```

---

## File Structure Explained

```
DM/
│
├── 📁 backend/
│   ├── 📁 models/
│   │   └── Crop.js                 # Mongoose schema definition
│   │
│   ├── 📁 routes/
│   │   └── cropRoutes.js           # API endpoint handlers
│   │
│   ├── 📁 scripts/
│   │   └── seedData.js             # CSV to MongoDB importer
│   │
│   ├── server.js                   # Main Express server
│   ├── package.json                # Node dependencies
│   ├── .env.example                # Environment template
│   ├── .env                        # Your config (gitignored)
│   └── .gitignore
│
├── 📁 ml-service/
│   ├── app.py                      # Flask app + ML model
│   ├── requirements.txt            # Python dependencies
│   ├── crop_yield_model.pkl        # Trained model (generated)
│   ├── label_encoders.pkl          # Encoders (generated)
│   ├── venv/                       # Virtual environment
│   └── .gitignore
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   └── index.html              # HTML template
│   │
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── PredictionForm.js   # Prediction UI
│   │   │   ├── PredictionForm.css
│   │   │   ├── DataTable.js        # Data viewer
│   │   │   ├── DataTable.css
│   │   │   ├── Statistics.js       # Stats dashboard
│   │   │   └── Statistics.css
│   │   │
│   │   ├── App.js                  # Main app component
│   │   ├── App.css                 # App styling
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   │
│   ├── package.json                # React dependencies
│   ├── .gitignore
│   └── node_modules/               # Installed packages
│
├── 📄 crop_yield.csv               # Original dataset (20K records)
├── 📄 README.md                    # Full documentation
├── 📄 MONGODB_SETUP.md             # Database setup guide
├── 📄 QUICKSTART.md                # Quick start guide
└── 📄 PROJECT_STRUCTURE.md         # This file
```

---

## API Request/Response Examples

### 1. Get All Crops
**Request:**
```http
GET /api/crops?page=1&limit=20&crop=Rice&state=Punjab
```

**Response:**
```json
{
  "crops": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "Crop": "Rice",
      "Crop_Year": 2020,
      "Season": "Kharif",
      "State": "Punjab",
      "Area": 15000,
      "Production": 12000,
      "Annual_Rainfall": 1200.5,
      "Fertilizer": 50000.25,
      "Pesticide": 1500.75,
      "Yield": 0.8
    }
  ],
  "totalPages": 50,
  "currentPage": 1,
  "totalRecords": 1000
}
```

### 2. Predict Yield
**Request:**
```http
POST /api/crops/predict
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

**Response:**
```json
{
  "predicted_yield": 2.4567,
  "estimated_production": 2456.7,
  "input_data": { ... },
  "status": "success"
}
```

### 3. Get Statistics
**Request:**
```http
GET /api/crops/stats
```

**Response:**
```json
{
  "totalRecords": 19690,
  "averageYield": 1.8234,
  "topCrops": [
    {
      "_id": "Coconut",
      "avgYield": 5238.05,
      "totalProduction": 126905000
    }
  ]
}
```

---

## Security Considerations

### Current Setup (Development)
- ✅ CORS enabled for localhost
- ✅ Environment variables for secrets
- ✅ .gitignore for sensitive files
- ⚠️ MongoDB accessible from anywhere (0.0.0.0/0)

### Production Recommendations
- 🔒 Restrict CORS to specific domains
- 🔒 Use HTTPS/SSL certificates
- 🔒 Implement rate limiting
- 🔒 Add authentication/authorization
- 🔒 Restrict MongoDB to specific IPs
- 🔒 Use MongoDB encryption at rest
- 🔒 Enable audit logs
- 🔒 Input validation & sanitization

---

## Performance Optimizations

### Database
- ✅ Indexed fields (Crop, State, Year)
- ✅ Pagination for large datasets
- ✅ Connection pooling (Mongoose default)

### Backend
- ✅ Express compression middleware
- ✅ Async/await for non-blocking operations
- ⚡ Consider caching frequently accessed data (Redis)

### Frontend
- ✅ React component optimization
- ✅ Lazy loading for routes
- ⚡ Consider code splitting for production

### ML Service
- ✅ Model pre-trained and saved
- ✅ Fast predictions using pickle
- ⚡ Consider model versioning

---

## Scaling Strategy

### When to Scale

**Current Capacity (FREE tier):**
- MongoDB: 512 MB storage (~500K records)
- Backend: Single instance
- ML Service: Single instance
- Frontend: Static hosting

**Scale When:**
- Database > 400 MB
- Response time > 2 seconds
- Concurrent users > 100
- ML predictions > 1000/hour

### How to Scale

1. **Database**: Upgrade MongoDB to M10+ cluster
2. **Backend**: Deploy multiple instances + load balancer
3. **ML Service**: Use Redis cache + model serving framework
4. **Frontend**: CDN for static assets

---

## Monitoring & Logging

### Current Setup
- Console logs for development
- MongoDB Atlas monitoring dashboard

### Production Recommendations
- **APM**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Logging**: Winston (Node.js), Python logging
- **Uptime**: Pingdom, UptimeRobot
- **Analytics**: Google Analytics

---

## Development Workflow

```
1. Make Changes
   ↓
2. Test Locally
   ├── Backend: npm run dev
   ├── ML Service: python app.py
   └── Frontend: npm start
   ↓
3. Commit to Git
   ↓
4. Deploy
   ├── Backend → Heroku/Railway
   ├── ML Service → Heroku/Railway
   └── Frontend → Vercel/Netlify
   ↓
5. Monitor
```

---

## Testing Strategy

### Unit Tests
- Backend: Jest + Supertest
- Frontend: React Testing Library
- ML Service: pytest

### Integration Tests
- API endpoint tests
- Database operations
- ML model predictions

### End-to-End Tests
- Cypress or Playwright
- User flow testing

---

**📊 This architecture supports 1000+ concurrent users with proper scaling!**
