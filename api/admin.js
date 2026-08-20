/**
 * Vercel Serverless Function: Admin Authentication & Management API
 * Path: /api/admin
 */

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { username, password } = body;

    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      return res.status(200).json({
        success: true,
        message: 'Admin authentication successful',
        user: { username: DEFAULT_ADMIN.username, role: 'administrator' },
        token: 'reog_admin_session_token_v1'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  }

  // GET request returns API status
  res.status(200).json({
    status: 'online',
    endpoint: '/api/admin',
    description: 'Vercel Admin Serverless API Endpoint',
    defaultUsername: DEFAULT_ADMIN.username
  });
};
