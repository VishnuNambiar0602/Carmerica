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
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) missing.push('JWT_SECRET');
  if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) missing.push('RESEND_API_KEY or SENDGRID_API_KEY');
  if (!process.env.STRIPE_SECRET_KEY && !process.env.RAZORPAY_KEY_ID) missing.push('STRIPE_SECRET_KEY or RAZORPAY_KEY_ID');
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length) {
    throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  }
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
