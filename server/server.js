require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { generateDailyNotifications } = require('./controllers/dashboardController');
const { seedDatabase } = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const letterRoutes = require('./routes/letterRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// CSP is disabled because the legacy wireframe relies on inline event
// handlers and inline styles, which a strict Content-Security-Policy blocks.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RLMS API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

// Serve the single frontend build from /client/dist (SPA fallback)
const clientBuildDir = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  // SPA fallback - only after API routes are registered so /api/* are not intercepted
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
} else {
  console.warn('Client build directory not found at', clientBuildDir, '. Static frontend will not be served.');
}

app.use(errorHandler);

async function start() {
  await connectDB();
  const result = await seedDatabase({ clear: false });
  if (!result?.skipped) {
    console.log(`Auto-seeded demo data (${result.users} users, ${result.letters} letters)`);
  }

  cron.schedule('0 17 * * *', () => {
    generateDailyNotifications().catch((err) => console.error('Cron notification error:', err));
  }, { timezone: 'Asia/Colombo' });

  app.listen(PORT, () => {
    console.log(`RLMS API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Server startup failed:', err.message);
  process.exit(1);
});

module.exports = app;
