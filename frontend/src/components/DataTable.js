import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './DataTable.css';
import { translateDropdownValue } from '../utils/translationMappings';

const DataTable = () => {
  const { t, i18n } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    crop: '',
    state: '',
    season: '',
    year: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    crops: [],
    states: [],
    seasons: [],
    years: []
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCrops();
  }, [currentPage, filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/api/crops/filters');
      setFilterOptions({
        crops: response.data.crops || [],
        states: response.data.states || [],
        seasons: response.data.seasons || [],
        years: response.data.years || []
      });
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });
      const response = await axios.get(`/api/crops?${params}`);
      setCrops(response.data.crops);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ crop: '', state: '', season: '', year: '' });
    setCurrentPage(1);
  };

  return (
    <div className="data-table-container">
      <h2>📊 {t('dataTable.title')}</h2>
      <p className="table-subtitle">{t('dataTable.subtitle')}</p>

      <div className="filters">
        <select
          name="crop"
          value={filters.crop}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">{t('dataTable.filters.allCrops')}</option>
          {filterOptions.crops.map(crop => (
            <option key={crop} value={crop}>
              {translateDropdownValue(crop, 'crop', i18n.language)}
            </option>
          ))}
        </select>

        <select
          name="state"
          value={filters.state}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">{t('dataTable.filters.allStates')}</option>
          {filterOptions.states.map(state => (
            <option key={state} value={state}>
              {translateDropdownValue(state, 'state', i18n.language)}
            </option>
          ))}
        </select>

        <select
          name="season"
          value={filters.season}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">{t('dataTable.filters.allSeasons')}</option>
          {filterOptions.seasons.map(season => (
            <option key={season} value={season}>
              {translateDropdownValue(season, 'season', i18n.language)}
            </option>
          ))}
        </select>

        <select
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">{t('dataTable.filters.allYears')}</option>
          {filterOptions.years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button onClick={handleClearFilters} className="clear-btn">
          {t('common.clear')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('common.loading')}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('dataTable.columns.crop')}</th>
                  <th>{t('dataTable.columns.year')}</th>
                  <th>{t('dataTable.columns.season')}</th>
                  <th>{t('dataTable.columns.state')}</th>
                  <th>{t('dataTable.columns.area')}</th>
                  <th>{t('dataTable.columns.production')}</th>
                  <th>{t('dataTable.columns.yield')}</th>
                  <th>{t('dataTable.columns.rainfall')}</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop, index) => (
                  <tr key={index}>
                    <td>{translateDropdownValue(crop.Crop, 'crop', i18n.language)}</td>
                    <td>{crop.Crop_Year}</td>
                    <td>{translateDropdownValue(crop.Season, 'season', i18n.language)}</td>
                    <td>{translateDropdownValue(crop.State, 'state', i18n.language)}</td>
                    <td>{crop.Area.toLocaleString()}</td>
                    <td>{crop.Production.toLocaleString()}</td>
                    <td>{crop.Yield.toFixed(2)}</td>
                    <td>{crop.Annual_Rainfall.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {t('dataTable.previous')}
            </button>
            <span>
              {t('dataTable.showing')} {currentPage} {t('dataTable.of')} {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {t('dataTable.next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DataTable;
