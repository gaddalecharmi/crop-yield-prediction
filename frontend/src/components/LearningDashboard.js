import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './LearningDashboard.css';

function LearningDashboard() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/learning/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContent = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/learning/content`, {
        params: { category }
      });
      setContent(response.data);
      setSelectedCategory(category);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewContent = async (contentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/learning/content/${contentId}`);
      setSelectedContent(response.data);
    } catch (error) {
      console.error('Error fetching content details:', error);
    }
  };

  const likeContent = async (contentId) => {
    try {
      await axios.post(`http://localhost:5000/api/learning/content/${contentId}/like`);
      // Refresh content
      if (selectedContent && selectedContent._id === contentId) {
        viewContent(contentId);
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  if (selectedContent) {
    return (
      <div className="learning-dashboard">
        <button className="back-button" onClick={() => setSelectedContent(null)}>
          ← {t('learning.goBack')}
        </button>
        <div className="content-detail">
          <h2>{selectedContent.title}</h2>
          <div className="content-meta">
            <span className="badge">{selectedContent.category.replace(/_/g, ' ')}</span>
            <span className="difficulty">{selectedContent.difficulty}</span>
            <span>📖 {selectedContent.estimatedReadTime} {t('learning.minRead')}</span>
            <span>👁️ {selectedContent.views} {t('learning.views')}</span>
            <span>❤️ {selectedContent.likes} {t('learning.likes')}</span>
          </div>
          
          {selectedContent.videoUrl && (
            <div className="video-container">
              <iframe
                src={selectedContent.videoUrl}
                title={selectedContent.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className="content-body">
            <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
          </div>

          {selectedContent.images && selectedContent.images.length > 0 && (
            <div className="content-images">
              {selectedContent.images.map((img, index) => (
                <div key={index} className="image-wrapper">
                  <img src={img.url} alt={img.caption} />
                  {img.caption && <p className="caption">{img.caption}</p>}
                </div>
              ))}
            </div>
          )}

          <button className="like-button" onClick={() => likeContent(selectedContent._id)}>
            ❤️ {t('learning.like')} ({selectedContent.likes})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-dashboard">
      <div className="dashboard-header">
        <h2>📚 {t('learning.title')}</h2>
        <p>{t('learning.subtitle')}</p>
      </div>

      {!selectedCategory ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.value}
              className="category-card"
              onClick={() => fetchContent(category.value)}
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.label}</h3>
              <p>{t('learning.explore')}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="content-list">
          <button className="back-button" onClick={() => setSelectedCategory(null)}>
            ← {t('learning.goBack')}
          </button>
          
          {loading ? (
            <div className="loading">{t('learning.loading')}</div>
          ) : content.length === 0 ? (
            <div className="no-content">
              <p>😔 {t('learning.noContent')}</p>
            </div>
          ) : (
            <div className="content-grid">
              {content.map((item) => (
                <div key={item._id} className="content-card" onClick={() => viewContent(item._id)}>
                  <h3>{item.title}</h3>
                  {item.crop && <span className="crop-tag">🌾 {item.crop}</span>}
                  <div className="content-meta-small">
                    <span>📖 {item.estimatedReadTime} min</span>
                    <span>👁️ {item.views}</span>
                    <span>❤️ {item.likes}</span>
                  </div>
                  <p className="content-preview">
                    {item.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <div className="content-tags">
                    {item.tags && item.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LearningDashboard;
