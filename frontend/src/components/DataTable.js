import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataTable.css';

const DataTable = () => {
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

  useEffect(() => {
    fetchCrops();
  }, [currentPage, filters]);

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
      <h2>📊 Crop Yield Data</h2>

      <div className="filters">
        <input
          type="text"
          name="crop"
          placeholder="Filter by crop..."
          value={filters.crop}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="state"
          placeholder="Filter by state..."
          value={filters.state}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="season"
          placeholder="Filter by season..."
          value={filters.season}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="year"
          placeholder="Filter by year..."
          value={filters.year}
          onChange={handleFilterChange}
        />
        <button onClick={handleClearFilters} className="clear-btn">
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Year</th>
                  <th>Season</th>
                  <th>State</th>
                  <th>Area (ha)</th>
                  <th>Production</th>
                  <th>Yield</th>
                  <th>Rainfall (mm)</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop, index) => (
                  <tr key={index}>
                    <td>{crop.Crop}</td>
                    <td>{crop.Crop_Year}</td>
                    <td>{crop.Season}</td>
                    <td>{crop.State}</td>
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
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DataTable;
