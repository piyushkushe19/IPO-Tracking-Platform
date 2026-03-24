import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

import connectDB from './config/database.js';
import logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import ipoRoutes from './routes/ipos.js';
import portfolioRoutes from './routes/portfolio.js';
import IPO from './models/IPO.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const app = express();
const server = http.createServer(app);

// ─── WebSocket Server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });
const wsClients = new Set();

wss.on('connection', (ws) => {
  wsClients.add(ws);
  logger.info(`WS client connected. Total: ${wsClients.size}`);

  ws.on('close', () => {
    wsClients.delete(ws);
    logger.info(`WS client disconnected. Total: ${wsClients.size}`);
  });

  ws.on('error', (err) => logger.error('WS error:', err));

  ws.send(JSON.stringify({ type: 'connected', message: 'Real-time updates active' }));
});

const broadcast = (data) => {
  const msg = JSON.stringify(data);
  wsClients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
};

// Broadcast live updates every 5 seconds
setInterval(async () => {
  if (wsClients.size === 0) return;
  try {
    const liveIPOs = await IPO.find({ status: { $in: ['open', 'listed'] } })
      .select('companyName symbol subscriptionTotal gmp currentPrice status')
      .limit(20)
      .lean();

    const updates = liveIPOs.map((ipo) => ({
      ...ipo,
      subscriptionTotal: parseFloat(
        (ipo.subscriptionTotal * (1 + (Math.random() - 0.49) * 0.015)).toFixed(2)
      ),
      gmp: ipo.gmp + Math.floor((Math.random() - 0.5) * 3),
      currentPrice: ipo.currentPrice
        ? parseFloat((ipo.currentPrice * (1 + (Math.random() - 0.49) * 0.004)).toFixed(2))
        : null,
    }));

    broadcast({ type: 'live_update', data: updates, timestamp: new Date() });
  } catch (err) {
    logger.error('WS broadcast error:', err);
  }
}, 5000);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/health',
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ipos', ipoRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
    wsClients: wsClients.size,
  });
});

app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📡 WebSocket server ready at ws://localhost:${PORT}/ws`);
  });
};

startServer();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export { broadcast };
