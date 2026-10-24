require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./db/connection');
const redisClient = require('./services/redisClient');

// Import routes
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const matchRoutes = require('./routes/matchRoutes');
const statsRoutes = require('./routes/statsRoutes');
const dbDemoRoutes = require('./routes/dbDemoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ByteResume Backend API',
    course: 'NoSQL Database Architecture',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', analysisRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/db', dbDemoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

// Start Server
async function startServer() {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect / Initialize Redis
    await redisClient.initRedis();

    // 3. Listen on port
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ByteResume Backend running on http://localhost:${PORT}`);
      console.log(` Course: NoSQL Database Architecture (Production Engineering)`);
      console.log(` Team: ByteResume (Development Team)`);
      console.log(` MongoDB: Primary Document Store`);
      console.log(` Redis: Caching Layer`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal failure starting backend server:', err);
    process.exit(1);
  }
}

startServer();
