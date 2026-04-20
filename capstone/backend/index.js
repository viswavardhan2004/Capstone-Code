const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const escrowRoutes = require('./routes/escrow');
const gigsRoutes = require('./routes/gigs');
const studentRoutes = require('./routes/student');
const clientRoutes = require('./routes/client');
const ordersRoutes = require('./routes/orders');
const messagesRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const newAdminFraudRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration — parse comma-separated origins, always include admin panel
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

// Always allow the admin panel on port 5174
if (!corsOrigins.includes('http://localhost:5174')) corsOrigins.push('http://localhost:5174');

console.log('ENV: CORS allowed origins =>', corsOrigins);
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ipLogger = require('./middleware/ipLogger');

// Routes
app.use(ipLogger);
app.use('/api/auth', authRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', newAdminFraudRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Micro-Job Server Running', timestamp: new Date() });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Micro-Job API - see /api/health',
    available: ['/api/health', '/api/gigs/all', '/api/auth/login', '/api/auth/register']
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Micro-Job Server Running on Port ${PORT}`);
  console.log(`🔐 Escrow System Active`);
  console.log(`👥 Student Marketplace Ready`);
  console.log(`ENV: CORS_ORIGIN=${corsOrigins.join(',')}`);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received - shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received - shutting down');
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Periodic heartbeat to help debug sudden stops (will show in logs every 30s)
setInterval(() => {
  console.log(`heartbeat: process alive - ${new Date().toISOString()}`);
}, 30000);

// Dump minimal env info for debugging (avoid printing secrets)
console.log('ENV DEBUG: PORT=', process.env.PORT, 'CORS_ORIGIN=', process.env.CORS_ORIGIN);
