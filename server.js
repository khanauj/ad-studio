require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const generateAdRoute = require('./routes/generateAd');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure generated directory exists
const generatedDir = path.join(__dirname, 'generated');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API Keys from environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

// Serve generated images statically
app.use('/generated', express.static(generatedDir));

// Routes
app.use('/api/generate-ad', generateAdRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✦ VintageAd Studio backend running on http://localhost:${PORT}`);
});
