import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRoutes from './routes.js';
import { errorHandler, requestLogger, csrfProtection, sanitizeInput } from './middleware.js';
import { assertProductionConfig } from './lib/config.js';
import { bootstrapSystemAdmin } from './lib/bootstrap.js';
import { getRedisClient } from './lib/redis.js';
import { isDatabaseConfigured } from './lib/db.js';
import { isSupabaseConfigured, verifySupabaseConnection } from './lib/supabase.js';
import { initStripe } from './lib/stripe.js';
import { db } from './lib/db.js';

dotenv.config({ path: '.env.local', override: false });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const nodeEnv = process.env.NODE_ENV || 'development';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

// --- Security headers ---
app.use(helmet({
  contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());

app.use(cors((req, callback) => {
  const origin = req.headers.origin;
  const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const host = req.headers.host;
  if (host) {
    allowed.push(`https://${host}`);
    allowed.push(`http://${host}`);
  }
  callback(null, {
    origin: origin && allowed.includes(origin) ? origin : false,
    credentials: true
  });
}));
app.use(cookieParser());
app.use(csrfProtection);

// --- Rate limiting ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 reset requests per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Try again in an hour.' },
});

// Stripe webhook raw parsing MUST be registered BEFORE general json parsing!
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json', limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(sanitizeInput);
app.use(requestLogger);

// --- Startup Initialization Promise ---
let initPromise: Promise<void> | null = null;

export async function initializeApp() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // --- Environment validation ---
    const requiredProdVars = ['JWT_SECRET'];
    const missingVars = requiredProdVars.filter((v) => !process.env[v] || process.env[v] === 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET');
    if (nodeEnv === 'production' && missingVars.length > 0) {
      throw new Error(`Production requires valid environment variables: ${missingVars.join(', ')}`);
    }

    assertProductionConfig();

    if (nodeEnv === 'production' && !process.env.SUPABASE_URL && !process.env.DATABASE_URL) {
      console.warn('[WARN] Running production without Supabase — using in-memory storage. Data will be lost on restart!');
    }

    // Verify Supabase connection — if tables don't exist, falls back to in-memory
    const supabaseOk = await verifySupabaseConnection();
    if (!supabaseOk) {
      console.warn('[WARN] Supabase connection failed or tables do not exist — running in-memory fallback. Data changes will be lost on restarts.');
    }
    db.refreshSupabaseStatus();

    // Bootstrap system admin
    await bootstrapSystemAdmin();

    // Initialize Stripe
    await initStripe();
  })();

  return initPromise;
}

// Middleware to ensure the server is fully initialized before handling any requests
app.use(async (req, res, next) => {
  try {
    await initializeApp();
    next();
  } catch (err) {
    console.error('[Server] Initialization failed:', err);
    res.status(500).json({ 
      error: 'Server initialization failed', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
});

// --- Health check ---
app.get('/health', async (_req, res) => {
  const redis = await getRedisClient();
  const redisHealthy = redis ? redis.isOpen : false;
  res.status(200).json({
    status: 'ok',
    message: 'Server is running perfectly!',
    environment: nodeEnv,
    infrastructure: {
      supabaseConfigured: isSupabaseConfigured(),
      databaseConfigured: isDatabaseConfigured(),
      redisConfigured: Boolean(process.env.REDIS_URL),
      redisHealthy,
    },
  });
});

// --- Routes (with auth rate limiting) ---
app.use('/api/auth/forgot-password', resetLimiter);
app.use('/api/auth/reset-password', resetLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api', apiRoutes);

// --- Static file serving ---
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(errorHandler);

// --- Local Startup ---
if (process.env.VERCEL !== '1') {
  initializeApp().then(() => {
    const server = app.listen(port, () => {
      console.log(`[Server] Running in ${nodeEnv} mode on http://localhost:${port}`);
      console.log(`[Server] Database: ${process.env.DATABASE_URL ? 'Supabase' : 'In-memory (dev mode)'}`);
      console.log(`[Server] Redis: ${process.env.REDIS_URL ? 'Configured' : 'Not configured'}`);
      console.log(`[Server] Payments: ${process.env.STRIPE_SECRET_KEY ? 'Stripe' : 'Mock mode'}`);
      console.log(`[Server] AI: ${process.env.GROQ_API_KEY ? 'Configured' : 'Not configured'}`);
    });

    function shutdown(signal: string) {
      console.log(`[Server] Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        process.exit(0);
      });
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }).catch((err) => {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});

export default app;
