import React, { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n'; // Initialize i18n
import PredictionForm from './components/PredictionForm';
import DataTable from './components/DataTable';
import Statistics from './components/Statistics';
import LearningDashboard from './components/LearningDashboard';
import ShopDashboard from './components/ShopDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div className="loading-screen">Loading translations...</div>}>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div>
              <h1>🌾 {t('app.title')}</h1>
              <p>{t('app.subtitle')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </header>

        <nav className="nav-tabs">
          <button 
            className={activeTab === 'predict' ? 'active' : ''}
            onClick={() => setActiveTab('predict')}
          >
            {t('nav.predict')}
          </button>
          <button 
            className={activeTab === 'learning' ? 'active' : ''}
            onClick={() => setActiveTab('learning')}
          >
            {t('nav.learning')}
          </button>
          <button 
            className={activeTab === 'shop' ? 'active' : ''}
            onClick={() => setActiveTab('shop')}
          >
            {t('nav.shop')}
          </button>
          <button 
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            {t('nav.data')}
          </button>
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            {t('nav.statistics')}
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
    </Suspense>
  );
}

export default App;
