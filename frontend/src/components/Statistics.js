import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Scatter, Doughnut } from 'react-chartjs-2';
import './Statistics.css';
import { translateDropdownValue } from '../utils/translationMappings';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statistics = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use dedicated statistics endpoint that returns all data without pagination
      const response = await axios.get('/api/crops/stats/all');
      // The response is directly an array
      const cropData = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Fetched crop data:', cropData.length, 'records');
      if (cropData.length > 0) {
        console.log('📊 Sample data:', cropData[0]);
      }
      setData(cropData);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError('Failed to load statistics data. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('statistics.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ {error}</p>
        <button onClick={fetchData} className="retry-btn">{t('statistics.retry')}</button>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="no-data-container">
        <p>📊 {t('statistics.noData')}</p>
        <button onClick={fetchData} className="retry-btn">{t('statistics.loadData')}</button>
      </div>
    );
  }

  // Data processing for charts
  
  // Get unique crops and states for filters
  const uniqueCrops = ['All', ...new Set(data.map(item => item.Crop))].sort();
  const uniqueStates = ['All', ...new Set(data.map(item => item.State))].sort();

  // Filter data based on selections
  const getFilteredData = (cropFilter, stateFilter) => {
    return data.filter(item => {
      const matchCrop = cropFilter === 'All' || item.Crop === cropFilter;
      const matchState = stateFilter === 'All' || item.State === stateFilter;
      return matchCrop && matchState;
    });
  };

  // 1. Yield Trend Over the Years (Line Chart) - with crop filter
  const filteredDataForYield = getFilteredData(selectedCrop, 'All');
  const yearlyData = filteredDataForYield.reduce((acc, item) => {
    const year = item.Crop_Year || new Date().getFullYear();
    if (!acc[year]) {
      acc[year] = { total: 0, count: 0 };
    }
    acc[year].total += item.Yield || 0;
    acc[year].count += 1;
    return acc;
  }, {});

  const sortedYears = Object.keys(yearlyData).sort((a, b) => Number(a) - Number(b));
  const yieldTrendChart = {
    labels: sortedYears,
    datasets: [{
      label: selectedCrop === 'All' ? 'Average Yield Over Years (All Crops)' : `${selectedCrop} - Yield Over Years`,
      data: sortedYears.map(year => (yearlyData[year].total / yearlyData[year].count).toFixed(2)),
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#36A2EB',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  // 2. State-wise Yield for Each Crop (independent from crop filter)
  // Only use selectedState filter, not selectedCrop
  const filteredDataForState = getFilteredData('All', selectedState);
  
  const stateCropYieldData = filteredDataForState.reduce((acc, item) => {
    const state = item.State;
    const crop = item.Crop;
    const key = `${state}|${crop}`;
    
    if (!acc[key]) {
      acc[key] = { state, crop, total: 0, count: 0 };
    }
    acc[key].total += item.Yield || 0;
    acc[key].count += 1;
    return acc;
  }, {});

  const stateCropYieldArray = Object.values(stateCropYieldData)
    .map(item => ({
      state: item.state,
      crop: item.crop,
      avgYield: item.total / item.count
    }))
    .sort((a, b) => b.avgYield - a.avgYield);

  // Group by state or crop depending on selectedState filter only
  let stateYieldChart;
  if (selectedState !== 'All') {
    // Show yield for all crops in selected state
    const cropData = {};
    stateCropYieldArray
      .filter(item => item.state === selectedState)
      .forEach(item => {
        cropData[item.crop] = item.avgYield;
      });
    
    stateYieldChart = {
      labels: Object.keys(cropData),
      datasets: [{
        label: `${selectedState} - Average Yield by Crop`,
        data: Object.values(cropData).map(y => y.toFixed(2)),
        backgroundColor: '#FF6384',
        borderColor: '#FF4364',
        borderWidth: 1,
        borderRadius: 5
      }]
    };
  } else {
    // Show all states, all crops average
    const stateAvgData = data.reduce((acc, item) => {
      if (!acc[item.State]) {
        acc[item.State] = { total: 0, count: 0 };
      }
      acc[item.State].total += item.Yield || 0;
      acc[item.State].count += 1;
      return acc;
    }, {});

    const sortedStates = Object.entries(stateAvgData)
      .map(([state, values]) => ({
        state,
        avgYield: values.total / values.count
      }))
      .sort((a, b) => b.avgYield - a.avgYield);

    stateYieldChart = {
      labels: sortedStates.map(item => item.state),
      datasets: [{
        label: 'Average Yield by State (All Crops)',
        data: sortedStates.map(item => item.avgYield.toFixed(2)),
        backgroundColor: '#9966FF',
        borderColor: '#7744DD',
        borderWidth: 1,
        borderRadius: 5
      }]
    };
  }

  // Summary Statistics (kept for reference, not displayed)
  const totalRecords = data.length;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 15,
          boxWidth: 15
        },
        display: true
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 12 }
      }
    }
  };

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h1>📊 {t('statistics.title')}</h1>
        <p className="stats-subtitle">{t('statistics.subtitle')}</p>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Yield Trend Over Years - WITH FILTER INSIDE */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>📈 {t('statistics.charts.yieldTrend')}</h3>
            <div className="chart-filter">
              <label>{t('statistics.charts.filterByCrop')}</label>
              <select 
                value={selectedCrop} 
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="filter-select-inline"
              >
                {uniqueCrops.map(crop => (
                  <option key={crop} value={crop}>
                    {crop === 'All' ? t('statistics.charts.allCrops') : translateDropdownValue(crop, 'crop', i18n.language)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={yieldTrendChart} options={{
              ...chartOptions,
              scales: {
                y: { title: { display: true, text: t('statistics.charts.avgYield') } },
                x: { title: { display: true, text: t('statistics.charts.year') } }
              }
            }} />
          </div>
        </div>

        {/* State-wise Yield - WITH FILTER INSIDE - VERTICAL BAR */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>🗺️ {selectedState !== 'All' 
                ? t('statistics.charts.stateYieldByCrop', { state: selectedState })
                : t('statistics.charts.allCropsState')}</h3>
            <div className="chart-filter">
              <label>{t('statistics.charts.filterByState')}</label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="filter-select-inline"
              >
                {uniqueStates.map(state => (
                  <option key={state} value={state}>
                    {state === 'All' ? t('statistics.charts.allStates') : translateDropdownValue(state, 'state', i18n.language)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar data={stateYieldChart} options={{
              ...chartOptions,
              scales: {
                y: { title: { display: true, text: t('statistics.charts.avgYield') } },
                x: { 
                  title: { display: true, text: selectedState !== 'All' ? t('statistics.charts.crop') : t('statistics.charts.state') },
                  ticks: {
                    autoSkip: false,
                    maxRotation: 90,
                    minRotation: 45
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

