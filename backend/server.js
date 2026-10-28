const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initHistoryCleanupCron = require('./services/historyCleanup');

// Initialize database
connectDB();

// Initialize daily history cleanup cron
initHistoryCleanupCron();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OneStop Express Backend Gateway',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/placement', require('./routes/placement'));
app.use('/api/scholarships', require('./routes/scholarship'));
app.use('/api/college-prediction', require('./routes/college'));
app.use('/api/college-cutoffs', require('./routes/college'));
app.use('/api/history', require('./routes/history'));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 OneStop Express Server running on port ${PORT}`);
});
