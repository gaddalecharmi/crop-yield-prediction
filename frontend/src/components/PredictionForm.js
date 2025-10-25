import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PredictionForm.css';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    Crop: '',
    Crop_Year: new Date().getFullYear(),
    Season: '',
    State: '',
    Area: '',
    Annual_Rainfall: '',
    Fertilizer: '',
    Pesticide: ''
  });

  const [filters, setFilters] = useState({
    crops: [],
    seasons: [],
    states: []
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/crops/filters');
      setFilters(response.data);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setPrediction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      console.log('🚀 Sending prediction request:', formData);
      const response = await axios.post('/api/crops/predict', formData);
      console.log('✅ Prediction response:', response.data);
      setPrediction(response.data);
    } catch (err) {
      console.error('❌ Prediction error:', err);
      setError(err.response?.data?.error || err.response?.data?.details || 'Error making prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-form-container">
      <h2>🔮 Predict Crop Yield</h2>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-row">
          <div className="form-group">
            <label>Crop Type *</label>
            <select
              name="Crop"
              value={formData.Crop}
              onChange={handleChange}
              required
            >
              <option value="">Select Crop</option>
              {filters.crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Crop Year *</label>
            <input
              type="number"
              name="Crop_Year"
              value={formData.Crop_Year}
              onChange={handleChange}
              placeholder="e.g., 2025"
              min="1990"
              max={new Date().getFullYear() + 5}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Season *</label>
            <select
              name="Season"
              value={formData.Season}
              onChange={handleChange}
              required
            >
              <option value="">Select Season</option>
              {filters.seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>State *</label>
            <select
              name="State"
              value={formData.State}
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {filters.states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Area (hectares) *</label>
            <input
              type="number"
              name="Area"
              value={formData.Area}
              onChange={handleChange}
              placeholder="Enter area in hectares"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Annual Rainfall (mm) *</label>
            <input
              type="number"
              name="Annual_Rainfall"
              value={formData.Annual_Rainfall}
              onChange={handleChange}
              placeholder="Enter rainfall"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Fertilizer (kg) *</label>
            <input
              type="number"
              name="Fertilizer"
              value={formData.Fertilizer}
              onChange={handleChange}
              placeholder="Enter fertilizer amount"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pesticide (kg) *</label>
            <input
              type="number"
              name="Pesticide"
              value={formData.Pesticide}
              onChange={handleChange}
              placeholder="Enter pesticide amount"
              step="0.01"
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '🔄 Predicting...' : '📊 Predict Yield'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h3>✅ Prediction Results</h3>
          {prediction.message && (
            <div className="success-message">
              {prediction.message}
            </div>
          )}
          <div className="result-grid">
            <div className="result-item highlight">
              <span className="label">🎯 Predicted Yield:</span>
              <span className="value">{prediction.predicted_yield} tons/hectare</span>
            </div>
            <div className="result-item highlight">
              <span className="label">📊 Estimated Production:</span>
              <span className="value">{prediction.estimated_production?.toLocaleString()} tons</span>
            </div>
            <div className="result-item">
              <span className="label">🆔 Prediction ID:</span>
              <span className="value">{prediction.prediction_id}</span>
            </div>
            <div className="result-item">
              <span className="label">🤖 Model Version:</span>
              <span className="value">{prediction.model_version}</span>
            </div>
            <div className="result-item">
              <span className="label">📅 Prediction Date:</span>
              <span className="value">{new Date(prediction.prediction_date).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="input-summary">
            <h4>📝 Input Summary</h4>
            <div className="input-grid">
              <div className="input-item">
                <span className="label">Crop:</span>
                <span className="value">{prediction.input_data?.Crop}</span>
              </div>
              <div className="input-item">
                <span className="label">Season:</span>
                <span className="value">{prediction.input_data?.Season}</span>
              </div>
              <div className="input-item">
                <span className="label">State:</span>
                <span className="value">{prediction.input_data?.State}</span>
              </div>
              <div className="input-item">
                <span className="label">Area:</span>
                <span className="value">{prediction.input_data?.Area} hectares</span>
              </div>
              <div className="input-item">
                <span className="label">Rainfall:</span>
                <span className="value">{prediction.input_data?.Annual_Rainfall} mm</span>
              </div>
              <div className="input-item">
                <span className="label">Fertilizer:</span>
                <span className="value">{prediction.input_data?.Fertilizer} kg</span>
              </div>
              <div className="input-item">
                <span className="label">Pesticide:</span>
                <span className="value">{prediction.input_data?.Pesticide} kg</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
