import React, { useState } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm';
import DataTable from './components/DataTable';
import Statistics from './components/Statistics';
import LearningDashboard from './components/LearningDashboard';
import ShopDashboard from './components/ShopDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🌾 Crop Yield Prediction System</h1>
            <p>Machine Learning-Based Agricultural Analysis</p>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`nav-button ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
          title="Predict Crop Yield"
        >
          <span className="nav-icon">🌾</span>
          <span className="nav-label">Predict</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
          title="Learn about farming"
        >
          <span className="nav-icon">📚</span>
          <span className="nav-label">Learning</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
          title="Buy agricultural products"
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Shop</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
          title="View historical data"
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Data</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
          title="View statistics"
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">Statistics</span>
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'predict' && <PredictionForm />}
        {activeTab === 'learning' && <LearningDashboard />}
        {activeTab === 'shop' && <ShopDashboard />}
        {activeTab === 'data' && <DataTable />}
        {activeTab === 'stats' && <Statistics />}
      </main>

      <footer className="App-footer">
        <p>© 2025 Crop Yield Prediction System | Powered by Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;
