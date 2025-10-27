import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './PredictionForm.css';
import { translateDropdownValue } from '../utils/translationMappings';

const PredictionForm = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    Crop: '',
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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setPrediction(null);

    // Auto-fill rainfall when state is selected
    if (name === 'State' && value) {
      try {
        const response = await axios.get(`/api/crops/rainfall/${value}`);
        if (response.data && response.data.estimated_annual_rainfall) {
          setFormData(prev => ({
            ...prev,
            State: value,
            Annual_Rainfall: response.data.estimated_annual_rainfall
          }));
        }
      } catch (err) {
        console.error('Error fetching rainfall data:', err);
        // Continue without rainfall data - user can enter manually
      }
    }
  };

  // New function to auto-predict fertilizer and pesticide
  const predictInputs = async (updatedFormData) => {
    const { Crop, Season, State, Area, Annual_Rainfall } = updatedFormData;
    
    // Check if all required fields are filled
    if (Crop && Season && State && Area && Annual_Rainfall) {
      try {
        console.log('🌾 Auto-predicting fertilizer and pesticide...');
        const response = await axios.post('/api/crops/predict-inputs', {
          Crop,
          Crop_Year: new Date().getFullYear(), // Use current year for backend
          Season,
          State,
          Area: parseFloat(Area),
          Annual_Rainfall: parseFloat(Annual_Rainfall)
        });
        
        if (response.data && response.data.success) {
          setFormData(prev => ({
            ...prev,
            Fertilizer: response.data.predicted_fertilizer,
            Pesticide: response.data.predicted_pesticide
          }));
          console.log('✅ Auto-filled fertilizer and pesticide');
        }
      } catch (err) {
        console.error('Error predicting inputs:', err);
        // Continue without auto-filled values - user can enter manually
      }
    }
  };

  // Trigger input prediction when Area or Annual_Rainfall changes (after all other fields are filled)
  useEffect(() => {
    const { Crop, Season, State, Area, Annual_Rainfall } = formData;
    if (Crop && Season && State && Area && Annual_Rainfall) {
      // Debounce the prediction to avoid too many API calls
      const timeoutId = setTimeout(() => {
        predictInputs(formData);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.Crop, formData.Season, formData.State, formData.Area, formData.Annual_Rainfall]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      console.log('🚀 Sending prediction request:', formData);
      // Add current year to the request
      const requestData = {
        ...formData,
        Crop_Year: new Date().getFullYear()
      };
      const response = await axios.post('/api/crops/predict', requestData);
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
      <h2> {t('prediction.title')}</h2>
      <p className="form-subtitle">{t('prediction.subtitle')}</p>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-row">
          <div className="form-group">
            <label>{t('prediction.form.crop')} *</label>
            <select
              name="Crop"
              value={formData.Crop}
              onChange={handleChange}
              required
            >
              <option value="">{t('prediction.form.cropPlaceholder')}</option>
              {filters.crops.map(crop => (
                <option key={crop} value={crop}>
                  {translateDropdownValue(crop, 'crop', i18n.language)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('prediction.form.season')} *</label>
            <select
              name="Season"
              value={formData.Season}
              onChange={handleChange}
              required
            >
              <option value="">{t('prediction.form.seasonPlaceholder')}</option>
              {filters.seasons.map(season => (
                <option key={season} value={season}>
                  {translateDropdownValue(season, 'season', i18n.language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('prediction.form.state')} *</label>
            <select
              name="State"
              value={formData.State}
              onChange={handleChange}
              required
            >
              <option value="">{t('prediction.form.statePlaceholder')}</option>
              {filters.states.map(state => (
                <option key={state} value={state}>
                  {translateDropdownValue(state, 'state', i18n.language)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('prediction.form.area')} *</label>
            <input
              type="number"
              name="Area"
              value={formData.Area}
              onChange={handleChange}
              placeholder={t('prediction.form.areaPlaceholder')}
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('prediction.form.rainfall')} * </label>
            <input
              type="number"
              name="Annual_Rainfall"
              value={formData.Annual_Rainfall}
              onChange={handleChange}
              placeholder={t('prediction.form.rainfallPlaceholder')}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>{t('prediction.form.fertilizer')} *</label>
            <input
              type="number"
              name="Fertilizer"
              value={formData.Fertilizer}
              onChange={handleChange}
              placeholder={t('prediction.form.fertilizerPlaceholder')}
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('prediction.form.pesticide')} * </label>
            <input
              type="number"
              name="Pesticide"
              value={formData.Pesticide}
              onChange={handleChange}
              placeholder={t('prediction.form.pesticidePlaceholder')}
              step="0.01"
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? t('prediction.form.predictingBtn') : t('prediction.form.predictBtn')}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h3>✅ {t('prediction.results.title')}</h3>
          {prediction.message && (
            <div className="success-message">
              {prediction.message}
            </div>
          )}
          <div className="result-grid">
            <div className="result-item highlight">
              <span className="label">🎯 {t('prediction.results.yield')}:</span>
              <span className="value">{prediction.predicted_yield} {t('prediction.results.tonsPerHectare')}</span>
            </div>
            <div className="result-item highlight">
              <span className="label">📊 {t('prediction.results.production')}:</span>
              <span className="value">{prediction.estimated_production?.toLocaleString()} {t('prediction.results.tons')}</span>
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

          <div className="prediction-summary">
            <h4>📋 Analysis Summary</h4>
            <p className="summary-text">
              Based on the current agricultural conditions and inputs provided, our AI model predicts a yield of <strong>{prediction.predicted_yield} tons per hectare</strong> for {prediction.input_data?.Crop} cultivation during the {prediction.input_data?.Season} season in {prediction.input_data?.State}. 
              With the cultivated area of {prediction.input_data?.Area} hectares, this translates to an estimated total production of <strong>{prediction.estimated_production?.toLocaleString()} tons</strong>. 
              This prediction takes into account the annual rainfall of {prediction.input_data?.Annual_Rainfall}mm, fertilizer application of {prediction.input_data?.Fertilizer}kg, and pesticide usage of {prediction.input_data?.Pesticide}kg. 
              These insights can help you make informed decisions about crop management, resource allocation, and market planning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
