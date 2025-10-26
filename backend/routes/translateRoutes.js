const express = require('express');
const router = express.Router();

// For production: Install @google-cloud/translate
// npm install @google-cloud/translate
// const {Translate} = require('@google-cloud/translate').v2;

// Mock translation service (replace with real Google Translate API in production)
const translateText = async (text, targetLang, sourceLang = 'en') => {
  // This is a placeholder. In production, use:
  // const translate = new Translate({key: process.env.GOOGLE_TRANSLATE_API_KEY});
  // const [translation] = await translate.translate(text, targetLang);
  // return translation;
  
  // For now, return the original text (will be replaced by actual translations from JSON files)
  return text;
};

// @route   POST /api/translate
// @desc    Translate text to target language
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { text, targetLang, sourceLang = 'en' } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const translation = await translateText(text, targetLang, sourceLang);

    res.json({
      original: text,
      translated: translation,
      sourceLang,
      targetLang,
      status: 'success'
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
});

// @route   POST /api/translate/batch
// @desc    Translate multiple texts at once
// @access  Public
router.post('/batch', async (req, res) => {
  try {
    const { texts, targetLang, sourceLang = 'en' } = req.body;

    if (!texts || !Array.isArray(texts) || !targetLang) {
      return res.status(400).json({ error: 'Texts array and target language are required' });
    }

    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLang, sourceLang))
    );

    res.json({
      translations,
      targetLang,
      sourceLang,
      count: translations.length,
      status: 'success'
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed', message: error.message });
  }
});

// @route   GET /api/translate/languages
// @desc    Get list of supported languages
// @access  Public
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡିଆ' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' }
  ];

  res.json({
    languages: supportedLanguages,
    count: supportedLanguages.length,
    status: 'success'
  });
});

module.exports = router;
