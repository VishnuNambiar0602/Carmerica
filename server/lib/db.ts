import { getSupabaseClient, isSupabaseConfigured, isSupabaseVerified } from './supabase.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

type Role = 'customer' | 'vendor' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  full_name: string;
  phone?: string;
  status: 'active' | 'disabled';
  email_verified_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VendorRecord {
  id: string;
  user_id: string;
  business_name: string;
  email?: string;
  phone?: string;
  location?: string;
  description?: string;
  rating: number;
  verified: boolean;
  active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GarageRecord {
  id: string;
  vendor_id: string;
  name: string;
  location: string;
  city?: string;
  rating: number;
  reviews: number;
  active: boolean;
  image?: string;
  trustScore?: number;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  vendor_id: string;
  garage_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BookingRecord {
  id: string;
  customer_id?: string | null;
  vendor_id: string;
  garage_id: string;
  service_id?: string;
  customer_email: string;
  customer_name?: string;
  vehicle?: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  amount: number;
  phone?: string;
  license?: string;
  cancellation_reason?: string;
  favorite?: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  refund_amount: number;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ReviewRecord {
  id: string;
  booking_id?: string;
  customer_id?: string;
  vendor_id?: string;
  garage_id: string;
  rating: number;
  comment: string;
  user_name?: string;
  vendor_name?: string;
  status: string;
  vendor_response?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  channel?: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

export interface StaffRecord {
  id: string;
  vendor_id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PromotionRecord {
  id: string;
  vendor_id: string;
  title: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  promo_code?: string;
  usage_limit?: number;
  used_count?: number;
  starts_at?: string;
  ends_at?: string;
  status: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketRecord {
  id: string;
  user_id?: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assigned_to?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CmsPageRecord {
  slug: string;
  title: string;
  content: string;
  status: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PricingRuleRecord {
  id: string;
  vendor_id: string;
  category_id?: string;
  name: string;
  rule_type: string;
  payload: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KyvDocumentRecord {
  id: string;
  vendor_id: string;
  document_type: string;
  file_name: string;
  file_url?: string;
  status: string;
  reviewed_by?: string;
  review_note?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WishlistRecord {
  id: string;
  customer_email: string;
  garage_id: string;
  created_at: string;
}

export interface VehicleRecord {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  color?: string;
  fuel_type?: string;
  last_service_date?: string;
  last_service_type?: string;
  status: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatRecord {
  id: number;
  name: string;
  last_message: string;
  time: string;
  unread: number;
  image?: string;
}

export interface MessageRecord {
  id: number;
  thread_id: number;
  text: string;
  sender: string;
  time: string;
}

export interface SettingsRecord {
  platform_name: string;
  support_email: string;
  booking_lead_minutes: number;
  refund_policy_hours: number;
  updated_at?: string;
}

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

class InMemoryStore {
  users: UserRecord[] = [];
  vendors: VendorRecord[] = [];
  garages: GarageRecord[] = [];
  categories: CategoryRecord[] = [];
  services: ServiceRecord[] = [];
  bookings: BookingRecord[] = [];
  payments: PaymentRecord[] = [];
  reviews: ReviewRecord[] = [];
  notifications: NotificationRecord[] = [];
  staff: StaffRecord[] = [];
  promotions: PromotionRecord[] = [];
  supportTickets: SupportTicketRecord[] = [];
  cmsPages: CmsPageRecord[] = [];
  pricingRules: PricingRuleRecord[] = [];
  kyvDocuments: KyvDocumentRecord[] = [];
  wishlist: WishlistRecord[] = [];
  vehicles: VehicleRecord[] = [];
  chats: ChatRecord[] = [];
  messages: MessageRecord[] = [];
  settings: SettingsRecord = {
    platform_name: 'CarMerica',
    support_email: 'support@carmerica.com',
    booking_lead_minutes: 60,
    refund_policy_hours: 24,
  };
  resetTokens: Array<{ token: string; email: string; role: string; expiresAt: number }> = [];
  verificationTokens: Array<{ token: string; email: string; expiresAt: number }> = [];


  async seedInitialData() {
    const hash = await bcrypt.hash('password123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    this.users.push(
      { id: 'user-1', email: 'john@example.com', password_hash: hash, role: 'customer', full_name: 'John Doe', phone: '+1-555-0101', status: 'active', email_verified_at: now(), created_at: now(), updated_at: now() },
      { id: 'user-2', email: 'partner@garage.com', password_hash: hash, role: 'vendor', full_name: 'Elite Motors Admin', phone: '+1-555-0102', status: 'active', email_verified_at: now(), created_at: now(), updated_at: now() },
      { id: 'user-admin', email: 'admin@carmerica.com', password_hash: adminHash, role: 'admin', full_name: 'System Admin', status: 'active', email_verified_at: now(), created_at: now(), updated_at: now() },
    );

    this.vendors.push(
      { id: 'vendor-1', user_id: 'user-2', business_name: 'Elite Motors', email: 'partner@garage.com', phone: '+1-555-0102', location: 'Downtown, Dubai', description: 'Premium maintenance and repair services.', rating: 4.8, verified: true, active: true, created_at: now(), updated_at: now() },
    );

    this.garages.push(
      { id: 'garage-1', vendor_id: 'vendor-1', name: 'Elite Auto Care', location: '123 Downtown St, Los Angeles, CA 90012', city: 'Dubai', rating: 4.8, reviews: 1240, active: true, image: 'https://picsum.photos/seed/garage1/400/250', trustScore: 98, description: 'Full service garage with AI-assisted pricing.', created_at: now(), updated_at: now() },
      { id: 'garage-2', vendor_id: 'vendor-1', name: 'Precision Mechanics', location: 'Al Quoz, Dubai', city: 'Dubai', rating: 4.6, reviews: 850, active: true, image: 'https://picsum.photos/seed/garage2/400/250', trustScore: 92, description: 'Fast turnaround on common maintenance jobs.', created_at: now(), updated_at: now() },
    );

    this.categories.push(
      { id: 'cat-1', name: 'Maintenance', slug: 'maintenance', active: true, created_at: now(), updated_at: now() },
      { id: 'cat-2', name: 'Repairs', slug: 'repairs', active: true, created_at: now(), updated_at: now() },
      { id: 'cat-3', name: 'Diagnostics', slug: 'diagnostics', active: true, created_at: now(), updated_at: now() },
      { id: 'cat-4', name: 'Electrical', slug: 'electrical', active: true, created_at: now(), updated_at: now() },
    );

    this.services.push(
      { id: 's1', vendor_id: 'vendor-1', garage_id: 'garage-1', category_id: 'cat-2', name: 'Brake Repair', description: 'Replacement of brake pads and inspection of rotors.', price: 120, duration_minutes: 90, active: true, created_at: now(), updated_at: now() },
      { id: 's2', vendor_id: 'vendor-1', garage_id: 'garage-1', category_id: 'cat-1', name: 'Oil Change', description: 'Oil change, filter replacement, and fluid top-up.', price: 49, duration_minutes: 30, active: true, created_at: now(), updated_at: now() },
      { id: 's3', vendor_id: 'vendor-1', garage_id: 'garage-2', category_id: 'cat-1', name: 'General Service', description: 'Multi-point inspection and preventative maintenance.', price: 189, duration_minutes: 120, active: true, created_at: now(), updated_at: now() },
      { id: 's4', vendor_id: 'vendor-1', garage_id: 'garage-2', category_id: 'cat-4', name: 'Battery Replacement', description: 'Battery test and replacement with warranty.', price: 150, duration_minutes: 30, active: true, created_at: now(), updated_at: now() },
    );

    this.bookings.push(
      { id: 'BK-1029', vendor_id: 'vendor-1', garage_id: 'garage-1', service_id: 's2', customer_email: 'john@example.com', customer_name: 'John Doe', vehicle: 'Toyota Camry', scheduled_date: 'Oct 12, 2026', scheduled_time: '10:00 AM', status: 'In Progress', amount: 89, phone: '+1-555-0101', customer_id: 'user-1', created_at: now(), updated_at: now() },
      { id: 'BK-1030', vendor_id: 'vendor-1', garage_id: 'garage-1', service_id: 's1', customer_email: 'sarah@example.com', customer_name: 'Sarah Smith', vehicle: 'Honda Civic', scheduled_date: 'Oct 12, 2026', scheduled_time: '11:30 AM', status: 'Pending', amount: 120, phone: '+1-555-0103', created_at: now(), updated_at: now() },
      { id: 'BK-1031', vendor_id: 'vendor-1', garage_id: 'garage-2', service_id: 's3', customer_email: 'mike@example.com', customer_name: 'Mike Johnson', vehicle: 'Ford F-150', scheduled_date: 'Oct 12, 2026', scheduled_time: '01:00 PM', status: 'Confirmed', amount: 189, phone: '+1-555-0104', created_at: now(), updated_at: now() },
      { id: 'BK-1028', vendor_id: 'vendor-1', garage_id: 'garage-1', service_id: 's3', customer_email: 'robert@example.com', customer_name: 'Robert Brown', vehicle: 'BMW 3 Series', scheduled_date: 'Oct 11, 2026', scheduled_time: '09:00 AM', status: 'Completed', amount: 250, phone: '+1-555-0105', created_at: now(), updated_at: now() },
      { id: 'BK-1032', vendor_id: 'vendor-1', garage_id: 'garage-1', service_id: 's2', customer_email: 'john@example.com', customer_name: 'John Doe', vehicle: 'Toyota Camry', scheduled_date: 'Jun 15, 2026', scheduled_time: '02:00 PM', status: 'Confirmed', amount: 49, phone: '+1-555-0101', customer_id: 'user-1', created_at: now(), updated_at: now() },
      { id: 'BK-1033', vendor_id: 'vendor-1', garage_id: 'garage-2', service_id: 's4', customer_email: 'john@example.com', customer_name: 'John Doe', vehicle: 'Toyota Camry', scheduled_date: 'May 20, 2026', scheduled_time: '09:30 AM', status: 'Completed', amount: 150, phone: '+1-555-0101', customer_id: 'user-1', created_at: now(), updated_at: now() },
    );

    this.reviews.push(
      { id: 'rev-1', garage_id: 'garage-1', rating: 5, comment: 'Excellent service! They finished the oil change in under 30 minutes. Staff was extremely polite.', user_name: 'John Doe', vendor_name: 'Elite Auto Care', status: 'published', created_at: now(), updated_at: now() },
      { id: 'rev-2', garage_id: 'garage-2', rating: 4, comment: 'Good experience overall. General service was thoroughly done, although the queue was a bit long.', user_name: 'Sarah Smith', vendor_name: 'Precision Mechanics', status: 'published', created_at: now(), updated_at: now() },
      { id: 'rev-3', garage_id: 'garage-1', rating: 2, comment: 'The brake service took twice as long as quoted and price was slightly higher. Disappointed.', user_name: 'Mike Johnson', vendor_name: 'Elite Auto Care', status: 'published', created_at: now(), updated_at: now() },
    );

    this.payments.push(
      { id: 'pay-1', booking_id: 'BK-1028', amount: 250, currency: 'AED', status: 'paid', refund_amount: 0, created_at: now(), updated_at: now() },
      { id: 'pay-2', booking_id: 'BK-1033', amount: 150, currency: 'AED', status: 'paid', refund_amount: 0, created_at: now(), updated_at: now() },
    );

    this.promotions.push(
      { id: 'promo-1', vendor_id: 'vendor-1', title: 'AC Summer Deal', description: '10% off AC diagnostics', discount_type: 'percent', discount_value: 10, promo_code: 'SUMMER10', usage_limit: 100, used_count: 5, status: 'active', created_at: now(), updated_at: now() },
      { id: 'promo-2', vendor_id: 'vendor-1', title: 'Winter Shield Offer', description: 'AED 30 discount on brake repair services', discount_type: 'value', discount_value: 30, promo_code: 'WINTER30', usage_limit: 50, used_count: 2, status: 'active', created_at: now(), updated_at: now() },
    );

    this.staff.push(
      { id: 'staff-1', vendor_id: 'vendor-1', name: 'Alex Turner', role: 'Service Advisor', email: 'alex@elite.example', phone: '+1-555-0201', active: true, created_at: now(), updated_at: now() },
      { id: 'staff-2', vendor_id: 'vendor-1', name: 'Maria Santos', role: 'Diagnostic Specialist', email: 'maria@elite.example', phone: '+1-555-0202', active: true, created_at: now(), updated_at: now() },
    );

    this.wishlist.push(
      { id: 'wish-1', customer_email: 'john@example.com', garage_id: 'garage-1', created_at: now() },
      { id: 'wish-2', customer_email: 'john@example.com', garage_id: 'garage-2', created_at: now() },
    );

    this.vehicles.push(
      {
        id: 'veh-1',
        user_id: 'user-1',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        vin: '1T1LL111111111111',
        mileage: 24500,
        color: 'White',
        fuel_type: 'Petrol',
        status: 'active',
        created_at: now(),
        updated_at: now()
      },
      {
        id: 'veh-2',
        user_id: 'user-1',
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        vin: '5YJ3E1EA5NF111111',
        mileage: 18200,
        color: 'Midnight Silver',
        fuel_type: 'Electric',
        status: 'active',
        created_at: now(),
        updated_at: now()
      },
      {
        id: 'veh-3',
        user_id: 'user-1',
        make: 'Ford',
        model: 'Mustang',
        year: 2020,
        vin: '1FA6P8CF8LF111111',
        mileage: 56000,
        color: 'Shadow Black',
        fuel_type: 'Petrol',
        status: 'active',
        created_at: now(),
        updated_at: now()
      }
    );

    this.kyvDocuments.push(
      { id: 'kyv-1', vendor_id: 'vendor-1', document_type: 'trade-license', file_name: 'license.pdf', status: 'approved', created_at: now(), updated_at: now() },
    );

    this.supportTickets.push(
      { id: 'ticket-1', subject: 'Sample ticket', message: 'Customer needs help with a booking.', status: 'open', priority: 'medium', created_at: now(), updated_at: now() },
      { id: 'ticket-2', subject: 'Double payment charge on checkout', message: 'Hi support team, I noticed a duplicate transaction on my credit card when booking an Oil Change today. Please refund one of them.', status: 'open', priority: 'high', created_at: now(), updated_at: now() },
      { id: 'ticket-3', subject: 'Vendor didn\'t confirm my rescheduled date', message: 'I submitted a rescheduling request for booking BK-1032, but it has been pending for over 24 hours. Can you nudge the garage?', status: 'open', priority: 'medium', created_at: now(), updated_at: now() },
      { id: 'ticket-4', subject: 'Smart diagnostics engine accuracy', message: 'I analyzed a photo of my front brake pad and the AI diagnosed it as worn out. But a physical checkup says it is 50% healthy. I want to report this feedback.', status: 'resolved', priority: 'low', created_at: now(), updated_at: now() },
    );

    this.cmsPages.push(
      { slug: 'home', title: 'Home', content: '<h1>Home</h1>', status: 'published', created_at: now(), updated_at: now() },
    );

    this.pricingRules.push(
      { id: 'price-1', vendor_id: 'vendor-1', category_id: 'cat-1', name: 'Weekend demand uplift', rule_type: 'percentage', payload: { percent: 10, days: ['Saturday', 'Sunday'] }, active: true, created_at: now(), updated_at: now() },
    );

    this.chats.push(
      { id: 1, name: 'John Doe', last_message: 'Is my car ready for pickup?', time: '10:30 AM', unread: 2, image: 'https://i.pravatar.cc/150?u=john' },
      { id: 2, name: 'Sarah Smith', last_message: 'Thank you for the quick service!', time: 'Yesterday', unread: 0, image: 'https://i.pravatar.cc/150?u=sarah' },
    );

    this.messages.push(
      { id: 1, thread_id: 1, text: 'Hello! I wanted to check the status of my Toyota Camry.', sender: 'customer', time: '09:15 AM' },
      { id: 2, thread_id: 1, text: "Hi John! We've completed the oil change and the 50-point inspection.", sender: 'vendor', time: '09:30 AM' },
      { id: 3, thread_id: 1, text: "That's great news. Is my car ready for pickup?", sender: 'customer', time: '10:30 AM' },
      { id: 4, thread_id: 2, text: 'Thank you for the great service!', sender: 'customer', time: 'Yesterday' },
    );
  }
}

let store = new InMemoryStore();
let memorySeeded = false;

function ensureMemorySeeded() {
  if (!memorySeeded) {
    store.seedInitialData();
    memorySeeded = true;
  }
}

export interface GarageFilter {
  query?: string;
  vendorId?: string;
  minRating?: number;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface ServiceFilter {
  query?: string;
  vendorId?: string;
  garageId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
}

class Database {
  constructor() {
    this.client = getSupabaseClient();
  }

  private client: SupabaseClient | null;
  private _isSupabase: boolean | null = null;

  get isSupabase(): boolean {
    if (this._isSupabase === null) {
      this._isSupabase = isSupabaseVerified();
      if (!this._isSupabase) ensureMemorySeeded();
    }
    return this._isSupabase;
  }

  refreshSupabaseStatus() {
    this._isSupabase = null;
    this.client = getSupabaseClient();
    void this.isSupabase;
  }

  getClient(): SupabaseClient | null {
    return getSupabaseClient();
  }

  // --- Auth ---
  async findUserByEmail(email: string, role?: Role): Promise<UserRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
        const user = data as UserRecord | null;
        if (user && role && user.role !== role) return null;
        if (user) return user;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        return store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && (!role || u.role === role)) || null;
      }
    }
    return store.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() && (!role || u.role === role)) || null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('users').select('*').eq('id', id).maybeSingle();
        if (data) return data as UserRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        return store.users.find((u) => u.id === id) || null;
      }
    }
    return store.users.find((u) => u.id === id) || null;
  }

  async createUser(user: UserRecord): Promise<UserRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('users').insert(user).select().single();
        if (data) return data as UserRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('users').update(updates).eq('id', id).select().single();
        if (data) return data as UserRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through
      }
    }
    const user = store.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates, { updated_at: now() });
    return user;
  }

  async deleteUser(id: string): Promise<UserRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('users').delete().eq('id', id).select().single();
        if (data) return data as UserRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through
      }
    }
    const index = store.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const [removed] = store.users.splice(index, 1);
    return removed;
  }

  async listUsers(): Promise<UserRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('users').select('*').order('created_at', { ascending: false });
        if (data) return data as UserRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through
      }
    }
    return [...store.users];
  }

  // --- Vendors ---
  async findVendorByUserId(userId: string): Promise<VendorRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vendors').select('*').eq('user_id', userId).maybeSingle();
        if (data) return data as VendorRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.vendors.find((v) => v.user_id === userId) || null;
  }

  async findVendorById(id: string): Promise<VendorRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vendors').select('*').eq('id', id).maybeSingle();
        if (data) return data as VendorRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.vendors.find((v) => v.id === id) || null;
  }

  async createVendor(vendor: VendorRecord): Promise<VendorRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vendors').insert(vendor).select().single();
        if (data) return data as VendorRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.vendors.push(vendor);
    return vendor;
  }

  async updateVendor(id: string, updates: Partial<VendorRecord>): Promise<VendorRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vendors').update(updates).eq('id', id).select().single();
        if (data) return data as VendorRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const vendor = store.vendors.find((v) => v.id === id);
    if (!vendor) return null;
    Object.assign(vendor, updates, { updated_at: now() });
    return vendor;
  }

  async deleteVendor(id: string): Promise<VendorRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vendors').delete().eq('id', id).select().single();
        if (data) return data as VendorRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.vendors.findIndex((v) => v.id === id);
    if (index === -1) return null;
    const [removed] = store.vendors.splice(index, 1);
    return removed;
  }

  async listVendors(): Promise<VendorRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vendors').select('*').order('created_at', { ascending: false });
        if (data) return data as VendorRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return [...store.vendors];
  }

  // --- Garages ---
  async findGarageById(id: string): Promise<GarageRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('garages').select('*').eq('id', id).maybeSingle();
        if (data) return data as GarageRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.garages.find((g) => g.id === id) || null;
  }

  async listGarages(filter?: GarageFilter): Promise<{ data: GarageRecord[]; total: number }> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('garages').select('*', { count: 'exact' });
        if (filter?.vendorId) query = query.eq('vendor_id', filter.vendorId);
        if (filter?.minRating) query = query.gte('rating', filter.minRating);
        if (filter?.city) query = query.eq('city', filter.city);
        if (filter?.query) query = query.or(`name.ilike.%${filter.query}%,location.ilike.%${filter.query}%,city.ilike.%${filter.query}%`);
        query = query.order('created_at', { ascending: false });
        if (filter?.limit !== undefined && filter?.offset !== undefined) {
          query = query.range(filter.offset, filter.offset + filter.limit - 1);
        }
        const { data, count } = await query;
        if (data) return { data: data as GarageRecord[], total: count || data.length };
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    let result = store.garages.filter((g) => g.active !== false);
    if (filter?.vendorId) result = result.filter((g) => g.vendor_id === filter.vendorId);
    if (filter?.minRating) result = result.filter((g) => g.rating >= filter.minRating);
    if (filter?.city) result = result.filter((g) => g.city === filter.city);
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter((g) => [g.name, g.location, g.city, g.description].filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    const total = result.length;
    if (filter?.limit !== undefined && filter?.offset !== undefined) {
      result = result.slice(filter.offset, filter.offset + filter.limit);
    }
    return { data: result, total };
  }

  async createGarage(garage: GarageRecord): Promise<GarageRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('garages').insert(garage).select().single();
        if (data) return data as GarageRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.garages.push(garage);
    return garage;
  }

  async updateGarage(id: string, updates: Partial<GarageRecord>): Promise<GarageRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('garages').update(updates).eq('id', id).select().single();
        if (data) return data as GarageRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    const idx = store.garages.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    store.garages[idx] = { ...store.garages[idx], ...updates, updated_at: new Date().toISOString() };
    return store.garages[idx];
  }

  async deleteGarage(id: string): Promise<boolean> {
    if (this.isSupabase && this.client) {
      try {
        const { error } = await this.client.from('garages').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    const idx = store.garages.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    store.garages.splice(idx, 1);
    return true;
  }

  // --- Categories ---
  async listCategories(): Promise<CategoryRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('categories').select('*').order('name');
        if (data) return data as CategoryRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return [...store.categories];
  }

  async findCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('categories').select('*').eq('slug', slug).maybeSingle();
        if (data) return data as CategoryRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.categories.find((c) => c.slug === slug) || null;
  }

  async findCategoryById(id: string): Promise<CategoryRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('categories').select('*').eq('id', id).maybeSingle();
        if (data) return data as CategoryRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.categories.find((c) => c.id === id) || null;
  }

  async createCategory(category: CategoryRecord): Promise<CategoryRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('categories').insert(category).select().single();
        if (data) return data as CategoryRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.categories.push(category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<CategoryRecord>): Promise<CategoryRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('categories').update(updates).eq('id', id).select().single();
        if (data) return data as CategoryRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const cat = store.categories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, updates, { updated_at: now() });
    return cat;
  }

  async deleteCategory(id: string): Promise<CategoryRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('categories').delete().eq('id', id).select().single();
        if (data) return data as CategoryRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const [removed] = store.categories.splice(index, 1);
    return removed;
  }

  // --- Services ---
  async listServices(filter?: ServiceFilter): Promise<ServiceRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('services').select('*');
        if (filter?.vendorId) query = query.eq('vendor_id', filter.vendorId);
        if (filter?.garageId) query = query.eq('garage_id', filter.garageId);
        if (filter?.categoryId) query = query.eq('category_id', filter.categoryId);
        if (filter?.minPrice !== undefined) query = query.gte('price', filter.minPrice);
        if (filter?.maxPrice !== undefined) query = query.lte('price', filter.maxPrice);
        if (filter?.active !== undefined) query = query.eq('active', filter.active);
        if (filter?.query) query = query.ilike('name', `%${filter.query}%`);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as ServiceRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    let result = store.services.filter((s) => s.active !== false);
    if (filter?.vendorId) result = result.filter((s) => s.vendor_id === filter.vendorId);
    if (filter?.garageId) result = result.filter((s) => s.garage_id === filter.garageId);
    if (filter?.categoryId) result = result.filter((s) => s.category_id === filter.categoryId);
    if (filter?.minPrice !== undefined) result = result.filter((s) => s.price >= filter.minPrice);
    if (filter?.maxPrice !== undefined) result = result.filter((s) => s.price <= filter.maxPrice);
    if (filter?.active !== undefined) result = result.filter((s) => s.active === filter.active);
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter((s) => [s.name, s.description].filter(Boolean).join(' ').toLowerCase().includes(q));
    }
    return result;
  }

  async findServiceById(id: string): Promise<ServiceRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('services').select('*').eq('id', id).maybeSingle();
        if (data) return data as ServiceRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.services.find((s) => s.id === id) || null;
  }

  async createService(service: ServiceRecord): Promise<ServiceRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('services').insert(service).select().single();
        if (data) return data as ServiceRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.services.push(service);
    return service;
  }

  async updateService(id: string, updates: Partial<ServiceRecord>): Promise<ServiceRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('services').update(updates).eq('id', id).select().single();
        if (data) return data as ServiceRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const service = store.services.find((s) => s.id === id);
    if (!service) return null;
    Object.assign(service, updates, { updated_at: now() });
    return service;
  }

  async deleteService(id: string): Promise<ServiceRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('services').delete().eq('id', id).select().single();
        if (data) return data as ServiceRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const [removed] = store.services.splice(index, 1);
    return removed;
  }

  // --- Bookings ---
  async listBookings(filter?: { vendorId?: string; customerEmail?: string; customerId?: string; date?: string }): Promise<BookingRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('bookings').select('*');
        if (filter?.vendorId) query = query.eq('vendor_id', filter.vendorId);
        if (filter?.customerEmail) query = query.eq('customer_email', filter.customerEmail);
        if (filter?.customerId) query = query.eq('customer_id', filter.customerId);
        if (filter?.date) query = query.eq('scheduled_date', filter.date);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as BookingRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    let result = store.bookings;
    if (filter?.vendorId) result = result.filter((b) => b.vendor_id === filter.vendorId);
    if (filter?.customerEmail) result = result.filter((b) => b.customer_email === filter.customerEmail);
    if (filter?.customerId) result = result.filter((b) => b.customer_id === filter.customerId);
    if (filter?.date) result = result.filter((b) => b.scheduled_date === filter.date);
    return result;
  }

  async findBookingById(id: string): Promise<BookingRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('bookings').select('*').eq('id', id).maybeSingle();
        if (data) return data as BookingRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.bookings.find((b) => b.id === id) || null;
  }

  async createBooking(booking: BookingRecord): Promise<BookingRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('bookings').insert(booking).select().single();
        if (data) return data as BookingRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.bookings.unshift(booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<BookingRecord>): Promise<BookingRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('bookings').update(updates).eq('id', id).select().single();
        if (data) return data as BookingRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const booking = store.bookings.find((b) => b.id === id);
    if (!booking) return null;
    Object.assign(booking, updates, { updated_at: now() });
    return booking;
  }

  // --- Payments ---
  async listPayments(filter?: { bookingId?: string }): Promise<PaymentRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('payments').select('*');
        if (filter?.bookingId) query = query.eq('booking_id', filter.bookingId);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as PaymentRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    let result = store.payments;
    if (filter?.bookingId) result = result.filter((p) => p.booking_id === filter.bookingId);
    return result;
  }

  async findPaymentByBookingId(bookingId: string): Promise<PaymentRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('payments').select('*').eq('booking_id', bookingId).maybeSingle();
        if (data) return data as PaymentRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.payments.find((p) => p.booking_id === bookingId) || null;
  }

  async createPayment(payment: PaymentRecord): Promise<PaymentRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('payments').insert(payment).select().single();
        if (data) return data as PaymentRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.payments.push(payment);
    return payment;
  }

  async updatePaymentByBookingId(bookingId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('payments').update(updates).eq('booking_id', bookingId).select().single();
        if (data) return data as PaymentRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const payment = store.payments.find((p) => p.booking_id === bookingId);
    if (!payment) return null;
    Object.assign(payment, updates, { updated_at: now() });
    return payment;
  }

  // --- Reviews ---
  async listReviews(filter?: { garageId?: string; vendorId?: string }): Promise<ReviewRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('reviews').select('*');
        if (filter?.garageId) query = query.eq('garage_id', filter.garageId);
        if (filter?.vendorId) query = query.eq('vendor_id', filter.vendorId);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as ReviewRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    let result = store.reviews;
    if (filter?.garageId) result = result.filter((r) => r.garage_id === filter.garageId);
    if (filter?.vendorId) result = result.filter((r) => r.vendor_id === filter.vendorId);
    return result;
  }

  async createReview(review: ReviewRecord): Promise<ReviewRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('reviews').insert(review).select().single();
        if (data) return data as ReviewRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.reviews.unshift(review);
    return review;
  }

  async updateReview(id: string, updates: Partial<ReviewRecord>): Promise<ReviewRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('reviews').update(updates).eq('id', id).select().single();
        if (data) return data as ReviewRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const review = store.reviews.find((r) => r.id === id);
    if (!review) return null;
    Object.assign(review, updates, { updated_at: now() });
    return review;
  }

  async deleteReview(id: string): Promise<ReviewRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('reviews').delete().eq('id', id).select().single();
        if (data) return data as ReviewRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    const idx = store.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const [removed] = store.reviews.splice(idx, 1);
    return removed;
  }

  // --- Notifications ---
  async listNotifications(filter?: { userId?: string; unreadOnly?: boolean }): Promise<NotificationRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('notifications').select('*');
        if (filter?.userId) query = query.eq('user_id', filter.userId);
        if (filter?.unreadOnly) query = query.eq('is_read', false);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as NotificationRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    let result = store.notifications;
    if (filter?.userId) result = result.filter((n) => n.user_id === filter.userId);
    if (filter?.unreadOnly) result = result.filter((n) => !n.is_read);
    return result;
  }

  async markNotificationRead(id: string): Promise<NotificationRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('notifications').update({ is_read: true, read_at: now() }).eq('id', id).select().single();
        if (data) return data as NotificationRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const notification = store.notifications.find((n) => n.id === id);
    if (!notification) return null;
    notification.is_read = true;
    notification.read_at = now();
    return notification;
  }

  async createNotification(notification: NotificationRecord): Promise<NotificationRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('notifications').insert(notification).select().single();
        if (data) return data as NotificationRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.notifications.unshift(notification);
    return notification;
  }

  // --- Staff ---
  async listStaff(vendorId: string): Promise<StaffRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('staff').select('*').eq('vendor_id', vendorId);
        if (data) return data as StaffRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.staff.filter((s) => s.vendor_id === vendorId);
  }

  async createStaff(entry: StaffRecord): Promise<StaffRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('staff').insert(entry).select().single();
        if (data) return data as StaffRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.staff.push(entry);
    return entry;
  }

  async updateStaff(id: string, updates: Partial<StaffRecord>): Promise<StaffRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('staff').update(updates).eq('id', id).select().single();
        if (data) return data as StaffRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const entry = store.staff.find((s) => s.id === id);
    if (!entry) return null;
    Object.assign(entry, updates, { updated_at: now() });
    return entry;
  }

  async deleteStaff(id: string): Promise<StaffRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('staff').delete().eq('id', id).select().single();
        if (data) return data as StaffRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.staff.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const [removed] = store.staff.splice(index, 1);
    return removed;
  }

  // --- Promotions ---
  async listPromotions(vendorId?: string): Promise<PromotionRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('promotions').select('*');
        if (vendorId) query = query.eq('vendor_id', vendorId);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as PromotionRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    let result = store.promotions;
    if (vendorId) result = result.filter((p) => p.vendor_id === vendorId);
    return result;
  }

  async createPromotion(entry: PromotionRecord): Promise<PromotionRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('promotions').insert(entry).select().single();
        if (data) return data as PromotionRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.promotions.push(entry);
    return entry;
  }

  async updatePromotion(id: string, updates: Partial<PromotionRecord>): Promise<PromotionRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('promotions').update(updates).eq('id', id).select().single();
        if (data) return data as PromotionRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const entry = store.promotions.find((p) => p.id === id);
    if (!entry) return null;
    Object.assign(entry, updates, { updated_at: now() });
    return entry;
  }

  async deletePromotion(id: string): Promise<PromotionRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('promotions').delete().eq('id', id).select().single();
        if (data) return data as PromotionRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.promotions.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const [removed] = store.promotions.splice(index, 1);
    return removed;
  }

  // --- Support Tickets ---
  async listSupportTickets(): Promise<SupportTicketRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('support_tickets').select('*').order('created_at', { ascending: false });
        if (data) return data as SupportTicketRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return [...store.supportTickets];
  }

  async createSupportTicket(ticket: SupportTicketRecord): Promise<SupportTicketRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('support_tickets').insert(ticket).select().single();
        if (data) return data as SupportTicketRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.supportTickets.unshift(ticket);
    return ticket;
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicketRecord>): Promise<SupportTicketRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('support_tickets').update(updates).eq('id', id).select().single();
        if (data) return data as SupportTicketRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const ticket = store.supportTickets.find((t) => t.id === id);
    if (!ticket) return null;
    Object.assign(ticket, updates, { updated_at: now() });
    return ticket;
  }

  async deleteSupportTicket(id: string): Promise<SupportTicketRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('support_tickets').delete().eq('id', id).select().single();
        if (data) return data as SupportTicketRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    const idx = store.supportTickets.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const removed = store.supportTickets[idx];
    store.supportTickets.splice(idx, 1);
    return removed;
  }


  // --- CMS ---
  async listCmsPages(): Promise<CmsPageRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('cms_pages').select('*').order('created_at', { ascending: false });
        if (data) return data as CmsPageRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return [...store.cmsPages];
  }

  async findCmsPageBySlug(slug: string): Promise<CmsPageRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('cms_pages').select('*').eq('slug', slug).maybeSingle();
        if (data) return data as CmsPageRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.cmsPages.find((p) => p.slug === slug) || null;
  }

  async createCmsPage(page: CmsPageRecord): Promise<CmsPageRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('cms_pages').insert(page).select().single();
        if (data) return data as CmsPageRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.cmsPages.push(page);
    return page;
  }

  async updateCmsPage(slug: string, updates: Partial<CmsPageRecord>): Promise<CmsPageRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('cms_pages').update(updates).eq('slug', slug).select().single();
        if (data) return data as CmsPageRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const page = store.cmsPages.find((p) => p.slug === slug);
    if (!page) return null;
    Object.assign(page, updates, { updated_at: now() });
    return page;
  }

  async deleteCmsPage(slug: string): Promise<CmsPageRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('cms_pages').delete().eq('slug', slug).select().single();
        if (data) return data as CmsPageRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.cmsPages.findIndex((p) => p.slug === slug);
    if (index === -1) return null;
    const [removed] = store.cmsPages.splice(index, 1);
    return removed;
  }

  // --- Pricing Rules ---
  async listPricingRules(): Promise<PricingRuleRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('pricing_rules').select('*').order('created_at', { ascending: false });
        if (data) return data as PricingRuleRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return [...store.pricingRules];
  }

  async createPricingRule(rule: PricingRuleRecord): Promise<PricingRuleRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('pricing_rules').insert(rule).select().single();
        if (data) return data as PricingRuleRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.pricingRules.push(rule);
    return rule;
  }

  async updatePricingRule(id: string, updates: Partial<PricingRuleRecord>): Promise<PricingRuleRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('pricing_rules').update(updates).eq('id', id).select().single();
        if (data) return data as PricingRuleRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const rule = store.pricingRules.find((p) => p.id === id);
    if (!rule) return null;
    Object.assign(rule, updates, { updated_at: now() });
    return rule;
  }

  async deletePricingRule(id: string): Promise<PricingRuleRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('pricing_rules').delete().eq('id', id).select().single();
        if (data) return data as PricingRuleRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.pricingRules.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const [removed] = store.pricingRules.splice(index, 1);
    return removed;
  }

  // --- KYV Documents ---
  async listKyvDocuments(vendorId?: string): Promise<KyvDocumentRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        let query = this.client.from('kyv_documents').select('*');
        if (vendorId) query = query.eq('vendor_id', vendorId);
        const { data } = await query.order('created_at', { ascending: false });
        if (data) return data as KyvDocumentRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    let result = store.kyvDocuments;
    if (vendorId) result = result.filter((k) => k.vendor_id === vendorId);
    return result;
  }

  async createKyvDocument(doc: KyvDocumentRecord): Promise<KyvDocumentRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('kyv_documents').insert(doc).select().single();
        if (data) return data as KyvDocumentRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.kyvDocuments.push(doc);
    return doc;
  }

  async updateKyvDocument(id: string, updates: Partial<KyvDocumentRecord>): Promise<KyvDocumentRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('kyv_documents').update(updates).eq('id', id).select().single();
        if (data) return data as KyvDocumentRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const doc = store.kyvDocuments.find((k) => k.id === id);
    if (!doc) return null;
    Object.assign(doc, updates, { updated_at: now() });
    return doc;
  }

  // --- Wishlist ---
  async listWishlist(customerEmail: string): Promise<WishlistRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('wishlist').select('*').eq('customer_email', customerEmail);
        if (data) return data as WishlistRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return store.wishlist.filter((w) => w.customer_email === customerEmail);
  }

  async createWishlist(entry: WishlistRecord): Promise<WishlistRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('wishlist').insert(entry).select().single();
        if (data) return data as WishlistRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    store.wishlist.push(entry);
    return entry;
  }

  async deleteWishlist(customerEmail: string, garageId: string): Promise<WishlistRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('wishlist').delete().eq('customer_email', customerEmail).eq('garage_id', garageId).select().single();
        if (data) return data as WishlistRecord | null;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    const index = store.wishlist.findIndex((w) => w.customer_email === customerEmail && w.garage_id === garageId);
    if (index === -1) return null;
    const [removed] = store.wishlist.splice(index, 1);
    return removed;
  }

  // --- Vehicles ---
  async listVehicles(userId: string): Promise<VehicleRecord[]> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vehicles').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) return data as VehicleRecord[];
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    return store.vehicles.filter((v) => v.user_id === userId);
  }

  async findVehicleById(id: string): Promise<VehicleRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vehicles').select('*').eq('id', id).maybeSingle();
        if (data) return data as VehicleRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    return store.vehicles.find((v) => v.id === id) || null;
  }

  async createVehicle(vehicle: VehicleRecord): Promise<VehicleRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vehicles').insert(vehicle).select().single();
        if (data) return data as VehicleRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    store.vehicles.push(vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<VehicleRecord>): Promise<VehicleRecord | null> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('vehicles').update(updates).eq('id', id).select().single();
        if (data) return data as VehicleRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    const idx = store.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    store.vehicles[idx] = { ...store.vehicles[idx], ...updates, updated_at: now() };
    return store.vehicles[idx];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    if (this.isSupabase && this.client) {
      try {
        const { error } = await this.client.from('vehicles').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
      }
    }
    const idx = store.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    store.vehicles.splice(idx, 1);
    return true;
  }

  // --- Settings ---
  async getSettings(): Promise<SettingsRecord> {
    if (this.isSupabase && this.client) {
      try {
        const { data } = await this.client.from('cms_pages').select('*').eq('slug', '__settings__').maybeSingle();
        if (data) return data as unknown as SettingsRecord;
      } catch (err) {
        if (process.env.NODE_ENV === 'production') throw err;
        console.warn('[DB] Supabase error, falling back to memory:', err);
        // Fall through to in-memory
      }
    }
    return { ...store.settings };
  }

  async updateSettings(updates: Partial<SettingsRecord>): Promise<SettingsRecord> {
    Object.assign(store.settings, updates, { updated_at: now() });
    return { ...store.settings };
  }

  // --- Chats & Messages ---
  getChats() {
    return [...store.chats];
  }

  getMessages() {
    return { ...store.messages.reduce((acc: Record<string, MessageRecord[]>, msg) => {
      const key = String(msg.thread_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(msg);
      return acc;
    }, {}) };
  }

  createMessage(msg: MessageRecord) {
    store.messages.push(msg);
    const chat = store.chats.find((c) => c.id === msg.thread_id);
    if (chat) {
      chat.last_message = msg.text;
      chat.time = msg.time;
    }
    return msg;
  }

  addResetToken(token: string, email: string, role: string) {
    store.resetTokens.push({ token, email, role, expiresAt: Date.now() + 1000 * 60 * 60 });
  }

  findResetToken(token: string, email?: string, role?: string) {
    return store.resetTokens.find((t) =>
      (token && t.token === token && t.expiresAt > Date.now()) ||
      (email && role && t.email === email && t.role === role && t.expiresAt > Date.now())
    ) || null;
  }

  deleteResetToken(token: string) {
    store.resetTokens = store.resetTokens.filter((t) => t.token !== token);
  }

  addVerificationToken(token: string, email: string) {
    store.verificationTokens.push({ token, email, expiresAt: Date.now() + 1000 * 60 * 60 * 48 });
  }

  findVerificationToken(token: string) {
    return store.verificationTokens.find((t) => t.token === token && t.expiresAt > Date.now()) || null;
  }

  removeVerificationToken(token: string) {
    store.verificationTokens = store.verificationTokens.filter((t) => t.token !== token);
  }

  getStats() {
    return {
      totalUsers: store.users.length,
      totalVendors: store.vendors.length,
      totalBookings: store.bookings.length,
      totalRevenue: store.bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
    };
  }

  getBookingsByStatus() {
    return store.bookings.reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
  }

  generateId(prefix: string) {
    return uid(prefix);
  }

  getVendorByUserId(userId: string) {
    return store.vendors.find((v) => v.user_id === userId) || null;
  }

  getGarageByVendorId(vendorId: string) {
    return store.garages.find((g) => g.vendor_id === vendorId) || null;
  }

  getResetTokens() {
    return store.resetTokens;
  }
}

export const db = new Database();

import pg from 'pg';

let pool: pg.Pool | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. PostgreSQL/Supabase persistence is required.');
  }

  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.DATABASE_POOL_SIZE || 10),
    });
  }

  return pool;
}

export async function query<T = any>(text: string, params: any[] = []) {
  if (!process.env.DATABASE_URL) {
    if (text.toLowerCase().includes('select id from users where')) {
      const email = params[0];
      const role = params[1];
      const match = store.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      return { rowCount: match ? 1 : 0, rows: match ? [match] : [] };
    }
    return { rowCount: 0, rows: [] } as any;
  }
  return getPool().query<T>(text, params);
}

const camelPattern = /_([a-z])/g;
const snakePattern = /[A-Z]/g;

export function toCamel(value: string) {
  return value.replace(camelPattern, (_, letter: string) => letter.toUpperCase());
}

export function toSnake(value: string) {
  return value.replace(snakePattern, (letter) => `_${letter.toLowerCase()}`);
}

export function rowToApi(row: any) {
  if (!row) return null;
  const api: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'metadata' && value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(api, value);
      continue;
    }
    api[toCamel(key)] = value;
  }
  return api;
}

export function rowsToApi(rows: any[]) {
  return rows.map(rowToApi);
}

export function splitAllowed(input: Record<string, any>, allowed: string[]) {
  const row: Record<string, any> = {};
  const metadata: Record<string, any> = {};
  const allowedSet = new Set(allowed);

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const snake = toSnake(key);
    if (allowedSet.has(snake)) {
      row[snake] = value;
    } else if (!['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(key)) {
      metadata[key] = value;
    }
  }

  if (Object.keys(metadata).length) {
    row.metadata = metadata;
  }

  return row;
}

export async function insertRow(table: string, row: Record<string, any>) {
  if (!process.env.DATABASE_URL) {
    if (table === 'users') {
      const userRec = {
        id: row.id,
        email: row.email,
        password_hash: row.password_hash,
        role: row.role,
        full_name: row.full_name,
        status: row.status || 'active',
        created_at: now(),
        updated_at: now()
      } as any;
      store.users.push(userRec);
      return rowToApi(userRec);
    }
    if (table === 'audit_logs') {
      return row;
    }
  }
  const columns = Object.keys(row);
  const values = Object.values(row);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const result = await query(
    `insert into ${table} (${columns.join(', ')}) values (${placeholders.join(', ')}) returning *`,
    values,
  );
  return rowToApi(result.rows[0]);
}

export async function updateRow(table: string, id: string, row: Record<string, any>) {
  if (!process.env.DATABASE_URL) {
    if (table === 'users') {
      const match = store.users.find(u => u.id === id);
      if (match) {
        Object.assign(match, row);
        return rowToApi(match);
      }
    }
  }
  const columns = Object.keys(row);
  if (!columns.length) {
    const current = await query(`select * from ${table} where id = $1`, [id]);
    return rowToApi(current.rows[0]);
  }

  const assignments = columns.map((column, index) => `${column} = $${index + 2}`);
  const values = [id, ...Object.values(row)];
  const result = await query(
    `update ${table} set ${assignments.join(', ')}, updated_at = now() where id = $1 returning *`,
    values,
  );
  return rowToApi(result.rows[0]);
}

export async function deleteRow(table: string, id: string) {
  if (!process.env.DATABASE_URL) {
    if (table === 'users') {
      const idx = store.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        const removed = store.users.splice(idx, 1)[0];
        return rowToApi(removed);
      }
    }
  }
  const result = await query(`delete from ${table} where id = $1 returning *`, [id]);
  return rowToApi(result.rows[0]);
}
