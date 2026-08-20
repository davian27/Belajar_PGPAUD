/**
 * Vercel Serverless Function: Google Translate TTS API Endpoint
 * Path: /api/tts?text=...
 */

const https = require('https');

module.exports = (req, res) => {
  const text = req.query.text || '';
  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text)}`;

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  const googleReq = https.get(googleUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  }, (googleRes) => {
    if (googleRes.statusCode !== 200) {
      return res.status(googleRes.statusCode).json({ error: 'Failed to fetch audio from TTS provider' });
    }
    googleRes.pipe(res);
  });

  googleReq.on('error', (err) => {
    console.error('Vercel TTS Function Error:', err);
    res.status(500).json({ error: 'Serverless TTS Execution Failed' });
  });
};
