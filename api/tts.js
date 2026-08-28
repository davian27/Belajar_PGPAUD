// api/tts.js - Vercel Serverless Function Proxy for Google Cloud TTS
export default async function handler(req, res) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { text } = req.query;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Text query parameter is required' });
    }

    try {
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/[\"\“\”]/g, '').trim();
        const encodedText = encodeURIComponent(cleanText);
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=id&client=tw-ob`;

        const response = await fetch(googleTtsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/'
            }
        });

        if (!response.ok) {
            console.error('Google TTS status:', response.status);
            return res.status(response.status).json({ error: 'Failed to fetch audio stream from Google TTS' });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        return res.status(200).send(buffer);
    } catch (error) {
        console.error('TTS Proxy Error:', error);
        return res.status(500).json({ error: 'Internal server error processing TTS' });
    }
}
