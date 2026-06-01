import bcrypt from 'bcryptjs';
import { insertRow, query } from './db.js';

export async function bootstrapSystemAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');

  const existing = await query('select id from users where lower(email) = lower($1) and role = $2 limit 1', [email, 'admin']);
  if (existing.rowCount) return;

  await insertRow('users', {
    id: `admin-${Date.now()}`,
    email,
    password_hash: await bcrypt.hash(password, 12),
    role: 'admin',
    full_name: process.env.BOOTSTRAP_ADMIN_NAME || 'System Administrator',
    status: 'active',
  });

  console.log('[BOOTSTRAP] Created initial admin from BOOTSTRAP_ADMIN_EMAIL.');
}
