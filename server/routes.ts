import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './lib/db.js';
import { cacheDel as baseCacheDel } from './lib/redis.js';
import { getAIStatus, sendAIMessage } from './lib/aiSupport.js';
import { sendPasswordResetEmail } from './lib/mailer.js';
import { generate } from './lib/groq.js';
import { getJwtSecret } from './lib/config.js';
import {
  createPaymentIntent,
  createRefund,
  constructWebhookEvent,
  confirmPaymentIntent,
  getPaymentConfig,
} from './lib/stripe.js';

type Role = 'customer' | 'vendor' | 'admin';

const router = Router();
const JWT_SECRET = getJwtSecret();
const now = () => new Date().toISOString();

const safeUser = (user: any) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return { ...rest, passwordHash: undefined };
};

const issueToken = (user: any) => jwt.sign(
  { id: user.id, sub: user.id, role: user.role, email: user.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const userFromToken = (req: any) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { sub: string };
    return db.findUserById(payload.sub);
  } catch {
    return null;
  }
};

const requireRole = (...roles: Role[]) => async (req: any, res: any, next: any) => {
  const user = await userFromToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
  req.user = user;
  next();
};

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const resolveVendorId = async (req: any) => {
  const explicitVendorId = String(req.query.vendorId || req.body?.vendorId || '').trim();
  if (explicitVendorId) return explicitVendorId;
  if (req.user?.role === 'vendor') {
    const vendor = await db.findVendorByUserId(req.user.id);
    return vendor?.id || req.user.id;
  }
  return 'vendor-1';
};

const cacheDel = async (key: string) => {
  try { await baseCacheDel(key); } catch { /* ignore */ }
};

const clearBookingCache = async (booking: any) => {
  await Promise.allSettled([
    booking.vendor_id ? cacheDel(`bookings:vendor:${booking.vendor_id}`) : Promise.resolve(),
    booking.customer_email ? cacheDel(`bookings:customer:${booking.customer_email}`) : Promise.resolve(),
    cacheDel('bookings:all'),
  ]);
};

const matches = (item: any, q: string) => {
  const haystack = [item.name, item.business_name, item.location, item.city, item.description, item.title].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q.toLowerCase());
};

const buildAvailability = async (vendorId: string, date: string) => {
  const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
  const bookings = await db.listBookings({ vendorId, date });
  const bookedTimes = bookings.filter((b) => !['Cancelled', 'Completed'].includes(b.status)).map((b) => b.scheduled_time);
  return slots.filter((slot) => !bookedTimes.includes(slot)).map((time) => ({ time, available: true }));
};

const decorateService = async (service: any) => {
  const cat = service.category_id ? await db.findCategoryById(service.category_id) : null;
  const priceTags = ['Fair Price', 'Best Value', 'Popular', 'Recommended'];
  return {
    ...service,
    id: service.id,
    vendorId: service.vendor_id,
    garageId: service.garage_id,
    categoryId: service.category_id,
    category: cat?.name || 'Uncategorized',
    durationMinutes: service.duration_minutes,
    duration: `${service.duration_minutes || 60} mins`,
    status: service.active === false ? 'inactive' : 'active',
    price: Number(service.price),
    active: service.active,
    aiTag: priceTags[Math.abs(service.id.charCodeAt(0)) % priceTags.length],
    marketPrice: Math.round(Number(service.price) * 1.15),
  };
};

// --- Health & Hello ---
router.get('/hello', (_req, res) => res.json({ message: 'Hello from the API!' }));
router.get('/health/db', (_req, res) => {
  res.json({
    status: 'ok',
    database: db.isSupabase ? 'supabase' : 'memory-backed',
    cache: process.env.REDIS_URL ? 'redis' : 'memory-backed',
  });
});

// --- AI ---
router.get('/ai/health', (_req, res) => res.json(getAIStatus()));

router.post('/ai/chat', async (req, res, next) => {
  try {
    const userMessage = String(req.body.userMessage || '');
    const conversationHistory = Array.isArray(req.body.conversationHistory) ? req.body.conversationHistory : [];
    const currentAgent = req.body.currentAgent || null;
    const userId = String(req.body.userId || 'user-1');
    if (!userMessage.trim() && conversationHistory.length > 0) {
      return res.status(400).json({ message: 'userMessage is required' });
    }
    const response = await sendAIMessage({ userMessage, conversationHistory, currentAgent, userId });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.post('/ai/smart-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    let analysis = {
      category: 'General Service',
      urgency: 'low',
      keywords: [] as string[],
      reasoning: `Based on your search for "${query}", we found matching garages.`
    };

    try {
      const intentPrompt = `You are an automotive service intake expert.
        A customer said: "${query}"
        Extract their service intent. Return ONLY valid JSON:
        {
          "category": "Oil Change | Brake Service | Electrical | Tire Service | AC Service | Engine Diagnostics | Body Work | General Service | Suspension | Transmission",
          "urgency": "low | medium | high",
          "keywords": ["keyword1", "keyword2"],
          "reasoning": "One sentence explaining why this category was chosen."
        }`;
      const raw = await generate(intentPrompt, query);
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
      const parsed = JSON.parse(cleaned);
      analysis = {
        category: parsed.category || 'General Service',
        urgency: parsed.urgency || 'low',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        reasoning: parsed.reasoning || `Based on your search for "${query}", we found matching garages.`
      };
    } catch (err) {
      console.warn('[AI] Smart search LLM failed, using fallback:', err);
      const q = query.toLowerCase();
      let category = 'General Service';
      let keywords: string[] = [];
      if (/oil|change|lube/.test(q)) { category = 'Oil Change'; keywords = ['oil', 'lube']; }
      else if (/brake|pad|rotor/.test(q)) { category = 'Brake Service'; keywords = ['brake', 'pad']; }
      else if (/battery|electrical/.test(q)) { category = 'Electrical'; keywords = ['battery', 'electrical']; }
      else if (/tire|tyre|wheel/.test(q)) { category = 'Tire Service'; keywords = ['tire', 'wheel']; }
      else if (/ac|air conditioning|cooling/.test(q)) { category = 'AC Service'; keywords = ['ac', 'cooling']; }
      else if (/engine|diagnostic|check/.test(q)) { category = 'Engine Diagnostics'; keywords = ['engine', 'diagnostic']; }
      else if (/body|paint|dent/.test(q)) { category = 'Body Work'; keywords = ['body', 'paint']; }
      
      analysis = {
        category,
        urgency: 'low',
        keywords,
        reasoning: `Based on your search for "${query}", we detected ${category} intent.`
      };
    }

    const searchTerm = analysis.keywords[0] || query;
    const garages = await db.listGarages({ query: searchTerm });
    const services = await db.listServices();
    const serviceMap = services.reduce((acc: Record<string, any[]>, s) => {
      if (!acc[s.garage_id]) acc[s.garage_id] = [];
      acc[s.garage_id].push(s);
      return acc;
    }, {});
    const enriched = garages.map((g: any) => ({ ...g, services: serviceMap[g.id] || [] }));

    res.json({
      garages: enriched,
      analysis: {
        category: analysis.category,
        urgency: analysis.urgency,
        reasoning: analysis.reasoning,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Smart search failed' });
  }
});

router.post('/ai/optimize-price', async (req, res) => {
  try {
    const { serviceId, vendorId } = req.body;
    const services = await db.listServices({ vendorId: vendorId || undefined });
    const service = serviceId ? services.find((s) => s.id === serviceId) : services[0];
    if (!service) return res.json({ suggestedPrice: 0, marketAvg: 0, savings: 0, reasoning: 'No service data available.' });

    const allPrices = services.filter((s) => s.price > 0 && s.name === service.name).map((s) => Number(s.price));
    const marketAvg = allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : Number(service.price);

    const prompt = `You are a pricing strategist for an automotive marketplace in the UAE.
      Service: ${service.name}
      Current price: AED ${service.price}
      Market average across ${allPrices.length} competitors: AED ${marketAvg}
      Recommend an optimal price. Return ONLY valid JSON:
      { "suggestedPrice": 120, "reasoning": "One sentence justification." }`;

    let suggestedPrice = Math.round(marketAvg * 0.95);
    let reasoning = `Suggested AED ${suggestedPrice} to remain competitive at 5% below market average.`;

    try {
      const raw = await generate(prompt, `Price ${service.name}`);
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
      const result = JSON.parse(cleaned);
      suggestedPrice = Math.round(result.suggestedPrice);
      reasoning = result.reasoning;
    } catch (err) {
      console.warn('[AI] Price optimization LLM failed, using fallback:', err);
    }

    res.json({
      serviceId: service.id,
      suggestedPrice,
      marketAvg: Math.round(marketAvg),
      savings: Math.round(Number(service.price) - suggestedPrice),
      reasoning,
    });
  } catch (error) {
    res.status(500).json({ message: 'Price optimization failed' });
  }
});

router.post('/ai/identify-part', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ message: 'image and mimeType required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        name: 'Brake Pad',
        confidence: 0.87,
        oem: 'BP-4591-OEM',
        condition: 'Worn',
        vulnerability: 'Brake pad thickness below 3mm — immediate replacement recommended.',
        keywords: ['brake', 'pad', 'friction', 'disc'],
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an automotive parts expert. Analyze this image and identify the car part.
      Return ONLY valid JSON with this exact shape:
      {
        "name": "Part name (e.g. Brake Pad)",
        "confidence": 0.95,
        "oem": "OEM part number if visible, else 'Unknown'",
        "condition": "Good | Worn | Damaged | Needs Replacement",
        "vulnerability": "Short description of risk if worn/damaged, else null",
        "keywords": ["keyword1", "keyword2"]
      }`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: image,
            mimeType: mimeType
          }
        },
        prompt
      ]
    });

    const raw = (result.text || '').trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error) {
    console.error('[AI] identify-part error:', error);
    res.status(500).json({ message: 'Part identification failed' });
  }
});

router.post('/ai/predict-maintenance', async (req, res) => {
  try {
    const { make, model, year, mileage, lastServiceDate, lastServiceType } = req.body;
    if (!make || !model || !year || !mileage) {
      return res.status(400).json({ message: 'make, model, year, mileage required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
      throw new Error('Groq not configured');
    }

    const { generate } = await import('./lib/groq.js');

    const prompt = `You are a senior automotive maintenance advisor.
      Vehicle: ${year} ${make} ${model}
      Current mileage: ${mileage} km
      Last service: ${lastServiceType || 'None'} on ${lastServiceDate || 'Unknown'}

      Based on this vehicle's typical maintenance schedule and mileage, provide a maintenance prediction.
      Return ONLY valid JSON with this exact shape:
      {
        "engineHealthScore": 85,
        "urgency": "low | medium | high",
        "expertAdvice": "One sentence expert recommendation.",
        "vulnerabilityAlert": "Critical warning if any, else null",
        "predictedNeeds": [
          { "item": "Oil Change", "reason": "Due at 25,000 km", "milesRemaining": 500 },
          { "item": "Brake Inspection", "reason": "Brake pads typically last 30,000 km", "milesRemaining": 5500 }
        ]
      }`;

    const raw = await generate(prompt, `Analyze ${make} ${model} ${year} at ${mileage}km`);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    const parsed = JSON.parse(cleaned);

    parsed.engineHealthScore = Math.min(100, Math.max(0, parsed.engineHealthScore || 80));

    res.json(parsed);
  } catch (error) {
    console.warn('[AI] predict-maintenance falling back to mock:', error);
    res.json({
      engineHealthScore: 78,
      urgency: 'medium',
      expertAdvice: 'Your vehicle is approaching its 25,000 km service interval. Schedule a general service soon.',
      vulnerabilityAlert: null,
      predictedNeeds: [
        { item: 'Oil & Filter Change', reason: 'Due every 10,000 km', milesRemaining: 500 },
        { item: 'Air Filter', reason: 'Replace every 20,000 km', milesRemaining: 2000 },
      ],
    });
  }
});

// --- Auth ---
router.post('/auth/register', async (req, res) => {
  try {
    const { email: rawEmail, password, role, businessName, fullName, phone } = req.body;
    if (!rawEmail || !password || !role) return res.status(400).json({ message: 'Missing email, password, or role' });
    if (!['customer', 'vendor', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    
    const email = rawEmail.toLowerCase().trim();
    const existing = await db.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = {
      id: db.generateId('user'), email, role, full_name: fullName || businessName || '', phone: phone || '',
      password_hash: await bcrypt.hash(password, 10), status: 'active' as const, created_at: now(), updated_at: now(),
    };
    await db.createUser(user);

    let vendor = null;
    if (role === 'vendor') {
      vendor = {
        id: db.generateId('vendor'), user_id: user.id, business_name: businessName || fullName || email.split('@')[0],
        email, phone: phone || '', rating: 0, verified: false, active: true, location: '', description: '',
        created_at: now(), updated_at: now(),
      };
      await db.createVendor(vendor);
    }

    res.status(201).json({ message: 'Registered', token: issueToken(user), user: safeUser(user), vendor });
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email: rawEmail, password, role } = req.body;
    if (!rawEmail || !password) return res.status(400).json({ message: 'Missing email or password' });
    
    const email = rawEmail.toLowerCase().trim();
    console.log(`[Auth] Login attempt: ${email} (role: ${role || 'any'})`);
    
    const user = await db.findUserByEmail(email, role as Role | undefined);
    if (!user) {
      console.log(`[Auth] User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log(`[Auth] Invalid password for: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const vendor = user.role === 'vendor' ? await db.findVendorByUserId(user.id) : null;
    console.log(`[Auth] Login successful: ${email} (${user.role})`);
    
    res.json({ message: 'Authenticated', token: issueToken(user), user: safeUser(user), vendor });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(401).json({ message: 'Invalid credentials' });
    const user = await db.findUserByEmail(email, 'admin');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Authenticated', token: issueToken(user), user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/auth/logout', (_req, res) => res.json({ message: 'Logged out' }));

router.post('/auth/forgot-password', async (req, res) => {
  const { email, role = 'customer' } = req.body;
  const user = await db.findUserByEmail(email, role as Role);
  if (!user) return res.json({ message: `If ${email} exists in our system, password reset instructions were sent.` });
  const token = db.generateId('reset');
  db.addResetToken(token, email, role);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }
  try {
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    console.error('[Mail] Failed to send password reset email:', err);
  }
  res.json({
    message: `If ${email} exists in our system, password reset instructions were sent.`,
  });
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, email, password, role = 'customer' } = req.body;
    const entry = db.findResetToken(token, email, role as string);
    if (!entry) return res.status(400).json({ message: 'Invalid or expired reset token' });
    const user = await db.findUserByEmail(entry.email, entry.role as Role);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await db.updateUser(user.id, { password_hash: await bcrypt.hash(password, 10) });
    db.deleteResetToken(token);
    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed' });
  }
});

router.get('/auth/me', async (req, res) => {
  const user = await userFromToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const vendor = user.role === 'vendor' ? await db.findVendorByUserId(user.id) : null;
  res.json({ user: safeUser(user), vendor });
});

// --- Vendors ---
router.get('/vendors', async (_req, res) => {
  const vendors = await db.listVendors();
  res.json(vendors);
});

// --- Services ---
router.get('/services', async (req, res) => {
  const query = String(req.query.query || req.query.serviceType || '').trim();
  const vendorId = String(req.query.vendorId || '');
  const garageId = String(req.query.garageId || '');
  let services = await db.listServices({ vendorId: vendorId || undefined, garageId: garageId || undefined });
  if (query) services = services.filter((s) => matches(s, query));
  const decorated = await Promise.all(services.map(decorateService));
  res.json(decorated);
});

router.post('/services', requireRole('vendor', 'admin'), async (req: any, res) => {
  try {
    const vendorId = await resolveVendorId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Service name is required' });
    const garage = await db.listGarages({ vendorId });
    const catSlug = slugify(req.body.category || '');
    const cat = catSlug ? await db.findCategoryBySlug(catSlug) : null;
    const service = {
      id: db.generateId('svc'), vendor_id: vendorId, garage_id: req.body.garageId || garage[0]?.id || '',
      category_id: req.body.categoryId || cat?.id || '', name, description: req.body.description || '',
      price: Number(req.body.price || 0), duration_minutes: Number(req.body.durationMinutes || req.body.duration || 60),
      active: req.body.active !== false && req.body.status !== 'inactive', created_at: now(), updated_at: now(),
    };
    const created = await db.createService(service);
    await cacheDel(`services::${vendorId}:`);
    res.status(201).json(await decorateService(created));
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service' });
  }
});

router.patch('/services/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const service = await db.findServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  const catSlug = slugify(req.body.category || '');
  const cat = catSlug ? await db.findCategoryBySlug(catSlug) : null;
  const updated = await db.updateService(req.params.id, {
    name: req.body.name, description: req.body.description,
    price: req.body.price === undefined ? undefined : Number(req.body.price),
    duration_minutes: req.body.durationMinutes || req.body.duration || undefined,
    active: req.body.status === 'inactive' ? false : req.body.status === 'active' ? true : req.body.active ?? undefined,
    category_id: req.body.categoryId || cat?.id || undefined,
  });
  if (updated) await cacheDel(`services::${service.vendor_id}:`);
  res.json(updated ? await decorateService(updated) : { message: 'Service not found' });
});

router.delete('/services/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const service = await db.findServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  const removed = await db.deleteService(req.params.id);
  if (removed) await cacheDel(`services::${service.vendor_id}:`);
  res.json(removed ? await decorateService(removed) : {});
});

// --- Garages ---
router.get('/garages', async (req, res) => {
  const query = String(req.query.query || req.query.location || req.query.q || '').trim();
  const vendorId = String(req.query.vendorId || '').trim();
  const garages = await db.listGarages({
    query: query || undefined,
    vendorId: vendorId || undefined
  });
  res.json(garages);
});

router.get('/garages/:id', async (req, res) => {
  const garage = await db.findGarageById(req.params.id);
  if (!garage) return res.status(404).json({ message: 'Garage not found' });
  const rawServices = await db.listServices({ garageId: garage.id });
  const services = await Promise.all(rawServices.map(decorateService));
  const reviews = await db.listReviews({ garageId: garage.id });

  // Compute trust metrics from real data
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const trustMetrics = [
    { label: 'Customer Rating', score: Math.min(100, Math.max(0, Math.round(avgRating * 20))) }, // 5-star → 100%
    { label: 'Booking Completion Rate', score: garage.trustScore || 90 },
    { label: 'Response Time Score', score: 88 },
    { label: 'Price Accuracy', score: 94 },
  ];

  // Build smart bundles from service combinations
  const maintenanceServices = services.filter(s => s.categoryId === 'cat-1' || s.category_id === 'cat-1');
  const smartBundles = maintenanceServices.length >= 2 ? [{
    id: 'bundle-1',
    name: 'Complete Maintenance Kit',
    tag: 'Best Value',
    services: maintenanceServices.slice(0, 3).map(s => s.name),
    price: Math.round(maintenanceServices.slice(0, 3).reduce((sum, s) => sum + Number(s.price), 0) * 0.85),
    originalPrice: maintenanceServices.slice(0, 3).reduce((sum, s) => sum + Number(s.price), 0),
    savings: Math.round(maintenanceServices.slice(0, 3).reduce((sum, s) => sum + Number(s.price), 0) * 0.15),
  }] : [];

  res.json({ ...garage, services, trustMetrics, smartBundles, images: (garage as any).images || [] });
});

router.post('/garages', requireRole('vendor', 'admin'), async (req: any, res) => {
  try {
    const vendorId = await resolveVendorId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Garage name is required' });
    const garage = {
      id: db.generateId('garage'), vendor_id: vendorId, name,
      location: req.body.location || '', city: req.body.city || '',
      lat: req.body.lat ? Number(req.body.lat) : undefined,
      lng: req.body.lng ? Number(req.body.lng) : undefined,
      phone: req.body.phone || '', opening_hours: req.body.openingHours || '',
      rating: 0, reviews: 0, active: true,
      description: req.body.description || '',
      created_at: now(), updated_at: now(),
    };
    const created = await db.createGarage(garage);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: 'Failed to create garage' });
  }
});

router.patch('/garages/:id', requireRole('vendor', 'admin'), async (req, res) => {
  try {
    const updated = await db.updateGarage(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Garage not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update garage' });
  }
});

// --- Availability ---
router.get('/availability/slots', async (req, res) => {
  const vendorId = String(req.query.vendorId || '');
  const date = String(req.query.date || new Date().toDateString());
  if (!vendorId) return res.status(400).json({ message: 'vendorId is required' });
  const slots = await buildAvailability(vendorId, date);
  res.json({ vendorId, date, slots });
});

// --- Bookings ---
router.get('/bookings', async (req, res) => {
  const vendorId = String(req.query.vendorId || '');
  const customerEmail = String(req.query.customerEmail || req.query.email || '');
  const bookings = await db.listBookings({
    vendorId: vendorId || undefined,
    customerEmail: customerEmail || undefined,
  });
  res.json(bookings);
});

router.post('/bookings', async (req, res) => {
  try {
    const { vendorId = 'vendor-1', garageId = 'garage-1', service = 'General Service', date, time, price = 0, email, phone, customer, carModel, carYear, license } = req.body;
    if (!date || !time || !email) return res.status(400).json({ message: 'Missing booking date, time, or email' });

    let customerId: string | null = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { sub?: string; id?: string };
        customerId = payload.sub || payload.id || null;
      } catch { /* ignore */ }
    }
    if (!customerId) {
      const user = await db.findUserByEmail(email, 'customer');
      if (user) customerId = user.id;
    }

    const booking = {
      id: db.generateId('BK'), vendor_id: vendorId, garage_id: garageId, service_id: req.body.serviceId || '',
      customer_id: customerId,
      customer_email: email, phone: phone || '',
      customer_name: customer || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || 'Customer',
      vehicle: carYear && carModel ? `${carModel} (${carYear})` : req.body.car || 'Vehicle',
      license: license || '', scheduled_date: date, scheduled_time: time, status: 'Pending',
      amount: Number(price || 0), created_at: now(), updated_at: now(),
    };
    const created = await db.createBooking(booking);
    await clearBookingCache(created);
    await db.createNotification({
      id: db.generateId('notif'), user_id: email, type: 'booking_created', title: 'Booking created',
      body: `Booking ${created.id} is now pending.`, is_read: false, created_at: now(), metadata: { bookingId: created.id } as any,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

router.get('/bookings/:id', async (req, res) => {
  const booking = await db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

router.patch('/bookings/:id', async (req, res) => {
  const booking = await db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  const updated = await db.updateBooking(req.params.id, { ...req.body });
  if (updated) await clearBookingCache(updated);
  res.json(updated);
});

router.post('/bookings/:id/cancel', async (req, res) => {
  const booking = await db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  await db.updateBooking(req.params.id, { status: 'Cancelled', cancellation_reason: req.body.reason || '' });
  await clearBookingCache(booking);
  const payment = await db.findPaymentByBookingId(booking.id);
  let refund = null;
  if (payment && payment.status !== 'refunded') {
    try {
      if (payment.stripe_payment_intent_id) {
        await createRefund(payment.stripe_payment_intent_id, payment.amount);
      }
      await db.updatePaymentByBookingId(booking.id, { status: 'refunded' as any, refund_amount: payment.amount });
      refund = { amount: payment.amount, status: 'refunded' };
    } catch {
      await db.updatePaymentByBookingId(booking.id, { status: 'refunded' as any, refund_amount: payment.amount });
      refund = { amount: payment.amount, status: 'refunded' };
    }
  }
  const cancelled = await db.findBookingById(req.params.id);
  res.json({ message: 'Booking cancelled', booking: cancelled, refund });
});

router.post('/bookings/:id/reschedule', async (req, res) => {
  const booking = await db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  await db.updateBooking(req.params.id, {
    scheduled_date: req.body.date || booking.scheduled_date,
    scheduled_time: req.body.time || booking.scheduled_time,
    status: req.body.status || 'Confirmed',
  });
  await clearBookingCache(booking);
  const updated = await db.findBookingById(req.params.id);
  res.json({ message: 'Booking rescheduled', booking: updated });
});

// --- Payments ---
router.get('/payments/config', (_req, res) => {
  res.json(getPaymentConfig());
});

router.post('/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'aed', bookingId, metadata = {} } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const pi = await createPaymentIntent(amount, currency, { ...metadata, bookingId: bookingId || '' });
    if (bookingId) {
      const existing = await db.findPaymentByBookingId(bookingId);
      if (!existing) {
        await db.createPayment({
          id: db.generateId('pay'), booking_id: bookingId, amount, currency: currency.toUpperCase(),
          status: 'pending', refund_amount: 0, stripe_payment_intent_id: pi.id, created_at: now(), updated_at: now(),
        });
      } else {
        await db.updatePaymentByBookingId(bookingId, { stripe_payment_intent_id: pi.id, status: 'pending' as any });
      }
    }
    res.json(pi);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

router.post('/payments/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'paymentIntentId is required' });
    const result = await confirmPaymentIntent(paymentIntentId);
    if (result.status === 'succeeded') {
      const payments = await db.listPayments();
      const payment = payments.find((p) => p.stripe_payment_intent_id === paymentIntentId);
      if (payment) {
        await db.updatePaymentByBookingId(payment.booking_id, { status: 'paid' as any });
        if (payment.booking_id) {
          await db.updateBooking(payment.booking_id, { status: 'Confirmed' });
        }
      }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

router.post('/payments/webhook', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    if (sig) {
      event = await constructWebhookEvent(JSON.stringify(req.body), sig);
    } else {
      event = req.body;
    }
    if (event.type === 'payment_intent.succeeded' || event.type === 'checkout.session.completed') {
      const pi = event.data.object;
      const bookingId = pi.metadata?.bookingId;
      if (bookingId) {
        await db.updateBooking(bookingId, { status: 'Confirmed' });
        await db.updatePaymentByBookingId(bookingId, { status: 'paid' as any, stripe_payment_intent_id: pi.id });
      }
    }
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const bookingId = pi.metadata?.bookingId;
      if (bookingId) {
        await db.updateBooking(bookingId, { status: 'Payment Failed' });
        await db.updatePaymentByBookingId(bookingId, { status: 'failed' as any });
      }
    }
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: 'Webhook error' });
  }
});

// --- Messages ---
router.get('/messages', (_req, res) => {
  res.json({ chats: db.getChats(), messages: db.getMessages() });
});

router.post('/messages', (req, res) => {
  const { threadId, sender, text } = req.body;
  if (!threadId || !sender || !text) return res.status(400).json({ message: 'Missing fields' });
  const msg = { id: Date.now(), thread_id: Number(threadId), text, sender, time: new Date().toLocaleTimeString() };
  db.createMessage(msg);
  res.status(201).json(msg);
});

// --- Vendor Stats ---
router.get('/vendor/stats', async (req, res) => {
  const vendorId = String(req.query.vendorId || 'vendor-1');
  const vendorBookings = await db.listBookings({ vendorId });
  const vendor = await db.findVendorById(vendorId);
  res.json({
    totalBookings: vendorBookings.length,
    monthlyRevenue: vendorBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
    avgRating: vendor?.rating ?? 4.7,
    pending: vendorBookings.filter((b) => b.status === 'Pending').length,
    recentBookings: vendorBookings.slice(-5).reverse(),
  });
});

// --- Notifications ---
router.get('/notifications/stream', async (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendNotification = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const notifications = await db.listNotifications({ userId, unreadOnly: true });
    sendNotification({ notifications });
  } catch (err) {
    console.error('[SSE] Error fetching initial notifications:', err);
  }

  const interval = setInterval(async () => {
    try {
      const notifications = await db.listNotifications({ userId, unreadOnly: true });
      sendNotification({ notifications });
    } catch (err) {
      console.error('[SSE] Error polling notifications:', err);
    }
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

router.get('/notifications', async (req, res) => {
  const userId = String(req.query.userId || '');
  const unreadOnly = String(req.query.unreadOnly || '') === 'true';
  const result = await db.listNotifications({ userId: userId || undefined, unreadOnly });
  res.json(result);
});

router.patch('/notifications/:id/read', async (req, res) => {
  const notification = await db.markNotificationRead(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

router.post('/notifications/read-all', async (req, res) => {
  try {
    const userId = String(req.body.userId || req.query.userId || '');
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const unread = await db.listNotifications({ userId, unreadOnly: true });
    for (const n of unread) {
      await db.markNotificationRead(n.id);
    }
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

// --- Categories ---
router.get('/categories', async (_req, res) => {
  const cats = await db.listCategories();
  const result = await Promise.all(cats.map(async (cat) => {
    const services = await db.listServices();
    return {
      ...cat, services: services.filter((s) => s.category_id === cat.id).length,
      status: cat.active === false ? 'inactive' : 'active',
    };
  }));
  res.json(result);
});

router.post('/categories', requireRole('admin'), async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Category name is required' });
  const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
  const existing = await db.findCategoryBySlug(slug);
  if (existing) return res.status(409).json({ message: 'Category already exists' });
  const cat = {
    id: db.generateId('cat'), name, slug, description: req.body.description || '',
    active: req.body.active !== false && req.body.status !== 'inactive', created_at: now(), updated_at: now(),
  };
  await db.createCategory(cat);
  res.status(201).json({ ...cat, services: 0, status: cat.active ? 'active' : 'inactive' });
});

router.patch('/categories/:id', requireRole('admin'), async (req, res) => {
  const cat = await db.findCategoryById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  const nextSlug = req.body.slug ? slugify(req.body.slug) : undefined;
  if (nextSlug) {
    const dup = await db.findCategoryBySlug(nextSlug);
    if (dup && dup.id !== cat.id) return res.status(409).json({ message: 'Category slug already exists' });
  }
  const updated = await db.updateCategory(req.params.id, {
    name: req.body.name, slug: nextSlug, description: req.body.description,
    active: req.body.status === 'inactive' ? false : req.body.status === 'active' ? true : req.body.active ?? undefined,
  });
  if (updated) {
    const services = await db.listServices();
    res.json({ ...updated, services: services.filter((s) => s.category_id === updated.id).length, status: updated.active ? 'active' : 'inactive' });
  }
});

router.delete('/categories/:id', requireRole('admin'), async (req, res) => {
  const removed = await db.deleteCategory(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Category not found' });
  res.json(removed);
});

// --- Reviews ---
router.get('/reviews', async (req, res) => {
  const garageId = String(req.query.garageId || '');
  const vendorId = String(req.query.vendorId || '');
  const result = await db.listReviews({ garageId: garageId || undefined, vendorId: vendorId || undefined });
  res.json(result);
});

router.post('/reviews', async (req, res) => {
  const review = {
    id: db.generateId('rev'), garage_id: req.body.garageId || '', user_name: req.body.user || 'Anonymous',
    vendor_name: req.body.vendor || 'Unknown Vendor', rating: Number(req.body.rating || 5),
    comment: req.body.comment || '', status: 'published', created_at: now(), updated_at: now(),
  };
  const created = await db.createReview(review);
  res.status(201).json(created);
});

router.patch('/reviews/:id/response', requireRole('vendor', 'admin'), async (req, res) => {
  const updated = await db.updateReview(req.params.id, { vendor_response: req.body.response || '' });
  if (!updated) return res.status(404).json({ message: 'Review not found' });
  res.json(updated);
});

// --- Wishlist ---
router.get('/wishlist', async (req, res) => {
  const customerEmail = String(req.query.customerEmail || '');
  res.json(await db.listWishlist(customerEmail));
});

router.post('/wishlist', async (req, res) => {
  const entry = { id: db.generateId('wish'), customer_email: req.body.customerEmail, garage_id: req.body.garageId, created_at: now() };
  res.status(201).json(await db.createWishlist(entry));
});

router.delete('/wishlist', async (req, res) => {
  const customerEmail = String(req.query.customerEmail || req.body.customerEmail || '');
  const garageId = String(req.query.garageId || req.body.garageId || '');
  const removed = await db.deleteWishlist(customerEmail, garageId);
  if (!removed) return res.status(404).json({ message: 'Wishlist item not found' });
  res.json(removed);
});

// --- Customer Routes ---
router.get('/customer/bookings', requireRole('customer', 'admin'), async (req: any, res) => {
  const userId = req.user?.id;
  const email = req.user?.email || String(req.query.customerEmail || '').trim();

  // Try to find bookings by customerId first
  let bookings: any[] = [];
  if (userId) {
    bookings = await db.listBookings({ customerId: userId });
  }

  // If no bookings found by customerId, fallback to searching by email
  if (bookings.length === 0 && email) {
    bookings = await db.listBookings({ customerEmail: email });
    
    // Backfill customer_id for bookings with matching email
    if (userId && bookings.length > 0) {
      for (const b of bookings) {
        if (!b.customer_id) {
          try {
            await db.updateBooking(b.id, { customer_id: userId });
            b.customer_id = userId; // update local object reference
          } catch (err) {
            console.error(`Failed to backfill customer_id for booking ${b.id}:`, err);
          }
        }
      }
    }
  }

  // Enrich bookings with garage name, location, city, service name, and car/vehicle info
  const garageCache = new Map<string, any>();
  const serviceCache = new Map<string, any>();

  const enriched = await Promise.all(
    bookings.map(async (b) => {
      let garageName = 'Unknown Garage';
      let location = '';
      let city = '';
      if (b.garage_id) {
        if (!garageCache.has(b.garage_id)) {
          const g = await db.findGarageById(b.garage_id);
          garageCache.set(b.garage_id, g);
        }
        const g = garageCache.get(b.garage_id);
        if (g) {
          garageName = g.name;
          location = g.location;
          city = g.city || '';
        }
      }

      let serviceName = 'General Service';
      if (b.service_id) {
        if (!serviceCache.has(b.service_id)) {
          const s = await db.findServiceById(b.service_id);
          serviceCache.set(b.service_id, s);
        }
        const s = serviceCache.get(b.service_id);
        if (s) {
          serviceName = s.name;
        }
      }

      return {
        ...b,
        garage: garageName,
        location,
        city,
        service: serviceName,
        car: b.vehicle || 'Vehicle',
      };
    })
  );

  res.json(enriched);
});

router.get('/customer/profile', async (req, res) => {
  const email = String(req.query.email || '');
  const user = await db.findUserByEmail(email, 'customer');
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  res.json({ ...safeUser(user), wishlist: await db.listWishlist(email) });
});

router.patch('/customer/profile', async (req, res) => {
  const email = String(req.body.email || '');
  const user = await db.findUserByEmail(email, 'customer');
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  await db.updateUser(user.id, { full_name: req.body.fullName || req.body.full_name, phone: req.body.phone });
  const updated = await db.findUserById(user.id);
  res.json({ message: 'Profile updated', user: safeUser(updated) });
});

router.post('/customer/bookings/:id/favorite', requireRole('customer', 'admin'), async (req, res) => {
  const booking = await db.findBookingById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  await db.updateBooking(req.params.id, { favorite: true as any });
  res.json(await db.findBookingById(req.params.id));
});

// --- Vehicles ---
router.get('/vehicles', requireRole('customer', 'admin'), async (req: any, res) => {
  try {
    const userId = req.user.id;
    const list = await db.listVehicles(userId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

router.post('/vehicles', requireRole('customer'), async (req: any, res) => {
  try {
    const { make, model, year, mileage, vin, color, fuelType } = req.body;
    if (!make || !model || !year) {
      return res.status(400).json({ message: 'Make, model, and year are required' });
    }
    const yearNum = Number(year);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: 'Enter a valid year (1990-present)' });
    }

    const vehicle = {
      id: db.generateId('veh'),
      user_id: req.user.id,
      make,
      model,
      year: yearNum,
      vin: vin || '',
      mileage: Number(mileage || 0),
      color: color || '',
      fuel_type: fuelType || 'Petrol',
      status: 'active',
      created_at: now(),
      updated_at: now(),
    };
    const created = await db.createVehicle(vehicle);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create vehicle' });
  }
});

router.patch('/vehicles/:id', requireRole('customer', 'admin'), async (req: any, res) => {
  try {
    const updated = await db.updateVehicle(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vehicle' });
  }
});

router.delete('/vehicles/:id', requireRole('customer', 'admin'), async (req: any, res) => {
  try {
    const success = await db.deleteVehicle(req.params.id);
    if (!success) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vehicle' });
  }
});

router.get('/vehicles/decode-vin/:vin', async (req, res) => {
  try {
    const vin = String(req.params.vin || '').toUpperCase().trim();
    if (vin.length !== 17) {
      return res.status(400).json({ message: 'VIN must be exactly 17 characters' });
    }

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );
    if (!response.ok) {
      return res.status(502).json({ message: 'External VIN decoder service failed' });
    }

    const data = await response.json();
    const result = data.Results?.[0];
    if (!result || result.ErrorCode !== '0') {
      return res.status(422).json({ message: result?.ErrorText || 'Invalid VIN' });
    }

    res.json({
      make: result.Make || '',
      model: result.Model || '',
      year: result.ModelYear ? Number(result.ModelYear) : null,
      trim: result.Trim || '',
      fuelType: result.FuelTypePrimary || '',
      bodyClass: result.BodyClass || '',
      driveType: result.DriveType || '',
    });
  } catch (error) {
    console.error('[VIN] Decode error:', error);
    res.status(500).json({ message: 'VIN decode failed' });
  }
});

// --- Vendor Routes ---
router.get('/vendor/profile', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const vendor = req.user?.role === 'vendor' ? await db.findVendorByUserId(req.user.id) : await db.findVendorById(vendorId);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json(vendor);
});

router.patch('/vendor/profile', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const vendor = req.user?.role === 'vendor' ? await db.findVendorByUserId(req.user.id) : await db.findVendorById(vendorId);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  const updated = await db.updateVendor(vendor.id, {
    business_name: req.body.businessName || req.body.business_name,
    phone: req.body.phone, location: req.body.location, description: req.body.description,
  });
  res.json(updated);
});

router.get('/vendor/bookings', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  res.json(await db.listBookings({ vendorId }));
});

router.get('/vendor/calendar', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const date = String(req.query.date || '');
  const data = await db.listBookings({ vendorId, date: date || undefined });
  res.json({
    vendorId, date, bookings: data,
    availability: await buildAvailability(vendorId, date || new Date().toDateString()),
  });
});

router.get('/vendor/earnings', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const vendorBookings = await db.listBookings({ vendorId });
  const revenue = vendorBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const allPayments = await db.listPayments();
  const paid = allPayments.filter((p) => vendorBookings.some((b) => b.id === p.booking_id));
  res.json({ vendorId, revenue, paidPayments: paid, bookings: vendorBookings });
});

router.get('/vendor/services', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const services = await db.listServices({ vendorId });
  res.json(await Promise.all(services.map(decorateService)));
});

router.post('/vendor/services', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Service name is required' });
  const garage = await db.listGarages({ vendorId });
  const catSlug = slugify(req.body.category || '');
  const cat = catSlug ? await db.findCategoryBySlug(catSlug) : null;
  const service = {
    id: db.generateId('svc'), vendor_id: vendorId, garage_id: req.body.garageId || garage[0]?.id || '',
    category_id: req.body.categoryId || cat?.id || '', name, description: req.body.description || '',
    price: Number(req.body.price || 0), duration_minutes: Number(req.body.durationMinutes || req.body.duration || 60),
    active: req.body.active !== false && req.body.status !== 'inactive', created_at: now(), updated_at: now(),
  };
  const created = await db.createService(service);
  res.status(201).json(await decorateService(created));
});

router.patch('/vendor/services/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const service = await db.findServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  const catSlug = slugify(req.body.category || '');
  const cat = catSlug ? await db.findCategoryBySlug(catSlug) : null;
  const updated = await db.updateService(req.params.id, {
    name: req.body.name, description: req.body.description,
    price: req.body.price === undefined ? undefined : Number(req.body.price),
    duration_minutes: req.body.durationMinutes || req.body.duration || undefined,
    active: req.body.status === 'inactive' ? false : req.body.status === 'active' ? true : req.body.active ?? undefined,
    category_id: req.body.categoryId || cat?.id || undefined,
  });
  res.json(updated ? await decorateService(updated) : { message: 'Service not found' });
});

router.delete('/vendor/services/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const service = await db.findServiceById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  const removed = await db.deleteService(req.params.id);
  res.json(removed ? await decorateService(removed) : {});
});

router.get('/vendor/staff', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  res.json(await db.listStaff(vendorId));
});

router.post('/vendor/staff', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const entry = {
    id: db.generateId('staff'), vendor_id: vendorId, name: req.body.name || 'Staff',
    role: req.body.role, email: req.body.email, phone: req.body.phone,
    active: req.body.active !== false, created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createStaff(entry));
});

router.patch('/vendor/staff/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const updated = await db.updateStaff(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Staff member not found' });
  res.json(updated);
});

router.delete('/vendor/staff/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const removed = await db.deleteStaff(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Staff member not found' });
  res.json(removed);
});

router.get('/vendor/promotions', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  res.json(await db.listPromotions(vendorId));
});

router.post('/vendor/promotions', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const entry = {
    id: db.generateId('promo'), vendor_id: vendorId, title: req.body.title || 'Promotion',
    description: req.body.description, discount_type: req.body.discountType || req.body.discount_type,
    discount_value: Number(req.body.discountValue || req.body.discount_value || 0),
    status: req.body.status || 'active', created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createPromotion(entry));
});

router.patch('/vendor/promotions/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const updated = await db.updatePromotion(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Promotion not found' });
  res.json(updated);
});

router.delete('/vendor/promotions/:id', requireRole('vendor', 'admin'), async (req, res) => {
  const removed = await db.deletePromotion(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Promotion not found' });
  res.json(removed);
});

router.get('/vendor/kyv', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  res.json(await db.listKyvDocuments(vendorId));
});

router.post('/vendor/kyv', requireRole('vendor', 'admin'), async (req: any, res) => {
  const vendorId = await resolveVendorId(req);
  const entry = {
    id: db.generateId('kyv'), vendor_id: vendorId, document_type: req.body.documentType || 'document',
    file_name: req.body.fileName || 'document.pdf', file_url: req.body.fileUrl || '',
    status: 'pending', created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createKyvDocument(entry));
});

// --- Admin Routes ---
router.get('/admin/users', requireRole('admin'), async (_req, res) => {
  const users = await db.listUsers();
  res.json(users.map(safeUser));
});

router.get('/admin/vendors', requireRole('admin'), async (_req, res) => {
  res.json(await db.listVendors());
});

router.get('/admin/bookings', requireRole('admin'), async (_req, res) => {
  res.json(await db.listBookings());
});

router.get('/admin/categories', requireRole('admin'), async (_req, res) => {
  const cats = await db.listCategories();
  const result = await Promise.all(cats.map(async (cat) => {
    const services = await db.listServices();
    return { ...cat, services: services.filter((s) => s.category_id === cat.id).length, status: cat.active ? 'active' : 'inactive' };
  }));
  res.json(result);
});

router.get('/admin/promotions', requireRole('admin'), async (_req, res) => {
  res.json(await db.listPromotions());
});

router.get('/admin/cms', requireRole('admin'), async (_req, res) => {
  res.json(await db.listCmsPages());
});

router.get('/admin/reviews', requireRole('admin'), async (_req, res) => {
  res.json(await db.listReviews());
});

router.get('/admin/support', requireRole('admin'), async (_req, res) => {
  res.json(await db.listSupportTickets());
});

router.get('/admin/payments', requireRole('admin'), async (_req, res) => {
  res.json(await db.listPayments());
});

router.get('/admin/settings', requireRole('admin'), async (_req, res) => {
  res.json(await db.getSettings());
});

router.get('/admin/kyv', requireRole('admin'), async (_req, res) => {
  res.json(await db.listKyvDocuments());
});

router.get('/admin/pricing', requireRole('admin'), async (_req, res) => {
  res.json(await db.listPricingRules());
});

router.post('/admin/users', requireRole('admin'), async (req, res) => {
  try {
    const { email, password = 'password123', role = 'customer', fullName = '', phone = '', status = 'active' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const existing = await db.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const user = {
      id: db.generateId('user'), email, password_hash: await bcrypt.hash(password, 10), role,
      full_name: fullName, phone, status, created_at: now(), updated_at: now(),
    };
    await db.createUser(user);
    res.status(201).json(safeUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.patch('/admin/users/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updateUser(req.params.id, {
    full_name: req.body.fullName || req.body.full_name,
    phone: req.body.phone, status: req.body.status, role: req.body.role,
  });
  if (!updated) return res.status(404).json({ message: 'User not found' });
  res.json(safeUser(updated));
});

router.delete('/admin/users/:id', requireRole('admin'), async (req, res) => {
  const removed = await db.deleteUser(req.params.id);
  if (!removed) return res.status(404).json({ message: 'User not found' });
  res.json(safeUser(removed));
});

router.post('/admin/vendors', requireRole('admin'), async (req, res) => {
  const businessName = String(req.body.businessName || req.body.name || '').trim();
  if (!businessName) return res.status(400).json({ message: 'Business name is required' });
  const vendor = {
    id: db.generateId('vendor'), user_id: req.body.userId || '', business_name: businessName,
    email: req.body.email || '', phone: req.body.phone || '', rating: Number(req.body.rating || 0),
    active: req.body.active !== false, verified: Boolean(req.body.verified),
    location: req.body.location || '', description: req.body.description || '',
    created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createVendor(vendor));
});

router.patch('/admin/vendors/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updateVendor(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Vendor not found' });
  res.json(updated);
});

router.delete('/admin/vendors/:id', requireRole('admin'), async (req, res) => {
  const removed = await db.deleteVendor(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Vendor not found' });
  res.json(removed);
});

router.patch('/admin/settings', requireRole('admin'), async (req, res) => {
  res.json(await db.updateSettings(req.body));
});

router.post('/admin/cms', requireRole('admin'), async (req, res) => {
  const title = String(req.body.title || '').trim();
  if (!title) return res.status(400).json({ message: 'Page title is required' });
  const page = {
    slug: req.body.slug ? slugify(req.body.slug) : slugify(title),
    title, content: req.body.content || '', status: req.body.status || 'draft',
    created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createCmsPage(page));
});

router.patch('/admin/cms/:id', requireRole('admin'), async (req, res) => {
  const slug = req.params.id;
  const existing = await db.findCmsPageBySlug(slug);
  if (!existing) return res.status(404).json({ message: 'Page not found' });
  const updated = await db.updateCmsPage(slug, {
    title: req.body.title, content: req.body.content, status: req.body.status,
    slug: req.body.slug ? slugify(req.body.slug) : undefined,
  });
  res.json(updated);
});

router.delete('/admin/cms/:id', requireRole('admin'), async (req, res) => {
  const slug = req.params.id;
  const removed = await db.deleteCmsPage(slug);
  if (!removed) return res.status(404).json({ message: 'Page not found' });
  res.json(removed);
});

router.post('/admin/support', requireRole('admin'), async (req, res) => {
  const ticket = {
    id: db.generateId('ticket'), subject: req.body.subject || 'Support request',
    message: req.body.message || '', status: req.body.status || 'open',
    priority: req.body.priority || 'medium', user_id: req.body.userId || '',
    assigned_to: req.body.assignedTo || '', created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createSupportTicket(ticket));
});

router.patch('/admin/support/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updateSupportTicket(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Support ticket not found' });
  res.json(updated);
});

router.post('/admin/pricing', requireRole('admin'), async (req, res) => {
  const rule = {
    id: db.generateId('price'), vendor_id: req.body.vendorId || '', category_id: req.body.categoryId || '',
    name: req.body.name || 'Pricing rule', rule_type: req.body.ruleType || req.body.rule_type || 'fixed',
    payload: req.body.payload || {}, active: req.body.active !== false, created_at: now(), updated_at: now(),
  };
  res.status(201).json(await db.createPricingRule(rule));
});

router.patch('/admin/pricing/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updatePricingRule(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Pricing rule not found' });
  res.json(updated);
});

router.delete('/admin/pricing/:id', requireRole('admin'), async (req, res) => {
  const removed = await db.deletePricingRule(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Pricing rule not found' });
  res.json(removed);
});

router.patch('/admin/kyv/:id/approve', requireRole('admin'), async (req, res) => {
  const updated = await db.updateKyvDocument(req.params.id, { status: 'approved', reviewed_by: (req as any).user?.id });
  if (!updated) return res.status(404).json({ message: 'KYV document not found' });
  res.json(updated);
});

router.post('/admin/kyv/:id/reject', requireRole('admin'), async (req, res) => {
  const updated = await db.updateKyvDocument(req.params.id, { status: 'rejected', review_note: req.body.reason || '' });
  if (!updated) return res.status(404).json({ message: 'KYV document not found' });
  res.json(updated);
});

router.get('/admin/analytics', requireRole('admin'), async (_req, res) => {
  const stats = db.getStats();
  res.json({
    ...stats,
    bookingStatusBreakdown: db.getBookingsByStatus(),
    recentBookings: (await db.listBookings()).slice(0, 10),
    topVendors: (await db.listVendors()).slice(0, 10),
  });
});

export default router;
