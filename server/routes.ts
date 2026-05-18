import { Router } from 'express';

const router = Router();

// In-memory mock stores (replace with DB later)
const users: Array<any> = []; // customers
const vendors: Array<any> = [
  { id: 'vendor-1', name: 'Elite Motors', rating: 4.8, active: true },
];
const bookings: Array<any> = [
  {
    id: 'BK-1029',
    vendorId: 'vendor-1',
    email: 'john@example.com',
    customer: 'John Doe',
    car: 'Toyota Camry',
    service: 'Oil Change',
    time: '10:00 AM',
    date: 'Oct 12, 2026',
    status: 'In Progress',
    price: 89,
  },
  {
    id: 'BK-1030',
    vendorId: 'vendor-1',
    email: 'sarah@example.com',
    customer: 'Sarah Smith',
    car: 'Honda Civic',
    service: 'Brake Repair',
    time: '11:30 AM',
    date: 'Oct 12, 2026',
    status: 'Pending',
    price: 120,
  },
  {
    id: 'BK-1031',
    vendorId: 'vendor-1',
    email: 'mike@example.com',
    customer: 'Mike Johnson',
    car: 'Ford F-150',
    service: 'General Service',
    time: '01:00 PM',
    date: 'Oct 12, 2026',
    status: 'Confirmed',
    price: 189,
  },
  {
    id: 'BK-1028',
    vendorId: 'vendor-1',
    email: 'robert@example.com',
    customer: 'Robert Brown',
    car: 'BMW 3 Series',
    service: 'Full Service',
    time: '09:00 AM',
    date: 'Oct 11, 2026',
    status: 'Completed',
    price: 250,
  },
];
const services: Array<any> = [
  { id: 's1', name: 'Brake Repair', price: 120 },
  { id: 's2', name: 'Oil Change', price: 49 },
];

// Simple messages store (threads + messages)
const chats: Array<any> = [
  { id: 1, name: 'John Doe', lastMessage: 'Is my car ready for pickup?', time: '10:30 AM', unread: 2, image: 'https://i.pravatar.cc/150?u=john' },
  { id: 2, name: 'Sarah Smith', lastMessage: 'Thank you for the quick service!', time: 'Yesterday', unread: 0, image: 'https://i.pravatar.cc/150?u=sarah' },
];

const messagesStore: Record<number, Array<any>> = {
  1: [
    { id: 1, text: 'Hello! I wanted to check the status of my Toyota Camry.', sender: 'customer', time: '09:15 AM' },
    { id: 2, text: "Hi John! We've completed the oil change and the 50-point inspection.", sender: 'vendor', time: '09:30 AM' },
    { id: 3, text: "That's great news. Is my car ready for pickup?", sender: 'customer', time: '10:30 AM' },
  ],
  2: [
    { id: 1, text: 'Thank you for the great service!', sender: 'customer', time: 'Yesterday' },
  ]
};

// Health / sample
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

// Auth: register
router.post('/auth/register', (req, res) => {
  const { email, password, role, businessName } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

  const store = role === 'vendor' ? vendors : users;
  if (store.find((u) => u.email === email)) return res.status(409).json({ message: 'Email already registered' });

  const user = { id: `${Date.now()}`, email, password, role, businessName };
  store.push(user);
  res.status(201).json({ message: 'Registered', user: { id: user.id, email: user.email, role: user.role } });
});

// Auth: login
router.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  const store = role === 'vendor' ? vendors : users;
  const user = store.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Authenticated', user: { id: user.id, email: user.email, role: user.role } });
});

// Auth: forgot password (mock)
router.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  // In real app: generate token + email. Here just respond positively.
  res.json({ message: `If ${email} exists in our system, password reset instructions were sent.` });
});

// Services
router.get('/services', (req, res) => {
  res.json(services);
});

// Vendors
router.get('/vendors', (req, res) => {
  res.json(vendors);
});

// Bookings
router.get('/bookings', (req, res) => {
  const { vendorId, customerEmail } = req.query;
  let results = bookings;
  if (vendorId) results = bookings.filter(b => b.vendorId === vendorId);
  if (customerEmail) results = bookings.filter(b => b.email === customerEmail);
  res.json(results);
});

router.post('/bookings', (req, res) => {
  const booking = { id: `${Date.now()}`, ...req.body };
  bookings.push(booking);
  res.status(201).json(booking);
});

// Messages
router.get('/messages', (req, res) => {
  // return chat list and messages for convenience
  res.json({ chats, messages: messagesStore });
});

router.post('/messages', (req, res) => {
  const { threadId, sender, text } = req.body;
  if (!threadId || !sender || !text) return res.status(400).json({ message: 'Missing fields' });
  const id = Date.now();
  const msg = { id, sender, text, time: new Date().toLocaleTimeString() };
  if (!messagesStore[threadId]) messagesStore[threadId] = [];
  messagesStore[threadId].push(msg);
  // update chats lastMessage/time
  const chat = chats.find(c => c.id === Number(threadId));
  if (chat) {
    chat.lastMessage = text;
    chat.time = msg.time;
  }
  res.status(201).json(msg);
});

// Vendor stats
router.get('/vendor/stats', (req, res) => {
  const { vendorId } = req.query;
  const vendorBookings = vendorId ? bookings.filter(b => b.vendorId === vendorId) : bookings;
  const totalBookings = vendorBookings.length;
  const monthlyRevenue = vendorBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const avgRating = vendors.find(v => v.id === vendorId)?.rating ?? 4.7;
  const pending = vendorBookings.filter(b => b.status === 'Pending').length;
  res.json({ totalBookings, monthlyRevenue, avgRating, pending, recentBookings: vendorBookings.slice(-5).reverse() });
});

export default router;

