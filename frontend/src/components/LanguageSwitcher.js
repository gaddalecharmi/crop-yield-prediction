import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Supported languages - 5 Main Indian Languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      setIsOpen(false);
      
      // Save preference to localStorage
      localStorage.setItem('i18nextLng', langCode);
      
      // Optional: Send analytics or log language change
      console.log(`Language changed to: ${langCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <div className="language-switcher">
      <button 
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
      >
        <span className="flag">{currentLanguage.flag}</span>
        <span className="lang-name">{currentLanguage.name}</span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          <div className="language-overlay" onClick={() => setIsOpen(false)} />
          <div className="language-dropdown">
            <div className="language-header">
              <span>🌐</span> {t('nav.language')}
            </div>
            <div className="language-list">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-text">{lang.name}</span>
                  {i18n.language === lang.code && <span className="checkmark">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
