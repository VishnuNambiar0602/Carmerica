import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: false });
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters.');
  }
  return secret;
}

export function assertProductionConfig() {
  if (!isProduction) return;

  const missing: string[] = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (must be at least 32 characters)');
  }

  if (missing.length) {
    throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  }

  // Log warnings for optional dependencies rather than crashing
  if (!process.env.DATABASE_URL) {
    console.warn('[WARN] DATABASE_URL is not set. Database will run in-memory; modifications will be lost on serverless restart.');
  }
  const hasSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.warn('[WARN] Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not configured.');
  }
  if (!process.env.STRIPE_SECRET_KEY && !process.env.RAZORPAY_KEY_ID) {
    console.warn('[WARN] Neither STRIPE_SECRET_KEY nor RAZORPAY_KEY_ID is configured. Payments will run in mock mode.');
  }
  if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
    console.warn('[WARN] Neither RESEND_API_KEY nor SENDGRID_API_KEY is configured. Mailer will run in mock mode.');
  }
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
