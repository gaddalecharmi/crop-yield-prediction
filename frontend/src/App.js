import React, { useState } from 'react';
import './App.css';
import PredictionForm from './components/PredictionForm';
import DataTable from './components/DataTable';
import Statistics from './components/Statistics';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌾 Crop Yield Prediction System</h1>
        <p>Machine Learning-Based Agricultural Analysis</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'predict' ? 'active' : ''}
          onClick={() => setActiveTab('predict')}
        >
          Predict Yield
        </button>
        <button 
          className={activeTab === 'data' ? 'active' : ''}
          onClick={() => setActiveTab('data')}
        >
          View Data
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'predict' && <PredictionForm />}
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
