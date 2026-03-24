const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const medicalRecordsRoutes = require('./routes/medicalRecords');
const hl7FhirRoutes = require('./routes/hl7-fhir');
const auditRoutes = require('./routes/audit');

const { initializeDatabase } = require('./database/init');
const { authenticateToken } = require('./middleware/auth');
const { cacheMiddleware } = require('./middleware/cache');
const { errorHandler } = require('./middleware/errorHandler');
const { auditMiddleware } = require('./middleware/audit');
const AuditMonitoringService = require('./services/auditMonitoringService');


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Initialize audit monitoring service
let auditMonitoringService = null;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Apply audit middleware to all routes (except health check)
app.use((req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }
  return auditMiddleware.audit()(req, res, next);
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticateToken, cacheMiddleware, patientRoutes);
app.use('/api/medical-records', authenticateToken, cacheMiddleware, medicalRecordsRoutes);
app.use('/api/hl7-fhir', hl7FhirRoutes);
app.use('/api/audit', auditRoutes);


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle audit alert subscriptions
  socket.on('subscribe_audit_alerts', (data) => {
    const { alertTypes = [], severities = [] } = data;
    if (auditMonitoringService) {
      auditMonitoringService.subscribeToAlerts(socket, alertTypes, severities);
    }
  });

  socket.on('unsubscribe_audit_alerts', () => {
    if (auditMonitoringService) {
      auditMonitoringService.unsubscribeFromAlerts(socket.id);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await initializeDatabase();

    // Initialize audit monitoring service
    auditMonitoringService = new AuditMonitoringService(io);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/health`);
      console.log(`HL7/FHIR API available at http://localhost:${PORT}/api/hl7-fhir`);
      console.log(`Audit API available at http://localhost:${PORT}/api/audit`);
      console.log('Real-time audit monitoring enabled');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
