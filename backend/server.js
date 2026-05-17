const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Routes
const authRoutes    = require('./routes/authRoutes');
const promptRoutes  = require('./routes/promptRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const userRoutes    = require('./routes/userRoutes');

// Connect to database
connectDB();

const app = express();

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false, // allow images from Cloudinary
  contentSecurityPolicy: false,     // handled by frontend
}));

// Gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6 // balanced speed vs compression
}));

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Cache-Control headers for public prompt data
app.use('/api/prompts', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  next();
});

// Mount API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/prompts',  promptRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/user',     userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Promptova API is running ✅', version: '2.0' });
});

// Error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
