import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes.js';
import { errorHandler, requestLogger } from './middleware.js';
import { getRedisClient } from './lib/redis.js';
import { isSupabaseConfigured } from './lib/supabase.js';

dotenv.config({ path: '.env.local', override: false });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(requestLogger);

// Routes
app.use('/api', apiRoutes);
 
 // Root route for direct browser checks
 app.get('/', (req, res) => {
   res.status(200).json({
     status: 'ok',
     message: 'CarServ backend is running. Use /api/* for application endpoints.',
   });
 });

// Basic health check
app.get('/health', async (_req, res) => {
  const redis = await getRedisClient();
  const redisHealthy = redis ? redis.isOpen : false;

  res.status(200).json({
    status: 'ok',
    message: 'Server is running perfectly!',
    infrastructure: {
      supabaseConfigured: isSupabaseConfigured(),
      redisConfigured: Boolean(process.env.REDIS_URL),
      redisHealthy,
    },
  });
});

app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`[Server]: Running at http://localhost:${port}`);
});

function shutdown(signal: string) {
  console.log(`[Server]: Received ${signal}, shutting down`);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
