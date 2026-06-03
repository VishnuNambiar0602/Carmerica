import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from './lib/config.js';
import sanitizeHtml from 'sanitize-html';

export type AppRole = 'customer' | 'vendor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}


export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret()) as AuthUser;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function authorize(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.headers.origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map((o) => o.trim());
  const referer = req.headers.referer;

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: 'CSRF: origin not allowed' });
  }

  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!allowedOrigins.includes(refererOrigin)) {
        return res.status(403).json({ message: 'CSRF: referer not allowed' });
      }
    } catch {
      return res.status(403).json({ message: 'CSRF: invalid referer' });
    }
  }

  next();
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (value: unknown): unknown => {
      if (typeof value === 'string') {
        return sanitizeHtml(value, {
          allowedTags: [],        // strip ALL HTML tags
          allowedAttributes: {},  // strip ALL attributes
        }).trim();
      }
      if (Array.isArray(value)) return value.map(sanitize);
      if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, sanitize(v)])
        );
      }
      return value;
    };
    req.body = sanitize(req.body) as Record<string, unknown>;
  }
  next();
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
}
