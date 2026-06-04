create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('customer', 'vendor', 'admin')),
  full_name text,
  phone text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vendors (
  id text primary key,
  user_id text references users(id) on delete cascade,
  business_name text not null,
  email text,
  phone text,
  location text,
  description text,
  rating numeric(3,2) not null default 0,
  verified boolean not null default false,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists garages (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  name text not null,
  location text not null,
  city text,
  rating numeric(3,2) not null default 0,
  reviews integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  garage_id text references garages(id) on delete cascade,
  category_id text references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  duration_minutes integer not null default 60,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bookings (
  id text primary key,
  customer_id text references users(id) on delete set null,
  vendor_id text references vendors(id) on delete set null,
  garage_id text references garages(id) on delete set null,
  service_id text references services(id) on delete set null,
  customer_email text,
  customer_name text,
  vehicle text,
  scheduled_date date,
  scheduled_time text,
  status text not null default 'Pending',
  amount numeric(12,2) not null default 0,
  cancellation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id text primary key,
  booking_id text references bookings(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending',
  provider text,
  provider_payment_id text,
  refund_amount numeric(12,2) not null default 0,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  booking_id text references bookings(id) on delete set null,
  customer_id text references users(id) on delete set null,
  vendor_id text references vendors(id) on delete set null,
  garage_id text references garages(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text not null default 'published',
  vendor_response text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists promotions (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  title text not null,
  description text,
  discount_type text,
  discount_value numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  thread_id text not null,
  sender_role text not null,
  sender_id text,
  recipient_id text,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  channel text not null default 'in-app',
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists kyv_documents (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  file_url text,
  file_hash text,
  file_size integer not null default 0,
  mime_type text,
  status text not null default 'pending',
  reviewed_by text references users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wishlist (
  id text primary key,
  customer_email text not null,
  garage_id text references garages(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_email, garage_id)
);

create table if not exists support_tickets (
  id text primary key,
  user_id text references users(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  priority text not null default 'medium',
  assigned_to text references users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_pages (
  slug text primary key,
  title text not null,
  content text not null,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pricing_rules (
  id text primary key,
  vendor_id text references vendors(id) on delete cascade,
  category_id text references categories(id) on delete set null,
  name text not null,
  rule_type text not null,
  payload jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id text primary key,
  user_id text references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key,
  actor_id text references users(id) on delete set null,
  actor_email text,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id text,
  ip_address text,
  user_agent text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id text primary key,
  user_id text references users(id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null,
  vin text,
  mileage integer not null default 0,
  color text,
  fuel_type text,
  last_service_date date,
  last_service_type text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table payments add column if not exists provider text;
alter table payments add column if not exists provider_payment_id text;
alter table payments add column if not exists stripe_payment_intent_id text;
alter table payments add column if not exists stripe_charge_id text;
alter table kyv_documents add column if not exists file_hash text;
alter table kyv_documents add column if not exists file_size integer not null default 0;
alter table kyv_documents add column if not exists mime_type text;
alter table kyv_documents add column if not exists review_note text;

alter table garages add column if not exists lat numeric(10, 7);
alter table garages add column if not exists lng numeric(10, 7);
alter table garages add column if not exists opening_hours text;
alter table garages add column if not exists phone text;
alter table garages add column if not exists images text[] default '{}';

alter table promotions add column if not exists promo_code text unique;
alter table promotions add column if not exists usage_limit integer;
alter table promotions add column if not exists used_count integer not null default 0;
alter table users add column if not exists email_verified_at timestamptz;

create index if not exists idx_users_email_role on users (lower(email), role);
create index if not exists idx_bookings_vendor_date on bookings (vendor_id, scheduled_date);
create index if not exists idx_bookings_customer_email on bookings (lower(customer_email));
create index if not exists idx_payments_provider_payment_id on payments (provider_payment_id);
create index if not exists idx_kyv_documents_vendor_status on kyv_documents (vendor_id, status);
create index if not exists idx_audit_logs_entity on audit_logs (entity_type, entity_id, created_at desc);


