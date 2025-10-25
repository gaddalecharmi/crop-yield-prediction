import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/crops/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="statistics-container">
      <h2>📈 Agricultural Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.totalRecords.toLocaleString()}</div>
          <div className="stat-label">Total Records</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-value">{stats.averageYield.toFixed(2)}</div>
          <div className="stat-label">Average Yield (tons/ha)</div>
        </div>
      </div>

      <div className="top-crops-section">
        <h3>🏆 Top 10 Crops by Average Yield</h3>
        <div className="crops-list">
          {stats.topCrops.map((crop, index) => (
            <div key={index} className="crop-item">
              <div className="crop-rank">#{index + 1}</div>
              <div className="crop-info">
                <div className="crop-name">{crop._id}</div>
                <div className="crop-details">
                  <span>Avg Yield: {crop.avgYield.toFixed(2)} tons/ha</span>
                  <span>Total Production: {crop.totalProduction.toLocaleString()} tons</span>
                </div>
              </div>
              <div className="crop-bar">
                <div 
                  className="crop-bar-fill" 
                  style={{ width: `${(crop.avgYield / stats.topCrops[0].avgYield) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
