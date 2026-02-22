const express = require('express');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5001',
      'http://localhost:3002',
      'http://localhost:3004',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:5173'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds 50MB limit',
}));

// Database connection
const connectDB = require('./config/database');
connectDB();

// Routes
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/playground', require('./routes/playgroundRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/games', require('./routes/gamesRoutes'));

// Serve static files from server/public (where client `dist` will be copied)
const publicPath = path.join(__dirname, 'public')
app.use(express.static(publicPath))

// If a request doesn't match an API route, serve the client `index.html`.
app.get('*', (req, res) => {
  // Let API routes respond normally
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' })

  const indexHtml = path.join(publicPath, 'index.html')
  res.sendFile(indexHtml, err => {
    if (err) {
      res.status(500).send('Index not found')
    }
  })
})

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ATS Resume Optimizer API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
