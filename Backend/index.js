const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development and testing
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for API calls
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Event Planner Backend API is active',
    environment: process.env.NODE_ENV || 'development',
    dbMode: db.isMock() ? 'In-Memory Mock Database' : 'MySQL Live Database'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize Database & Start Server
const startServer = async () => {
  // Test connection and configure DB mode
  await db.initDb();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
    console.log(`💾 Database: ${db.isMock() ? 'InMemory Mock' : 'MySQL'}`);
    console.log(`==================================================`);
  });
};

startServer();
