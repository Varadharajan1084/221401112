const express = require('express');
const Log = require('../logging-middleware/logger');

const app = express();
app.use(express.json());

// In-memory storage for URLs
const urlDatabase = new Map();
const clickStats = new Map();

// Helper to generate random shortcode
function generateShortcode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /shorturls - Create short URL
app.post('/shorturls', async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;
  if (!url || typeof url !== 'string') {
    await Log('backend', 'error', 'shorturl', 'Invalid URL input');
    return res.status(400).json({ error: 'Invalid URL' });
  }
  let code = shortcode || generateShortcode();
  if (urlDatabase.has(code)) {
    await Log('backend', 'error', 'shorturl', 'Shortcode collision');
    return res.status(409).json({ error: 'Shortcode already exists' });
  }
  const expiry = new Date(Date.now() + validity * 60000).toISOString();
  urlDatabase.set(code, { url, expiry, created: new Date().toISOString() });
  clickStats.set(code, []);
  await Log('backend', 'info', 'shorturl', `Short URL created: ${code}`);
  res.status(201).json({ shortLink: `http://localhost:3000/${code}`, expiry });
});

// GET /:shortcode - Redirect
app.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const entry = urlDatabase.get(shortcode);
  if (!entry) {
    await Log('backend', 'error', 'redirect', 'Shortcode not found');
    return res.status(404).json({ error: 'Shortcode not found' });
  }
  if (new Date() > new Date(entry.expiry)) {
    await Log('backend', 'error', 'redirect', 'Shortcode expired');
    return res.status(410).json({ error: 'Shortcode expired' });
  }
  // Log click
  clickStats.get(shortcode).push({ timestamp: new Date().toISOString(), referrer: req.get('referer') || '' });
  await Log('backend', 'info', 'redirect', `Redirected: ${shortcode}`);
  res.redirect(entry.url);
});

// GET /shorturls/:shortcode - Stats
app.get('/shorturls/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const entry = urlDatabase.get(shortcode);
  if (!entry) {
    await Log('backend', 'error', 'stats', 'Shortcode not found');
    return res.status(404).json({ error: 'Shortcode not found' });
  }
  const stats = clickStats.get(shortcode) || [];
  await Log('backend', 'info', 'stats', `Stats retrieved: ${shortcode}`);
  res.json({
    url: entry.url,
    created: entry.created,
    expiry: entry.expiry,
    totalClicks: stats.length,
    clicks: stats
  });
});

// Error handler
app.use(async (err, req, res, next) => {
  await Log('backend', 'error', 'errorHandler', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
}); 