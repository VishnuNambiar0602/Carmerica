import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cacheDel, cacheGet, cacheSet } from './lib/redis.js';
import { isSupabaseConfigured } from './lib/supabase.js';

type Role = 'customer' | 'vendor' | 'admin';

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  fullName: string;
  phone?: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
};

type BookingRecord = {
  id: string;
  vendorId: string;
  garageId: string;
  serviceId: string;
  email: string;
  customer: string;
  car: string;
  service: string;
  time: string;
  date: string;
  status: string;
  price: number;
  phone?: string;
  license?: string;
  cancellationReason?: string;
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
};

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'carmerica-dev-secret';
const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const users: UserRecord[] = [
  { id: 'user-1', email: 'john@example.com', passwordHash: bcrypt.hashSync('password123', 10), role: 'customer', fullName: 'John Doe', phone: '+1-555-0101', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'user-2', email: 'partner@garage.com', passwordHash: bcrypt.hashSync('password123', 10), role: 'vendor', fullName: 'Elite Motors Admin', phone: '+1-555-0102', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'user-admin', email: 'admin@carmerica.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin', fullName: 'System Admin', status: 'active', createdAt: now(), updatedAt: now() },
];

const vendors: Array<any> = [
  { id: 'vendor-1', userId: 'user-2', name: 'Elite Motors', businessName: 'Elite Motors', rating: 4.8, active: true, verified: true, phone: '+1-555-0102', email: 'partner@garage.com', location: 'Downtown, Dubai', description: 'Premium maintenance and repair services.', createdAt: now(), updatedAt: now() },
];

const garages: Array<any> = [
  { id: 'garage-1', vendorId: 'vendor-1', name: 'Elite Auto Care', location: '123 Downtown St, Los Angeles, CA 90012', city: 'Dubai', rating: 4.8, reviews: 1240, active: true, image: 'https://picsum.photos/seed/garage1/400/250', trustScore: 98, description: 'Full service garage with AI-assisted pricing.', createdAt: now(), updatedAt: now() },
  { id: 'garage-2', vendorId: 'vendor-1', name: 'Precision Mechanics', location: 'Al Quoz, Dubai', city: 'Dubai', rating: 4.6, reviews: 850, active: true, image: 'https://picsum.photos/seed/garage2/400/250', trustScore: 92, description: 'Fast turnaround on common maintenance jobs.', createdAt: now(), updatedAt: now() },
];

const categories: Array<any> = [
  { id: 'cat-1', name: 'Maintenance', slug: 'maintenance', active: true, createdAt: now(), updatedAt: now() },
  { id: 'cat-2', name: 'Repairs', slug: 'repairs', active: true, createdAt: now(), updatedAt: now() },
  { id: 'cat-3', name: 'Diagnostics', slug: 'diagnostics', active: true, createdAt: now(), updatedAt: now() },
];

const services: Array<any> = [
  { id: 's1', vendorId: 'vendor-1', garageId: 'garage-1', categoryId: 'cat-1', name: 'Brake Repair', price: 120, durationMinutes: 90, active: true, createdAt: now(), updatedAt: now() },
  { id: 's2', vendorId: 'vendor-1', garageId: 'garage-1', categoryId: 'cat-1', name: 'Oil Change', price: 49, durationMinutes: 30, active: true, createdAt: now(), updatedAt: now() },
  { id: 's3', vendorId: 'vendor-1', garageId: 'garage-2', categoryId: 'cat-2', name: 'General Service', price: 189, durationMinutes: 120, active: true, createdAt: now(), updatedAt: now() },
];

const bookings: BookingRecord[] = [
  { id: 'BK-1029', vendorId: 'vendor-1', garageId: 'garage-1', serviceId: 's2', email: 'john@example.com', customer: 'John Doe', car: 'Toyota Camry', service: 'Oil Change', time: '10:00 AM', date: 'Oct 12, 2026', status: 'In Progress', price: 89, phone: '+1-555-0101', createdAt: now(), updatedAt: now() },
  { id: 'BK-1030', vendorId: 'vendor-1', garageId: 'garage-1', serviceId: 's1', email: 'sarah@example.com', customer: 'Sarah Smith', car: 'Honda Civic', service: 'Brake Repair', time: '11:30 AM', date: 'Oct 12, 2026', status: 'Pending', price: 120, phone: '+1-555-0103', createdAt: now(), updatedAt: now() },
  { id: 'BK-1031', vendorId: 'vendor-1', garageId: 'garage-2', serviceId: 's3', email: 'mike@example.com', customer: 'Mike Johnson', car: 'Ford F-150', service: 'General Service', time: '01:00 PM', date: 'Oct 12, 2026', status: 'Confirmed', price: 189, phone: '+1-555-0104', createdAt: now(), updatedAt: now() },
  { id: 'BK-1028', vendorId: 'vendor-1', garageId: 'garage-1', serviceId: 's3', email: 'robert@example.com', customer: 'Robert Brown', car: 'BMW 3 Series', service: 'Full Service', time: '09:00 AM', date: 'Oct 11, 2026', status: 'Completed', price: 250, phone: '+1-555-0105', createdAt: now(), updatedAt: now() },
];

const reviews: Array<any> = [
  { id: 'rev-1', user: 'John Doe', vendor: 'Elite Auto Care', garageId: 'garage-1', rating: 5, date: '2 days ago', comment: 'Excellent service!', status: 'published', vendorResponse: '' },
  { id: 'rev-2', user: 'Sarah Smith', vendor: 'Precision Mechanics', garageId: 'garage-2', rating: 4, date: '1 week ago', comment: 'Good experience overall.', status: 'published', vendorResponse: '' },
  { id: 'rev-3', user: 'Mike Johnson', vendor: 'Elite Auto Care', garageId: 'garage-1', rating: 2, date: '2 weeks ago', comment: 'The service took longer than expected.', status: 'flagged', vendorResponse: '' },
];

const promotions: Array<any> = [{ id: 'promo-1', vendorId: 'vendor-1', title: 'AC Summer Deal', description: '10% off AC diagnostics', discountType: 'percent', discountValue: 10, status: 'active' }];
const staff: Array<any> = [{ id: 'staff-1', vendorId: 'vendor-1', name: 'Alex Turner', role: 'Service Advisor', email: 'alex@elite.example', phone: '+1-555-0201', active: true }];
const payments: Array<any> = [{ id: 'pay-1', bookingId: 'BK-1028', amount: 250, currency: 'AED', status: 'paid', method: 'card', refundAmount: 0 }];
const wishlist: Array<any> = [{ id: 'wish-1', customerEmail: 'john@example.com', garageId: 'garage-1' }];
const kyvDocuments: Array<any> = [{ id: 'kyv-1', vendorId: 'vendor-1', documentType: 'trade-license', fileName: 'license.pdf', status: 'approved' }];
const notifications: Array<any> = [];
const resetTokens: Array<any> = [];
const chats: Array<any> = [
  { id: 1, name: 'John Doe', lastMessage: 'Is my car ready for pickup?', time: '10:30 AM', unread: 2, image: 'https://i.pravatar.cc/150?u=john' },
  { id: 2, name: 'Sarah Smith', lastMessage: 'Thank you for the quick service!', time: 'Yesterday', unread: 0, image: 'https://i.pravatar.cc/150?u=sarah' },
];
const messagesStore: Record<string, Array<any>> = {
  1: [
    { id: 1, text: 'Hello! I wanted to check the status of my Toyota Camry.', sender: 'customer', time: '09:15 AM' },
    { id: 2, text: "Hi John! We've completed the oil change and the 50-point inspection.", sender: 'vendor', time: '09:30 AM' },
    { id: 3, text: "That's great news. Is my car ready for pickup?", sender: 'customer', time: '10:30 AM' },
  ],
  2: [{ id: 1, text: 'Thank you for the great service!', sender: 'customer', time: 'Yesterday' }],
};
const settings: Record<string, any> = { platformName: 'CarMerica', supportEmail: 'support@carmerica.com', bookingLeadMinutes: 60, refundPolicyHours: 24 };

const safeUser = (user: UserRecord | undefined) => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

const issueToken = (user: UserRecord) => jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

const userFromToken = (req: any) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { sub: string };
    return users.find((u) => u.id === payload.sub) || null;
  } catch {
    return null;
  }
};

const requireRole = (...roles: Role[]) => (req: any, res: any, next: any) => {
  const user = userFromToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
  req.user = user;
  next();
};

const findUserByEmail = (email: string, role?: Role) => users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && (!role || u.role === role));

const matches = (item: any, q: string) => {
  const haystack = [item.name, item.businessName, item.location, item.city, item.description, item.service, item.title].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q.toLowerCase());
};

const buildAvailability = (vendorId: string, date: string) => {
  const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
  const booked = bookings.filter((b) => b.vendorId === vendorId && b.date === date && !['Cancelled', 'Completed'].includes(b.status)).map((b) => b.time);
  return slots.filter((slot) => !booked.includes(slot)).map((time) => ({ time, available: true }));
};

async function fromCacheOrCompute<T>(key: string, ttl: number, compute: () => T): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const result = compute();
  await cacheSet(key, result, ttl).catch(() => undefined);
  return result;
}

router.get('/hello', (_req, res) => res.json({ message: 'Hello from the API!' }));

router.get('/health/db', (_req, res) => {
  res.json({ status: 'ok', database: isSupabaseConfigured() ? 'supabase' : 'memory-backed', cache: process.env.REDIS_URL ? 'redis' : 'memory-backed' });
});

router.post('/auth/register', async (req, res) => {
  const { email, password, role, businessName, fullName, phone } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: 'Missing email, password, or role' });
  if (!['customer', 'vendor', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (findUserByEmail(email)) return res.status(409).json({ message: 'Email already registered' });

  const user: UserRecord = { id: uid('user'), email, role, fullName: fullName || businessName || '', phone: phone || '', status: 'active', passwordHash: await bcrypt.hash(password, 10), createdAt: now(), updatedAt: now() };
  users.push(user);

  let vendor = null;
  if (role === 'vendor') {
    vendor = { id: uid('vendor'), userId: user.id, name: businessName || fullName || email.split('@')[0], businessName: businessName || fullName || email.split('@')[0], email, phone: phone || '', rating: 0, active: true, verified: false, location: '', description: '', createdAt: now(), updatedAt: now() };
    vendors.push(vendor);
  }

  res.status(201).json({ message: 'Registered', token: issueToken(user), user: safeUser(user), vendor });
});

router.post('/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  const user = findUserByEmail(email, role);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const vendor = user.role === 'vendor' ? vendors.find((v) => v.userId === user.id) || null : null;
  res.json({ message: 'Authenticated', token: issueToken(user), user: safeUser(user), vendor });
});

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, 'admin');
  if (!email || !password || !user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Authenticated', token: issueToken(user), user: safeUser(user) });
});

router.post('/auth/logout', (_req, res) => res.json({ message: 'Logged out' }));

router.post('/auth/forgot-password', (req, res) => {
  const { email, role = 'customer' } = req.body;
  const user = findUserByEmail(email, role);
  if (!user) return res.json({ message: `If ${email} exists in our system, password reset instructions were sent.` });
  const token = uid('reset');
  resetTokens.push({ token, email, role, expiresAt: Date.now() + 1000 * 60 * 60 });
  res.json({ message: `If ${email} exists in our system, password reset instructions were sent.`, resetToken: process.env.NODE_ENV === 'production' ? undefined : token });
});

router.post('/auth/reset-password', async (req, res) => {
  const { token, email, password, role = 'customer' } = req.body;
  const entry = token ? resetTokens.find((t) => t.token === token && t.expiresAt > Date.now()) : resetTokens.find((t) => t.email === email && t.role === role && t.expiresAt > Date.now());
  if (!entry) return res.status(400).json({ message: 'Invalid or expired reset token' });
  const user = findUserByEmail(entry.email, entry.role);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.passwordHash = await bcrypt.hash(password, 10);
  user.updatedAt = now();
  res.json({ message: 'Password updated' });
});

router.get('/auth/me', (req, res) => {
  const user = userFromToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const vendor = user.role === 'vendor' ? vendors.find((v) => v.userId === user.id) || null : null;
  res.json({ user: safeUser(user), vendor });
});

router.get('/vendors', (_req, res) => res.json(vendors));

router.get('/services', async (req, res) => {
  const query = String(req.query.query || req.query.serviceType || '').trim();
  const vendorId = String(req.query.vendorId || '');
  const garageId = String(req.query.garageId || '');
  const key = `services:${query}:${vendorId}:${garageId}`;

  const result = await fromCacheOrCompute(key, 120, () => {
    let filtered = services.filter((s) => s.active !== false);
    if (vendorId) filtered = filtered.filter((s) => s.vendorId === vendorId);
    if (garageId) filtered = filtered.filter((s) => s.garageId === garageId);
    if (query) filtered = filtered.filter((s) => matches(s, query));
    return filtered;
  });

  res.json(result);
});

router.get('/garages', async (req, res) => {
  const query = String(req.query.query || req.query.location || req.query.q || '').trim();
  const key = `garages:${query}`;
  const result = await fromCacheOrCompute(key, 120, () => {
    let filtered = garages.filter((g) => g.active !== false);
    if (query) filtered = filtered.filter((g) => matches(g, query));
    return filtered;
  });
  res.json(result);
});

router.get('/garages/:id', (req, res) => {
  const garage = garages.find((g) => g.id === req.params.id);
  if (!garage) return res.status(404).json({ message: 'Garage not found' });
  res.json({ ...garage, services: services.filter((s) => s.garageId === garage.id) });
});

router.get('/availability/slots', (req, res) => {
  const vendorId = String(req.query.vendorId || '');
  const date = String(req.query.date || new Date().toDateString());
  if (!vendorId) return res.status(400).json({ message: 'vendorId is required' });
  res.json({ vendorId, date, slots: buildAvailability(vendorId, date) });
});

router.get('/bookings', async (req, res) => {
  const vendorId = String(req.query.vendorId || '');
  const customerEmail = String(req.query.customerEmail || req.query.email || '');
  const key = vendorId ? `bookings:vendor:${vendorId}` : customerEmail ? `bookings:customer:${customerEmail}` : 'bookings:all';

  const result = await fromCacheOrCompute(key, 60, () => {
    let filtered = bookings;
    if (vendorId) filtered = filtered.filter((b) => b.vendorId === vendorId);
    if (customerEmail) filtered = filtered.filter((b) => b.email === customerEmail);
    return filtered;
  });

  res.json(result);
});

router.post('/bookings', async (req, res) => {
  const { vendorId = 'vendor-1', garageId = 'garage-1', service = 'General Service', date, time, price = 0, email, phone, customer, carModel, carYear, license } = req.body;
  if (!date || !time || !email) return res.status(400).json({ message: 'Missing booking date, time, or email' });

  const booking: BookingRecord = { id: uid('BK'), vendorId, garageId, serviceId: req.body.serviceId || '', email, phone: phone || '', customer: customer || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Customer', car: carYear && carModel ? `${carModel} (${carYear})` : req.body.car || 'Vehicle', license: license || '', service, time, date, status: 'Pending', price: Number(price || 0), createdAt: now(), updatedAt: now() };
  bookings.unshift(booking);

  await Promise.allSettled([cacheDel(`bookings:vendor:${vendorId}`), cacheDel(`bookings:customer:${email}`)]);
  notifications.unshift({ id: uid('notif'), userId: email, type: 'booking_created', title: 'Booking created', body: `Booking ${booking.id} is now pending.`, read: false, createdAt: now(), metadata: { bookingId: booking.id } });

  res.status(201).json(booking);
});

router.get('/bookings/:id', (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

router.patch('/bookings/:id', (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  Object.assign(booking, req.body, { updatedAt: now() });
  res.json(booking);
});

router.post('/bookings/:id/cancel', (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = 'Cancelled';
  booking.cancellationReason = req.body.reason || '';
  booking.updatedAt = now();
  const payment = payments.find((p) => p.bookingId === booking.id);
  if (payment && payment.status !== 'refunded') {
    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.updatedAt = now();
  }
  res.json({ message: 'Booking cancelled', booking, refund: payment ? { amount: payment.refundAmount, status: payment.status } : null });
});

router.post('/bookings/:id/reschedule', (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.date = req.body.date || booking.date;
  booking.time = req.body.time || booking.time;
  booking.status = req.body.status || 'Confirmed';
  booking.updatedAt = now();
  res.json({ message: 'Booking rescheduled', booking });
});

router.get('/messages', (_req, res) => res.json({ chats, messages: messagesStore }));

router.post('/messages', (req, res) => {
  const { threadId, sender, text } = req.body;
  if (!threadId || !sender || !text) return res.status(400).json({ message: 'Missing fields' });
  const message = { id: Date.now(), sender, text, time: new Date().toLocaleTimeString() };
  if (!messagesStore[String(threadId)]) messagesStore[String(threadId)] = [];
  messagesStore[String(threadId)].push(message);
  const chat = chats.find((c) => c.id === Number(threadId));
  if (chat) {
    chat.lastMessage = text;
    chat.time = message.time;
  }
  res.status(201).json(message);
});

router.get('/vendor/stats', (req, res) => {
  const vendorId = String(req.query.vendorId || 'vendor-1');
  const vendorBookings = bookings.filter((b) => b.vendorId === vendorId);
  res.json({
    totalBookings: vendorBookings.length,
    monthlyRevenue: vendorBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0),
    avgRating: vendors.find((v) => v.id === vendorId)?.rating ?? 4.7,
    pending: vendorBookings.filter((b) => b.status === 'Pending').length,
    recentBookings: vendorBookings.slice(-5).reverse(),
  });
});

router.get('/notifications', (req, res) => {
  const userId = String(req.query.userId || '');
  const unreadOnly = String(req.query.unreadOnly || '') === 'true';
  let result = notifications;
  if (userId) result = result.filter((n) => n.userId === userId);
  if (unreadOnly) result = result.filter((n) => !n.read);
  res.json(result);
});

router.patch('/notifications/:id/read', (req, res) => {
  const notification = notifications.find((n) => n.id === req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  notification.read = true;
  notification.readAt = now();
  res.json(notification);
});

router.get('/reviews', (req, res) => {
  const garageId = String(req.query.garageId || '');
  const vendorId = String(req.query.vendorId || '');
  let result = reviews;
  if (garageId) result = result.filter((r) => r.garageId === garageId);
  if (vendorId) {
    const vendor = vendors.find((v) => v.id === vendorId);
    result = result.filter((r) => r.vendor === vendor?.name || r.vendor === vendor?.businessName);
  }
  res.json(result);
});

router.post('/reviews', (req, res) => {
  const review = { id: uid('rev'), user: req.body.user || 'Anonymous', vendor: req.body.vendor || 'Unknown Vendor', garageId: req.body.garageId || '', rating: Number(req.body.rating || 5), date: 'Just now', comment: req.body.comment || '', status: 'published', vendorResponse: '', createdAt: now() };
  reviews.unshift(review);
  res.status(201).json(review);
});

router.patch('/reviews/:id/response', requireRole('vendor', 'admin'), (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  review.vendorResponse = req.body.response || '';
  review.respondedAt = now();
  res.json(review);
});

router.get('/wishlist', (req, res) => {
  const customerEmail = String(req.query.customerEmail || '');
  res.json(wishlist.filter((w) => w.customerEmail === customerEmail));
});

router.post('/wishlist', (req, res) => {
  const entry = { id: uid('wish'), customerEmail: req.body.customerEmail, garageId: req.body.garageId, createdAt: now() };
  wishlist.push(entry);
  res.status(201).json(entry);
});

router.delete('/wishlist', (req, res) => {
  const customerEmail = String(req.query.customerEmail || req.body.customerEmail || '');
  const garageId = String(req.query.garageId || req.body.garageId || '');
  const index = wishlist.findIndex((w) => w.customerEmail === customerEmail && w.garageId === garageId);
  if (index === -1) return res.status(404).json({ message: 'Wishlist item not found' });
  const [removed] = wishlist.splice(index, 1);
  res.json(removed);
});

router.get('/admin/users', requireRole('admin'), (_req, res) => res.json(users.map(safeUser)));
router.get('/admin/vendors', requireRole('admin'), (_req, res) => res.json(vendors));
router.get('/admin/bookings', requireRole('admin'), (_req, res) => res.json(bookings));
router.get('/admin/categories', requireRole('admin'), (_req, res) => res.json(categories));
router.get('/admin/promotions', requireRole('admin'), (_req, res) => res.json(promotions));
router.get('/admin/cms', requireRole('admin'), (_req, res) => res.json([{ id: 'cms-home', slug: 'home', title: 'Home', content: '<h1>Home</h1>', status: 'published' }]));
router.get('/admin/reviews', requireRole('admin'), (_req, res) => res.json(reviews));
router.get('/admin/support', requireRole('admin'), (_req, res) => res.json([{ id: 'ticket-1', subject: 'Sample ticket', status: 'open', priority: 'medium' }]));
router.get('/admin/payments', requireRole('admin'), (_req, res) => res.json(payments));
router.get('/admin/settings', requireRole('admin'), (_req, res) => res.json(settings));
router.get('/admin/kyv', requireRole('admin'), (_req, res) => res.json(kyvDocuments));

router.patch('/admin/settings', requireRole('admin'), (req, res) => {
  Object.assign(settings, req.body, { updatedAt: now() });
  res.json(settings);
});

router.patch('/admin/kyv/:id/approve', requireRole('admin'), (req, res) => {
  const document = kyvDocuments.find((k) => k.id === req.params.id);
  if (!document) return res.status(404).json({ message: 'KYV document not found' });
  document.status = 'approved';
  document.reviewedAt = now();
  res.json(document);
});

router.post('/admin/kyv/:id/reject', requireRole('admin'), (req, res) => {
  const document = kyvDocuments.find((k) => k.id === req.params.id);
  if (!document) return res.status(404).json({ message: 'KYV document not found' });
  document.status = 'rejected';
  document.reviewNote = req.body.reason || '';
  document.reviewedAt = now();
  res.json(document);
});

router.get('/admin/analytics', requireRole('admin'), (_req, res) => {
  const byStatus = bookings.reduce((acc: Record<string, number>, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0),
    totalUsers: users.length,
    totalVendors: vendors.length,
    bookingStatusBreakdown: byStatus,
    recentBookings: bookings.slice(0, 10),
    topVendors: vendors.slice(0, 10),
  });
});

router.get('/customer/bookings', requireRole('customer', 'admin'), (req: any, res) => {
  const email = req.user?.email || String(req.query.customerEmail || '');
  res.json(bookings.filter((b) => b.email === email));
});

router.get('/customer/profile', (req, res) => {
  const email = String(req.query.email || '');
  const user = findUserByEmail(email, 'customer');
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  res.json({ ...safeUser(user), wishlist: wishlist.filter((w) => w.customerEmail === email) });
});

router.patch('/customer/profile', (req, res) => {
  const email = String(req.body.email || '');
  const user = findUserByEmail(email, 'customer');
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  Object.assign(user, req.body, { updatedAt: now() });
  res.json({ message: 'Profile updated', user: safeUser(user) });
});

router.post('/customer/bookings/:id/favorite', requireRole('customer', 'admin'), (req, res) => {
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.favorite = true;
  res.json(booking);
});

router.get('/vendor/profile', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendor = vendors.find((v) => v.userId === req.user.id || v.id === String(req.query.vendorId || ''));
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json(vendor);
});

router.patch('/vendor/profile', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendor = vendors.find((v) => v.userId === req.user.id || v.id === req.body.vendorId);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  Object.assign(vendor, req.body, { updatedAt: now() });
  res.json(vendor);
});

router.get('/vendor/bookings', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  res.json(bookings.filter((b) => b.vendorId === vendorId));
});

router.get('/vendor/calendar', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  const date = String(req.query.date || '');
  const data = bookings.filter((b) => b.vendorId === vendorId && (!date || b.date === date));
  res.json({ vendorId, date, bookings: data, availability: buildAvailability(vendorId, date || new Date().toDateString()) });
});

router.get('/vendor/earnings', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  const vendorBookings = bookings.filter((b) => b.vendorId === vendorId);
  const revenue = vendorBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const paid = payments.filter((p) => vendorBookings.some((b) => b.id === p.bookingId));
  res.json({ vendorId, revenue, paidPayments: paid, bookings: vendorBookings });
});

router.get('/vendor/services', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  res.json(services.filter((s) => s.vendorId === vendorId));
});

router.get('/vendor/staff', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  res.json(staff.filter((s) => s.vendorId === vendorId));
});

router.post('/vendor/staff', requireRole('vendor', 'admin'), (req: any, res) => {
  const entry = { id: uid('staff'), vendorId: req.user.id, ...req.body, active: req.body.active !== false, createdAt: now(), updatedAt: now() };
  staff.push(entry);
  res.status(201).json(entry);
});

router.patch('/vendor/staff/:id', requireRole('vendor', 'admin'), (req, res) => {
  const entry = staff.find((s) => s.id === req.params.id);
  if (!entry) return res.status(404).json({ message: 'Staff member not found' });
  Object.assign(entry, req.body, { updatedAt: now() });
  res.json(entry);
});

router.delete('/vendor/staff/:id', requireRole('vendor', 'admin'), (req, res) => {
  const index = staff.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Staff member not found' });
  const [removed] = staff.splice(index, 1);
  res.json(removed);
});

router.get('/vendor/promotions', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  res.json(promotions.filter((p) => p.vendorId === vendorId));
});

router.post('/vendor/promotions', requireRole('vendor', 'admin'), (req: any, res) => {
  const entry = { id: uid('promo'), vendorId: req.user.id, ...req.body, createdAt: now(), updatedAt: now() };
  promotions.push(entry);
  res.status(201).json(entry);
});

router.patch('/vendor/promotions/:id', requireRole('vendor', 'admin'), (req, res) => {
  const entry = promotions.find((p) => p.id === req.params.id);
  if (!entry) return res.status(404).json({ message: 'Promotion not found' });
  Object.assign(entry, req.body, { updatedAt: now() });
  res.json(entry);
});

router.delete('/vendor/promotions/:id', requireRole('vendor', 'admin'), (req, res) => {
  const index = promotions.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Promotion not found' });
  const [removed] = promotions.splice(index, 1);
  res.json(removed);
});

router.get('/vendor/kyv', requireRole('vendor', 'admin'), (req: any, res) => {
  const vendorId = String(req.query.vendorId || req.user.id);
  res.json(kyvDocuments.filter((k) => k.vendorId === vendorId));
});

router.post('/vendor/kyv', requireRole('vendor', 'admin'), (req: any, res) => {
  const entry = { id: uid('kyv'), vendorId: req.user.id, ...req.body, status: 'pending', createdAt: now(), updatedAt: now() };
  kyvDocuments.push(entry);
  res.status(201).json(entry);
});

export default router;
