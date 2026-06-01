import crypto from 'crypto';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { audit } from './lib/audit.js';
import { getJwtSecret } from './lib/config.js';
import { deleteRow, insertRow, isDatabaseConfigured, query, rowToApi, rowsToApi, splitAllowed, updateRow } from './lib/db.js';
import { validateAndStoreKyvDocument } from './lib/kyv.js';
import { sendPasswordResetEmail } from './lib/mailer.js';
import { createPaymentOrder, verifyRazorpaySignature, verifyStripeSignature } from './lib/payments.js';
import { cacheDel, cacheGet, cacheSet } from './lib/redis.js';

type Role = 'customer' | 'vendor' | 'admin';
type AuthedRequest = Request & { user?: { id: string; email: string; role: Role } };

const router = Router();
const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

const serviceColumns = ['vendor_id', 'garage_id', 'category_id', 'name', 'description', 'price', 'duration_minutes', 'active'];
const categoryColumns = ['name', 'slug', 'description', 'active'];
const vendorColumns = ['user_id', 'business_name', 'email', 'phone', 'location', 'description', 'rating', 'verified', 'active'];
const bookingColumns = ['customer_id', 'vendor_id', 'garage_id', 'service_id', 'customer_email', 'customer_name', 'vehicle', 'scheduled_date', 'scheduled_time', 'status', 'amount', 'cancellation_reason'];
const reviewColumns = ['booking_id', 'customer_id', 'vendor_id', 'garage_id', 'rating', 'comment', 'status', 'vendor_response'];
const promotionColumns = ['vendor_id', 'title', 'description', 'discount_type', 'discount_value', 'starts_at', 'ends_at', 'status'];
const staffColumns = ['vendor_id', 'name', 'role', 'email', 'phone', 'active'];
const pricingColumns = ['vendor_id', 'category_id', 'name', 'rule_type', 'payload', 'active'];
const supportColumns = ['user_id', 'subject', 'message', 'status', 'priority', 'assigned_to'];
const cmsColumns = ['slug', 'title', 'content', 'status'];

function asyncHandler(fn: (req: any, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function requireDatabase(_req: Request, res: Response, next: NextFunction) {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({ message: 'Database is not configured. Set DATABASE_URL for PostgreSQL/Supabase persistence.' });
  }
  next();
}

router.use(requireDatabase);

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tokenHash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

function normalizeDate(value: any) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function safeUser(user: any) {
  if (!user) return null;
  const api = rowToApi(user);
  delete api.passwordHash;
  delete api.password_hash;
  return api;
}

function issueToken(user: any) {
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '2h') as SignOptions['expiresIn'] };
  return jwt.sign(
    { id: user.id, sub: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    options,
  );
}

async function findUserByEmail(email: string, role?: Role) {
  const params: any[] = [String(email || '').toLowerCase()];
  let sql = 'select * from users where lower(email) = $1';
  if (role) {
    params.push(role);
    sql += ' and role = $2';
  }
  sql += ' limit 1';
  const result = await query(sql, params);
  return result.rows[0] || null;
}

async function userFromToken(req: Request) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const payload = jwt.verify(header.slice(7), getJwtSecret()) as { sub: string; id: string };
  const result = await query('select * from users where id = $1 and status = $2 limit 1', [payload.sub || payload.id, 'active']);
  return result.rows[0] || null;
}

function requireRole(...roles: Role[]) {
  return asyncHandler(async (req: AuthedRequest, res, next) => {
    const user = await userFromToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  });
}

async function resolveVendorId(req: AuthedRequest) {
  const explicit = String(req.query.vendorId || req.body?.vendorId || '').trim();
  if (req.user?.role === 'admin' && explicit) return explicit;
  if (req.user?.role === 'vendor') {
    const result = await query('select id from vendors where user_id = $1 limit 1', [req.user.id]);
    return result.rows[0]?.id || '';
  }
  return explicit;
}

function serviceToApi(service: any, categories: any[] = []) {
  const api = rowToApi(service);
  const category = categories.find((item) => item.id === api.categoryId);
  return {
    ...api,
    category: category?.name || api.category || 'Uncategorized',
    duration: api.duration || `${api.durationMinutes || 60} mins`,
    status: api.active === false ? 'inactive' : 'active',
  };
}

function bookingToApi(row: any) {
  const api = rowToApi(row);
  return {
    ...api,
    email: api.customerEmail,
    customer: api.customerName,
    car: api.vehicle,
    date: api.scheduledDate,
    time: api.scheduledTime,
    price: Number(api.amount || 0),
  };
}

async function getCategories() {
  const result = await query('select * from categories order by name asc');
  return rowsToApi(result.rows);
}

async function clearBookingCache(booking: any) {
  await Promise.allSettled([
    booking.vendorId ? cacheDel(`bookings:vendor:${booking.vendorId}`) : Promise.resolve(),
    booking.customerEmail ? cacheDel(`bookings:customer:${booking.customerEmail}`) : Promise.resolve(),
    cacheDel('bookings:all'),
  ]);
}

async function clearServiceCache(service?: any) {
  await Promise.allSettled([
    cacheDel('services:::'),
    service?.vendorId ? cacheDel(`services::${service.vendorId}:`) : Promise.resolve(),
    service?.garageId ? cacheDel(`services:::${service.garageId}`) : Promise.resolve(),
  ]);
}

async function fromCacheOrCompute<T>(key: string, ttl: number, compute: () => Promise<T>): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const result = await compute();
  await cacheSet(key, result, ttl).catch(() => undefined);
  return result;
}

router.get('/hello', (_req, res) => res.json({ message: 'Hello from the API!' }));

router.get('/health/db', (_req, res) => {
  res.json({ status: 'ok', database: 'postgres', cache: process.env.REDIS_URL ? 'redis' : 'not-configured' });
});

router.post('/auth/register', asyncHandler(async (req, res) => {
  const { email, password, role = 'customer', businessName, fullName, phone } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  if (!['customer', 'vendor'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (String(password).length < 10) return res.status(400).json({ message: 'Password must be at least 10 characters' });
  if (await findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' });

  const user = await insertRow('users', {
    id: uid('user'),
    email: String(email).toLowerCase(),
    password_hash: await bcrypt.hash(password, 12),
    role,
    full_name: fullName || businessName || '',
    phone: phone || '',
    status: 'active',
  });

  let vendor = null;
  if (role === 'vendor') {
    vendor = await insertRow('vendors', {
      id: uid('vendor'),
      user_id: user.id,
      business_name: businessName || fullName || String(email).split('@')[0],
      email,
      phone: phone || '',
      rating: 0,
      verified: false,
      active: true,
      location: '',
      description: '',
    });
  }

  await audit(req, 'register', 'user', user.id, null, user);
  res.status(201).json({ message: 'Registered', token: issueToken({ ...user, password_hash: undefined }), user, vendor });
}));

router.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  const user = await findUserByEmail(email, role);
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const vendor = user.role === 'vendor'
    ? rowToApi((await query('select * from vendors where user_id = $1 limit 1', [user.id])).rows[0])
    : null;
  res.json({ message: 'Authenticated', token: issueToken(user), user: safeUser(user), vendor });
}));

router.post('/admin/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email, 'admin');
  if (!user || user.status !== 'active') return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  await audit(req, 'login', 'admin', user.id, null, { email: user.email });
  res.json({ message: 'Authenticated', token: issueToken(user), user: safeUser(user) });
}));

router.post('/auth/logout', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  await audit(req, 'logout', 'user', req.user?.id || '', null, null);
  res.json({ message: 'Logged out' });
}));

router.post('/auth/forgot-password', asyncHandler(async (req, res) => {
  const { email, role = 'customer' } = req.body;
  const user = await findUserByEmail(email, role);
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await insertRow('password_reset_tokens', {
      id: uid('reset'),
      user_id: user.id,
      token_hash: tokenHash(token),
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    });
    await sendPasswordResetEmail(user.email, token);
  }
  res.json({ message: `If ${email} exists in our system, password reset instructions were sent.` });
}));

router.post('/auth/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Missing token or password' });
  if (String(password).length < 10) return res.status(400).json({ message: 'Password must be at least 10 characters' });

  const result = await query(
    'select * from password_reset_tokens where token_hash = $1 and used_at is null and expires_at > now() limit 1',
    [tokenHash(token)],
  );
  const entry = result.rows[0];
  if (!entry) return res.status(400).json({ message: 'Invalid or expired reset token' });

  await query('update users set password_hash = $2, updated_at = now() where id = $1', [entry.user_id, await bcrypt.hash(password, 12)]);
  await query('update password_reset_tokens set used_at = now() where id = $1', [entry.id]);
  res.json({ message: 'Password updated' });
}));

router.get('/auth/me', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const userResult = await query('select * from users where id = $1', [req.user?.id]);
  const user = safeUser(userResult.rows[0]);
  const vendor = req.user?.role === 'vendor'
    ? rowToApi((await query('select * from vendors where user_id = $1 limit 1', [req.user.id])).rows[0])
    : null;
  res.json({ user, vendor });
}));

router.get('/vendors', asyncHandler(async (_req, res) => {
  const result = await query('select * from vendors where active = true order by verified desc, business_name asc');
  res.json(rowsToApi(result.rows).map((vendor) => ({ ...vendor, name: vendor.businessName })));
}));

router.get('/garages', asyncHandler(async (req, res) => {
  const search = `%${String(req.query.query || req.query.location || req.query.q || '').trim()}%`;
  const result = await query(
    `select * from garages
     where active = true and ($1 = '%%' or name ilike $1 or location ilike $1 or city ilike $1 or metadata::text ilike $1)
     order by rating desc, name asc`,
    [search],
  );
  res.json(rowsToApi(result.rows));
}));

router.get('/garages/:id', asyncHandler(async (req, res) => {
  const result = await query('select * from garages where id = $1 and active = true', [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ message: 'Garage not found' });
  res.json(rowToApi(result.rows[0]));
}));

router.get('/categories', asyncHandler(async (_req, res) => {
  const result = await query(
    `select c.*, count(s.id)::int as services
     from categories c left join services s on s.category_id = c.id
     group by c.id order by c.name asc`,
  );
  res.json(rowsToApi(result.rows).map((category) => ({ ...category, status: category.active ? 'active' : 'inactive' })));
}));

router.get('/services', asyncHandler(async (req, res) => {
  const search = String(req.query.query || req.query.serviceType || '').trim();
  const vendorId = String(req.query.vendorId || '');
  const garageId = String(req.query.garageId || '');
  const key = `services:${search}:${vendorId}:${garageId}`;
  const result = await fromCacheOrCompute(key, 120, async () => {
    const params: any[] = [`%${search}%`];
    let sql = `select * from services where active = true and ($1 = '%%' or name ilike $1 or description ilike $1 or metadata::text ilike $1)`;
    if (vendorId) {
      params.push(vendorId);
      sql += ` and vendor_id = $${params.length}`;
    }
    if (garageId) {
      params.push(garageId);
      sql += ` and garage_id = $${params.length}`;
    }
    sql += ' order by name asc';
    const services = await query(sql, params);
    const categories = await getCategories();
    return services.rows.map((service) => serviceToApi(service, categories));
  });
  res.json(result);
}));

router.post('/services', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const name = String(req.body.name || '').trim();
  if (!vendorId || !name) return res.status(400).json({ message: 'Vendor and service name are required' });
  const row = splitAllowed({ ...req.body, vendorId, active: req.body.status === 'inactive' ? false : req.body.active !== false }, serviceColumns);
  const service = await insertRow('services', { id: uid('svc'), ...row });
  await clearServiceCache(service);
  await audit(req, 'create', 'service', service.id, null, service);
  res.status(201).json(serviceToApi(service, await getCategories()));
}));

router.patch('/services/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const existing = rowToApi((await query('select * from services where id = $1', [req.params.id])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Service not found' });
  if (req.user?.role === 'vendor' && existing.vendorId !== await resolveVendorId(req)) return res.status(403).json({ message: 'Forbidden' });
  const row = splitAllowed({ ...req.body, active: req.body.status === 'inactive' ? false : req.body.status === 'active' ? true : req.body.active }, serviceColumns);
  const service = await updateRow('services', req.params.id, row);
  await clearServiceCache(service);
  await audit(req, 'update', 'service', service.id, existing, service);
  res.json(serviceToApi(service, await getCategories()));
}));

router.delete('/services/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const existing = rowToApi((await query('select * from services where id = $1', [req.params.id])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Service not found' });
  if (req.user?.role === 'vendor' && existing.vendorId !== await resolveVendorId(req)) return res.status(403).json({ message: 'Forbidden' });
  const removed = await deleteRow('services', req.params.id);
  await clearServiceCache(removed);
  await audit(req, 'delete', 'service', req.params.id, existing, null);
  res.json(removed);
}));

router.get('/availability/slots', asyncHandler(async (req, res) => {
  const vendorId = String(req.query.vendorId || '');
  const date = normalizeDate(req.query.date) || new Date().toISOString().slice(0, 10);
  const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
  const booked = await query(
    `select scheduled_time from bookings where vendor_id = $1 and scheduled_date = $2 and status not in ('Cancelled', 'Completed')`,
    [vendorId, date],
  );
  const taken = new Set(booked.rows.map((row) => row.scheduled_time));
  res.json(slots.filter((slot) => !taken.has(slot)).map((time) => ({ time, available: true })));
}));

router.get('/bookings', asyncHandler(async (req, res) => {
  const vendorId = String(req.query.vendorId || '');
  const customerEmail = String(req.query.customerEmail || '');
  const key = vendorId ? `bookings:vendor:${vendorId}` : customerEmail ? `bookings:customer:${customerEmail}` : 'bookings:all';
  const result = await fromCacheOrCompute(key, 60, async () => {
    const params: any[] = [];
    let sql = 'select * from bookings where true';
    if (vendorId) {
      params.push(vendorId);
      sql += ` and vendor_id = $${params.length}`;
    }
    if (customerEmail) {
      params.push(customerEmail.toLowerCase());
      sql += ` and lower(customer_email) = $${params.length}`;
    }
    sql += ' order by created_at desc';
    return (await query(sql, params)).rows.map(bookingToApi);
  });
  res.json(result);
}));

router.post('/bookings', asyncHandler(async (req, res) => {
  const customerEmail = String(req.body.email || req.body.customerEmail || '').toLowerCase();
  const customerName = String(req.body.customerName || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Guest customer');
  const amount = Number(req.body.price || req.body.amount || 0);
  if (!customerEmail || !req.body.vendorId) return res.status(400).json({ message: 'Customer email and vendor are required' });
  const booking = await insertRow('bookings', {
    id: uid('bk'),
    ...splitAllowed({
      ...req.body,
      customerEmail,
      customerName,
      vehicle: req.body.vehicle || [req.body.carYear, req.body.carModel].filter(Boolean).join(' '),
      scheduledDate: normalizeDate(req.body.date || req.body.scheduledDate),
      scheduledTime: req.body.time || req.body.scheduledTime,
      status: 'Pending',
      amount,
    }, bookingColumns),
  });
  await clearBookingCache(booking);
  res.status(201).json(bookingToApi(booking));
}));

router.get('/bookings/:id', asyncHandler(async (req, res) => {
  const booking = (await query('select * from bookings where id = $1', [req.params.id])).rows[0];
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(bookingToApi(booking));
}));

router.patch('/bookings/:id', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const existing = rowToApi((await query('select * from bookings where id = $1', [req.params.id])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Booking not found' });
  const row = splitAllowed({ ...req.body, scheduledDate: normalizeDate(req.body.date || req.body.scheduledDate) }, bookingColumns);
  const booking = await updateRow('bookings', req.params.id, row);
  await clearBookingCache(booking);
  await audit(req, 'update', 'booking', booking.id, existing, booking);
  res.json(bookingToApi(booking));
}));

router.post('/bookings/:id/cancel', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const existing = rowToApi((await query('select * from bookings where id = $1', [req.params.id])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Booking not found' });
  const booking = await updateRow('bookings', req.params.id, { status: 'Cancelled', cancellation_reason: req.body.reason || 'Cancelled by user' });
  const payment = rowToApi((await query('select * from payments where booking_id = $1 order by created_at desc limit 1', [req.params.id])).rows[0]);
  if (payment && payment.status !== 'refunded') {
    await updateRow('payments', payment.id, { status: 'refund_pending', refund_amount: payment.amount });
  }
  await clearBookingCache(booking);
  await audit(req, 'cancel', 'booking', booking.id, existing, booking);
  res.json({ message: 'Booking cancelled', booking: bookingToApi(booking), refund: payment ? { amount: payment.amount, status: 'refund_pending' } : null });
}));

router.post('/bookings/:id/reschedule', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const booking = await updateRow('bookings', req.params.id, {
    scheduled_date: normalizeDate(req.body.date),
    scheduled_time: req.body.time,
    status: 'Rescheduled',
  });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  await clearBookingCache(booking);
  await audit(req, 'reschedule', 'booking', booking.id, null, booking);
  res.json(bookingToApi(booking));
}));

router.post('/payments/create-order', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const { bookingId } = req.body;
  const booking = rowToApi((await query('select * from bookings where id = $1', [bookingId])).rows[0]);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (req.user?.role === 'customer' && booking.customerEmail !== req.user.email) return res.status(403).json({ message: 'Forbidden' });

  const order = await createPaymentOrder({
    amount: Number(booking.amount || req.body.amount || 0),
    currency: req.body.currency || 'AED',
    receipt: booking.id,
    metadata: { bookingId: booking.id, userId: req.user?.id || '' },
  });

  const payment = await insertRow('payments', {
    id: uid('pay'),
    booking_id: booking.id,
    amount: Number(booking.amount || 0),
    currency: req.body.currency || 'AED',
    status: 'created',
    provider: order.provider,
    provider_payment_id: order.providerPaymentId,
    metadata: order.raw,
  });
  await audit(req, 'create_order', 'payment', payment.id, null, payment);
  res.status(201).json({ payment, clientSecret: order.clientSecret, provider: order.provider });
}));

router.post('/payments/confirm-razorpay', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }
  const payment = rowToApi((await query('select * from payments where provider_payment_id = $1', [razorpay_order_id])).rows[0]);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  const updated = await updateRow('payments', payment.id, { status: 'paid', provider_payment_id: razorpay_payment_id });
  await audit(req, 'confirm', 'payment', payment.id, payment, updated);
  res.json(updated);
}));

router.post('/payments/webhook/stripe', asyncHandler(async (req, res) => {
  const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
  if (!verifyStripeSignature(payload, String(req.headers['stripe-signature'] || ''))) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }
  const event = Buffer.isBuffer(req.body) ? JSON.parse(payload) : req.body;
  const paymentIntent = event.data?.object;
  if (event.type === 'payment_intent.succeeded' && paymentIntent?.id) {
    await query('update payments set status = $2, updated_at = now() where provider_payment_id = $1', [paymentIntent.id, 'paid']);
  }
  res.json({ received: true });
}));

router.get('/reviews', asyncHandler(async (req, res) => {
  const params: any[] = [];
  let sql = 'select * from reviews where status <> $1';
  params.push('deleted');
  if (req.query.garageId) {
    params.push(req.query.garageId);
    sql += ` and garage_id = $${params.length}`;
  }
  if (req.query.vendorId) {
    params.push(req.query.vendorId);
    sql += ` and vendor_id = $${params.length}`;
  }
  sql += ' order by created_at desc';
  res.json(rowsToApi((await query(sql, params)).rows));
}));

router.post('/reviews', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const row = splitAllowed({ ...req.body, customerId: req.user?.id, status: 'published' }, reviewColumns);
  const review = await insertRow('reviews', { id: uid('rev'), ...row });
  await audit(req, 'create', 'review', review.id, null, review);
  res.status(201).json(review);
}));

router.patch('/reviews/:id/response', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const review = await updateRow('reviews', req.params.id, { vendor_response: req.body.response || '' });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await audit(req, 'respond', 'review', review.id, null, review);
  res.json(review);
}));

router.get('/wishlist', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const email = req.user?.role === 'customer' ? req.user.email : String(req.query.customerEmail || '');
  res.json(rowsToApi((await query('select * from wishlist where lower(customer_email) = lower($1)', [email])).rows));
}));

router.post('/wishlist', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const email = req.user?.role === 'customer' ? req.user.email : req.body.customerEmail;
  const entry = await insertRow('wishlist', { id: uid('wish'), customer_email: email, garage_id: req.body.garageId });
  res.status(201).json(entry);
}));

router.delete('/wishlist', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const email = req.user?.role === 'customer' ? req.user.email : String(req.query.customerEmail || req.body.customerEmail || '');
  const garageId = String(req.query.garageId || req.body.garageId || '');
  const removed = rowToApi((await query('delete from wishlist where lower(customer_email) = lower($1) and garage_id = $2 returning *', [email, garageId])).rows[0]);
  if (!removed) return res.status(404).json({ message: 'Wishlist item not found' });
  res.json(removed);
}));

router.get('/customer/bookings', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const email = req.user?.role === 'customer' ? req.user.email : String(req.query.customerEmail || '');
  const rows = (await query('select * from bookings where lower(customer_email) = lower($1) order by created_at desc', [email])).rows;
  res.json(rows.map(bookingToApi));
}));

router.get('/customer/profile', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const email = req.user?.role === 'customer' ? req.user.email : String(req.query.email || '');
  const user = await findUserByEmail(email, 'customer');
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  const wish = rowsToApi((await query('select * from wishlist where lower(customer_email) = lower($1)', [email])).rows);
  res.json({ ...safeUser(user), wishlist: wish });
}));

router.patch('/customer/profile', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const id = req.user?.role === 'customer' ? req.user.id : req.body.id;
  const allowed = {
    full_name: req.body.fullName,
    phone: req.body.phone,
    metadata: req.body.metadata || {},
  };
  const user = await updateRow('users', id, allowed);
  await audit(req, 'update', 'customer_profile', id, null, user);
  res.json({ message: 'Profile updated', user });
}));

router.post('/customer/bookings/:id/favorite', requireRole('customer', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const booking = await updateRow('bookings', req.params.id, { metadata: { favorite: true } });
  await audit(req, 'favorite', 'booking', req.params.id, null, booking);
  res.json(bookingToApi(booking));
}));

router.get('/vendor/profile', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const vendor = rowToApi((await query('select * from vendors where id = $1 or user_id = $2 limit 1', [vendorId, req.user?.id])).rows[0]);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json({ ...vendor, name: vendor.businessName });
}));

router.patch('/vendor/profile', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const existing = rowToApi((await query('select * from vendors where id = $1', [vendorId])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Vendor not found' });
  const vendor = await updateRow('vendors', vendorId, splitAllowed(req.body, vendorColumns));
  await audit(req, 'update', 'vendor_profile', vendorId, existing, vendor);
  res.json(vendor);
}));

router.get('/vendor/bookings', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  res.json((await query('select * from bookings where vendor_id = $1 order by created_at desc', [vendorId])).rows.map(bookingToApi));
}));

router.get('/vendor/calendar', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const date = normalizeDate(req.query.date) || new Date().toISOString().slice(0, 10);
  const data = (await query('select * from bookings where vendor_id = $1 and scheduled_date = $2', [vendorId, date])).rows.map(bookingToApi);
  res.json({ vendorId, date, bookings: data });
}));

router.get('/vendor/earnings', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const bookings = (await query('select * from bookings where vendor_id = $1', [vendorId])).rows.map(bookingToApi);
  const payments = rowsToApi((await query(
    'select p.* from payments p join bookings b on b.id = p.booking_id where b.vendor_id = $1 order by p.created_at desc',
    [vendorId],
  )).rows);
  res.json({ vendorId, revenue: bookings.reduce((sum, b) => sum + Number(b.price || 0), 0), paidPayments: payments, bookings });
}));

router.get('/vendor/services', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const services = (await query('select * from services where vendor_id = $1 order by name asc', [vendorId])).rows;
  const categories = await getCategories();
  res.json(services.map((service) => serviceToApi(service, categories)));
}));

router.post('/vendor/services', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const name = String(req.body.name || '').trim();
  if (!vendorId || !name) return res.status(400).json({ message: 'Vendor and service name are required' });
  const row = splitAllowed({ ...req.body, vendorId, active: req.body.status === 'inactive' ? false : req.body.active !== false }, serviceColumns);
  const service = await insertRow('services', { id: uid('svc'), ...row });
  await clearServiceCache(service);
  await audit(req, 'create', 'service', service.id, null, service);
  res.status(201).json(serviceToApi(service, await getCategories()));
}));

router.patch('/vendor/services/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const existing = rowToApi((await query('select * from services where id = $1 and vendor_id = $2', [req.params.id, vendorId])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Service not found' });
  const service = await updateRow('services', req.params.id, splitAllowed(req.body, serviceColumns));
  await clearServiceCache(service);
  await audit(req, 'update', 'service', req.params.id, existing, service);
  res.json(serviceToApi(service, await getCategories()));
}));

router.delete('/vendor/services/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const existing = rowToApi((await query('select * from services where id = $1 and vendor_id = $2', [req.params.id, vendorId])).rows[0]);
  if (!existing) return res.status(404).json({ message: 'Service not found' });
  const removed = await deleteRow('services', req.params.id);
  await clearServiceCache(removed);
  await audit(req, 'delete', 'service', req.params.id, existing, null);
  res.json(removed);
}));

router.get('/vendor/staff', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  res.json(rowsToApi((await query('select * from staff where vendor_id = $1 order by name asc', [await resolveVendorId(req)])).rows));
}));

router.post('/vendor/staff', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const entry = await insertRow('staff', { id: uid('staff'), ...splitAllowed({ ...req.body, vendorId: await resolveVendorId(req), active: req.body.active !== false }, staffColumns) });
  await audit(req, 'create', 'staff', entry.id, null, entry);
  res.status(201).json(entry);
}));

router.patch('/vendor/staff/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const entry = await updateRow('staff', req.params.id, splitAllowed(req.body, staffColumns));
  if (!entry) return res.status(404).json({ message: 'Staff member not found' });
  await audit(req, 'update', 'staff', entry.id, null, entry);
  res.json(entry);
}));

router.delete('/vendor/staff/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const removed = await deleteRow('staff', req.params.id);
  if (!removed) return res.status(404).json({ message: 'Staff member not found' });
  await audit(req, 'delete', 'staff', req.params.id, removed, null);
  res.json(removed);
}));

router.get('/vendor/promotions', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  res.json(rowsToApi((await query('select * from promotions where vendor_id = $1 order by created_at desc', [await resolveVendorId(req)])).rows));
}));

router.post('/vendor/promotions', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const entry = await insertRow('promotions', { id: uid('promo'), ...splitAllowed({ ...req.body, vendorId: await resolveVendorId(req) }, promotionColumns) });
  await audit(req, 'create', 'promotion', entry.id, null, entry);
  res.status(201).json(entry);
}));

router.patch('/vendor/promotions/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const entry = await updateRow('promotions', req.params.id, splitAllowed(req.body, promotionColumns));
  if (!entry) return res.status(404).json({ message: 'Promotion not found' });
  await audit(req, 'update', 'promotion', entry.id, null, entry);
  res.json(entry);
}));

router.delete('/vendor/promotions/:id', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const removed = await deleteRow('promotions', req.params.id);
  if (!removed) return res.status(404).json({ message: 'Promotion not found' });
  await audit(req, 'delete', 'promotion', req.params.id, removed, null);
  res.json(removed);
}));

router.get('/vendor/kyv', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  res.json(rowsToApi((await query('select * from kyv_documents where vendor_id = $1 order by created_at desc', [await resolveVendorId(req)])).rows));
}));

router.post('/vendor/kyv', requireRole('vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const vendorId = await resolveVendorId(req);
  const doc = await validateAndStoreKyvDocument(req.body, vendorId);
  const entry = await insertRow('kyv_documents', {
    id: uid('kyv'),
    vendor_id: vendorId,
    document_type: doc.documentType,
    file_name: doc.fileName,
    file_url: doc.fileUrl,
    file_hash: doc.fileHash,
    file_size: doc.fileSize,
    mime_type: doc.mimeType,
    status: 'pending',
  });
  await audit(req, 'submit', 'kyv_document', entry.id, null, entry);
  res.status(201).json(entry);
}));

router.get('/notifications', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  res.json(rowsToApi((await query('select * from notifications where user_id = $1 order by created_at desc', [req.user?.id])).rows));
}));

router.patch('/notifications/:id/read', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req, res) => {
  res.json(await updateRow('notifications', req.params.id, { is_read: true, read_at: now() }));
}));

router.get('/messages', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const rows = rowsToApi((await query(
    'select * from messages where sender_id = $1 or recipient_id = $1 order by created_at desc limit 100',
    [req.user?.id],
  )).rows);
  res.json({ chats: [], messages: rows });
}));

router.post('/messages', requireRole('customer', 'vendor', 'admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const message = await insertRow('messages', {
    id: uid('msg'),
    thread_id: req.body.threadId || uid('thread'),
    sender_role: req.user?.role,
    sender_id: req.user?.id,
    recipient_id: req.body.recipientId || null,
    body: req.body.body || req.body.text || '',
    metadata: req.body.metadata || {},
  });
  res.status(201).json(message);
}));

router.get('/admin/users', requireRole('admin'), asyncHandler(async (_req, res) => {
  res.json((await query('select * from users order by created_at desc')).rows.map(safeUser));
}));

router.get('/admin/vendors', requireRole('admin'), asyncHandler(async (_req, res) => {
  res.json(rowsToApi((await query('select * from vendors order by created_at desc')).rows));
}));

router.get('/admin/bookings', requireRole('admin'), asyncHandler(async (_req, res) => {
  res.json((await query('select * from bookings order by created_at desc')).rows.map(bookingToApi));
}));

router.get('/admin/categories', requireRole('admin'), asyncHandler(async (_req, res) => {
  const result = await query(
    `select c.*, count(s.id)::int as services from categories c left join services s on s.category_id = c.id group by c.id order by c.name asc`,
  );
  res.json(rowsToApi(result.rows).map((category) => ({ ...category, status: category.active ? 'active' : 'inactive' })));
}));

router.get('/admin/promotions', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from promotions order by created_at desc')).rows))));
router.get('/admin/cms', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from cms_pages order by created_at desc')).rows))));
router.get('/admin/reviews', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from reviews order by created_at desc')).rows))));
router.get('/admin/support', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from support_tickets order by created_at desc')).rows))));
router.get('/admin/payments', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from payments order by created_at desc')).rows))));
router.get('/admin/kyv', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from kyv_documents order by created_at desc')).rows))));
router.get('/admin/pricing', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from pricing_rules order by created_at desc')).rows))));
router.get('/admin/audit-logs', requireRole('admin'), asyncHandler(async (_req, res) => res.json(rowsToApi((await query('select * from audit_logs order by created_at desc limit 500')).rows))));

router.get('/admin/settings', requireRole('admin'), asyncHandler(async (_req, res) => {
  const rows = rowsToApi((await query('select * from platform_settings order by key asc')).rows);
  res.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
}));

router.post('/admin/users', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const { email, password, role = 'customer', fullName = '', phone = '', status = 'active' } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  if (!['customer', 'vendor', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (await findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' });
  const initialPassword = password || crypto.randomBytes(18).toString('base64url');
  const user = await insertRow('users', {
    id: uid('user'),
    email: String(email).toLowerCase(),
    password_hash: await bcrypt.hash(initialPassword, 12),
    role,
    full_name: fullName,
    phone,
    status,
  });
  if (!password) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    await insertRow('password_reset_tokens', { id: uid('reset'), user_id: user.id, token_hash: tokenHash(resetToken), expires_at: new Date(Date.now() + 3600000).toISOString() });
    await sendPasswordResetEmail(user.email, resetToken);
  }
  await audit(req, 'create', 'user', user.id, null, user);
  res.status(201).json(user);
}));

router.patch('/admin/users/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const before = safeUser((await query('select * from users where id = $1', [req.params.id])).rows[0]);
  if (!before) return res.status(404).json({ message: 'User not found' });
  const row: any = {};
  if (req.body.fullName !== undefined) row.full_name = req.body.fullName;
  if (req.body.phone !== undefined) row.phone = req.body.phone;
  if (req.body.status !== undefined) row.status = req.body.status;
  if (req.body.role !== undefined) row.role = req.body.role;
  const user = await updateRow('users', req.params.id, row);
  await audit(req, 'update', 'user', req.params.id, before, user);
  res.json(user);
}));

router.delete('/admin/users/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const removed = await deleteRow('users', req.params.id);
  if (!removed) return res.status(404).json({ message: 'User not found' });
  await audit(req, 'delete', 'user', req.params.id, removed, null);
  res.json(removed);
}));

router.post('/admin/vendors', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const businessName = String(req.body.businessName || req.body.name || '').trim();
  if (!businessName) return res.status(400).json({ message: 'Business name is required' });
  const vendor = await insertRow('vendors', { id: uid('vendor'), ...splitAllowed({ ...req.body, businessName }, vendorColumns) });
  await audit(req, 'create', 'vendor', vendor.id, null, vendor);
  res.status(201).json(vendor);
}));

router.patch('/admin/vendors/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const before = rowToApi((await query('select * from vendors where id = $1', [req.params.id])).rows[0]);
  if (!before) return res.status(404).json({ message: 'Vendor not found' });
  const vendor = await updateRow('vendors', req.params.id, splitAllowed(req.body, vendorColumns));
  await audit(req, 'update', 'vendor', req.params.id, before, vendor);
  res.json(vendor);
}));

router.delete('/admin/vendors/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const removed = await deleteRow('vendors', req.params.id);
  if (!removed) return res.status(404).json({ message: 'Vendor not found' });
  await audit(req, 'delete', 'vendor', req.params.id, removed, null);
  res.json(removed);
}));

router.post('/categories', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Category name is required' });
  const category = await insertRow('categories', { id: uid('cat'), ...splitAllowed({ ...req.body, slug: req.body.slug || slugify(name), active: req.body.active !== false }, categoryColumns) });
  await audit(req, 'create', 'category', category.id, null, category);
  res.status(201).json(category);
}));

router.patch('/categories/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const category = await updateRow('categories', req.params.id, splitAllowed({ ...req.body, slug: req.body.slug ? slugify(req.body.slug) : undefined }, categoryColumns));
  if (!category) return res.status(404).json({ message: 'Category not found' });
  await audit(req, 'update', 'category', category.id, null, category);
  res.json(category);
}));

router.delete('/categories/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const removed = await deleteRow('categories', req.params.id);
  if (!removed) return res.status(404).json({ message: 'Category not found' });
  await audit(req, 'delete', 'category', req.params.id, removed, null);
  res.json(removed);
}));

router.patch('/admin/settings', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await query(
      `insert into platform_settings (key, value, updated_at) values ($1, $2, now())
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [key, JSON.stringify(value)],
    );
  }
  await audit(req, 'update', 'settings', 'platform', null, req.body);
  res.json(req.body);
}));

router.post('/admin/cms', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const page = await insertRow('cms_pages', splitAllowed({ ...req.body, slug: req.body.slug || slugify(req.body.title || '') }, cmsColumns));
  await audit(req, 'create', 'cms_page', page.slug, null, page);
  res.status(201).json(page);
}));

router.patch('/admin/cms/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const row = splitAllowed({ ...req.body, slug: req.body.slug ? slugify(req.body.slug) : undefined }, cmsColumns);
  const result = await query(
    `update cms_pages set ${Object.keys(row).map((key, index) => `${key} = $${index + 2}`).join(', ')}, updated_at = now()
     where slug = $1 returning *`,
    [req.params.id, ...Object.values(row)],
  );
  const page = rowToApi(result.rows[0]);
  if (!page) return res.status(404).json({ message: 'Page not found' });
  await audit(req, 'update', 'cms_page', req.params.id, null, page);
  res.json(page);
}));

router.delete('/admin/cms/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const page = rowToApi((await query('delete from cms_pages where slug = $1 returning *', [req.params.id])).rows[0]);
  if (!page) return res.status(404).json({ message: 'Page not found' });
  await audit(req, 'delete', 'cms_page', req.params.id, page, null);
  res.json(page);
}));

router.post('/admin/support', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const ticket = await insertRow('support_tickets', { id: uid('ticket'), ...splitAllowed(req.body, supportColumns) });
  await audit(req, 'create', 'support_ticket', ticket.id, null, ticket);
  res.status(201).json(ticket);
}));

router.patch('/admin/support/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const ticket = await updateRow('support_tickets', req.params.id, splitAllowed(req.body, supportColumns));
  if (!ticket) return res.status(404).json({ message: 'Support ticket not found' });
  await audit(req, 'update', 'support_ticket', ticket.id, null, ticket);
  res.json(ticket);
}));

router.post('/admin/pricing', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const rule = await insertRow('pricing_rules', { id: uid('price'), ...splitAllowed(req.body, pricingColumns) });
  await audit(req, 'create', 'pricing_rule', rule.id, null, rule);
  res.status(201).json(rule);
}));

router.patch('/admin/pricing/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const rule = await updateRow('pricing_rules', req.params.id, splitAllowed(req.body, pricingColumns));
  if (!rule) return res.status(404).json({ message: 'Pricing rule not found' });
  await audit(req, 'update', 'pricing_rule', rule.id, null, rule);
  res.json(rule);
}));

router.delete('/admin/pricing/:id', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const removed = await deleteRow('pricing_rules', req.params.id);
  if (!removed) return res.status(404).json({ message: 'Pricing rule not found' });
  await audit(req, 'delete', 'pricing_rule', req.params.id, removed, null);
  res.json(removed);
}));

router.patch('/admin/kyv/:id/approve', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const document = await updateRow('kyv_documents', req.params.id, { status: 'approved', reviewed_by: req.user?.id, reviewed_at: now(), review_note: req.body.note || '' });
  if (!document) return res.status(404).json({ message: 'KYV document not found' });
  await audit(req, 'approve', 'kyv_document', document.id, null, document);
  res.json(document);
}));

router.post('/admin/kyv/:id/reject', requireRole('admin'), asyncHandler(async (req: AuthedRequest, res) => {
  const document = await updateRow('kyv_documents', req.params.id, { status: 'rejected', reviewed_by: req.user?.id, reviewed_at: now(), review_note: req.body.reason || '' });
  if (!document) return res.status(404).json({ message: 'KYV document not found' });
  await audit(req, 'reject', 'kyv_document', document.id, null, document);
  res.json(document);
}));

router.get('/admin/analytics', requireRole('admin'), asyncHandler(async (_req, res) => {
  const summary = await query(`
    select
      (select count(*)::int from bookings) as total_bookings,
      (select coalesce(sum(amount), 0)::numeric from bookings) as total_revenue,
      (select count(*)::int from users) as total_users,
      (select count(*)::int from vendors) as total_vendors
  `);
  const breakdown = await query('select status, count(*)::int from bookings group by status');
  const recentBookings = (await query('select * from bookings order by created_at desc limit 10')).rows.map(bookingToApi);
  const topVendors = rowsToApi((await query('select * from vendors order by rating desc limit 10')).rows);
  res.json({
    ...rowToApi(summary.rows[0]),
    bookingStatusBreakdown: Object.fromEntries(breakdown.rows.map((row) => [row.status, row.count])),
    recentBookings,
    topVendors,
  });
}));

export default router;
