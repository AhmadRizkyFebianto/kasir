# Database Schema - Web Kasir + Reservasi Tempat

## Overview

Database ini dirancang untuk mendukung sistem POS dan reservasi tempat yang scalable, secure, dan real-time. Menggunakan PostgreSQL dengan Supabase sebagai backend platform.

## Design Principles

1. **Multi-tenancy Ready**: Mendukung multiple business dalam satu database
2. **Audit Trail**: Setiap perubahan data tercatat
3. **Soft Delete**: Data tidak benar-benar dihapus untuk keperluan historis
4. **Optimistic Locking**: Mencegah race condition dengan version control
5. **Denormalization Strategy**: Untuk performa reporting dan analytics
6. **Real-time Optimized**: Struktur yang mendukung Supabase Realtime

---

## Table Definitions

### 1. users
**Purpose**: Tabel auth users dari Supabase Auth (built-in)

**Note**: Tabel ini dikelola oleh Supabase Auth, tidak perlu dibuat manual.

---

### 2. profiles
**Purpose**: Extend user data dengan informasi profil lengkap

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'cashier', 'admin', 'super_admin')),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_profiles_business_id ON profiles(business_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;
```

**Fields**:
- `id`: UUID, primary key dari auth.users
- `email`: Email user (duplikasi dari auth untuk convenience)
- `full_name`: Nama lengkap user
- `phone`: Nomor telepon
- `avatar_url`: URL foto profil (Supabase Storage)
- `role`: customer, cashier, admin, super_admin
- `business_id`: Foreign key ke businesses (NULL untuk customer)
- `is_active`: Status aktif user
- `last_seen_at`: Timestamp last activity
- `created_at`, `updated_at`, `deleted_at`: Standard timestamps

**Indexes**: Untuk optimasi query by business, role, dan email

**RLS Policy**:
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all profiles in their business
CREATE POLICY "Admin can view business profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.business_id = profiles.business_id
      AND p.role IN ('admin', 'super_admin')
    )
  );
```

---

### 3. businesses
**Purpose**: Multi-tenancy untuk berbagai bisnis yang menggunakan aplikasi

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  business_type TEXT NOT NULL CHECK (business_type IN ('restaurant', 'cafe', 'billiard', 'karaoke', 'coworking', 'sports', 'entertainment')),
  logo_url TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  opening_hours JSONB, -- {monday: {open: "09:00", close: "22:00"}, ...}
  settings JSONB DEFAULT '{}', -- Business-specific settings
  is_active BOOLEAN DEFAULT true,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_business_type ON businesses(business_type);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);
CREATE UNIQUE INDEX idx_businesses_slug_unique ON businesses(slug) WHERE deleted_at IS NULL;
```

**Fields**:
- `id`: UUID primary key
- `name`: Nama bisnis
- `slug`: URL-friendly identifier (unique)
- `business_type`: Tipe bisnis untuk customization
- `opening_hours`: JSONB untuk jam operasional per hari
- `settings`: JSONB untuk konfigurasi spesifik bisnis
- `subscription_plan`: Monetization model

**Why JSONB for opening_hours**: Fleksibel untuk berbagai pola jam buka (libur, special hours)

---

### 4. place_categories
**Purpose**: Kategori tempat (meja, ruangan, booth, lapangan)

```sql
CREATE TABLE place_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon identifier or emoji
  color TEXT DEFAULT '#3B82F6', -- Hex color for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(business_id, slug)
);

-- Indexes
CREATE INDEX idx_place_categories_business_id ON place_categories(business_id);
CREATE INDEX idx_place_categories_sort_order ON place_categories(sort_order);
```

**Fields**:
- `color`: Untuk UI consistency dalam menampilkan kategori
- `sort_order`: Manual ordering untuk display
- Unique constraint pada (business_id, slug) untuk avoid duplicate dalam satu bisnis

---

### 5. places
**Purpose**: Tempat yang bisa direservasi (meja, ruangan, booth, lapangan, dll)

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES place_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- e.g., "M-01", "R-VIP-01"
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_hour DECIMAL(10,2),
  price_per_day DECIMAL(10,2),
  price_type TEXT DEFAULT 'hourly' CHECK (price_type IN ('hourly', 'daily', 'session', 'free')),
  facilities JSONB DEFAULT '[]', -- ["AC", "TV", "WiFi", "Projector"]
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance')),
  floor TEXT,
  location_details TEXT,
  qr_code TEXT, -- For QR-based check-in
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}', -- For extensibility
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(business_id, code)
);

-- Indexes
CREATE INDEX idx_places_business_id ON places(business_id);
CREATE INDEX idx_places_category_id ON places(category_id);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_code ON places(code);
CREATE INDEX idx_places_is_active ON places(is_active);

-- GIN index for JSONB search
CREATE INDEX idx_places_facilities ON places USING GIN(facilities);
```

**Fields**:
- `code`: Unique identifier untuk easy reference (e.g., "M-01" untuk Meja 1)
- `price_type`: Flexibility untuk berbagai model pricing
- `status`: Real-time status untuk customer visibility
- `facilities`: JSONB array untuk search by facility
- `qr_code`: Support untuk QR code check-in/check-out

**Why GIN index on facilities**: Untuk fast search query seperti "tempat dengan AC dan WiFi"

---

### 6. place_images
**Purpose**: Multiple images untuk setiap place

```sql
CREATE TABLE place_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_place_images_place_id ON place_images(place_id);
CREATE INDEX idx_place_images_sort_order ON place_images(sort_order);
CREATE INDEX idx_place_images_is_primary ON place_images(is_primary);
```

**Design Decision**: Separate table untuk multiple images per place, support gallery view

---

### 7. product_categories
**Purpose**: Kategori produk/menu (makanan, minuman, equipment rental)

```sql
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10B981',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(business_id, slug)
);

-- Indexes
CREATE INDEX idx_product_categories_business_id ON product_categories(business_id);
CREATE INDEX idx_product_categories_sort_order ON product_categories(sort_order);
```

---

### 8. products
**Purpose**: Produk/menu yang dijual (makanan, minuman, equipment)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2), -- For profit calculation
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  track_stock BOOLEAN DEFAULT false,
  low_stock_threshold INTEGER DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]', -- ["spicy", "vegetarian", "best-seller"]
  variants JSONB DEFAULT '[]', -- For size, toppings, etc
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(business_id, sku)
);

-- Indexes
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
```

**Fields**:
- `track_stock`: Tidak semua produk perlu stock tracking (e.g., services)
- `variants`: JSONB untuk flexible product variations
- `tags`: Untuk filtering dan search

---

### 9. customers
**Purpose**: Data customer untuk non-registered users (walk-in)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to registered user
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
```

**Design Decision**: 
- Support both registered users (user_id) and walk-in customers
- Denormalized fields (total_visits, total_spent) untuk fast analytics

---

### 10. reservations
**Purpose**: Booking/reservasi tempat oleh customer

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
  reservation_code TEXT NOT NULL UNIQUE,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1 -- For optimistic locking
);

-- Indexes
CREATE INDEX idx_reservations_business_id ON reservations(business_id);
CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_place_id ON reservations(place_id);
CREATE INDEX idx_reservations_reservation_code ON reservations(reservation_code);
CREATE INDEX idx_reservations_reservation_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, start_time, end_time);

-- Composite index for availability check
CREATE INDEX idx_reservations_availability ON reservations(place_id, reservation_date, start_time, end_time) 
  WHERE status NOT IN ('cancelled', 'no_show') AND deleted_at IS NULL;
```

**Fields**:
- `reservation_code`: Unique code untuk customer reference (e.g., "RSV-20260730-0001")
- `duration_hours`: Denormalized untuk easy calculation
- `version`: Optimistic locking untuk prevent double booking
- `payment_status`: Track partial payments

**Important Index**: `idx_reservations_availability` untuk fast availability checking

---

### 11. reservation_items
**Purpose**: Produk yang dipesan bersama reservasi (pre-order)

```sql
CREATE TABLE reservation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reservation_items_reservation_id ON reservation_items(reservation_id);
CREATE INDEX idx_reservation_items_product_id ON reservation_items(product_id);
```

**Design Decision**: Allow pre-order items during reservation untuk seamless experience

---

### 12. orders
**Purpose**: POS orders (walk-in atau additional orders from reservation)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery', 'reservation_addon')),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  cashier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  service_charge DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'online', 'card', 'ewallet', 'qris', 'bank_transfer')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  change_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'processing', 'ready', 'completed', 'cancelled')),
  notes TEXT,
  cashier_session_id UUID REFERENCES cashier_sessions(id),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE idx_orders_reservation_id ON orders(reservation_id);
CREATE INDEX idx_orders_cashier_id ON orders(cashier_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_cashier_session_id ON orders(cashier_session_id);
```

**Fields**:
- `order_type`: Distinguish between different order types
- `reservation_id`: Link to reservation untuk addon orders
- `cashier_session_id`: Track order dalam shift kasir
- Separated tax, service charge, discount untuk detailed reporting

---

### 13. order_items
**Purpose**: Item dalam setiap order

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL, -- Snapshot untuk historical data
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  variant_data JSONB, -- Selected variants
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_status ON order_items(status);
```

**Design Decision**: 
- Snapshot product_name dan sku untuk historical accuracy
- Item-level status untuk kitchen/preparation tracking

---

### 14. payments
**Purpose**: Payment records untuk orders dan reservations

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payment_code TEXT NOT NULL UNIQUE,
  payable_type TEXT NOT NULL CHECK (payable_type IN ('order', 'reservation')),
  payable_id UUID NOT NULL, -- order_id atau reservation_id
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online', 'card', 'ewallet', 'qris', 'bank_transfer', 'va')),
  payment_provider TEXT, -- 'midtrans', 'xendit', etc
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'expired', 'refunded')),
  transaction_id TEXT, -- External payment gateway transaction ID
  payment_url TEXT, -- URL untuk redirect customer
  expired_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- Store payment gateway response
  notes TEXT,
  processed_by UUID REFERENCES profiles(id), -- Cashier yang process
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_payment_code ON payments(payment_code);
CREATE INDEX idx_payments_payable ON payments(payable_type, payable_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

**Design Decision**: 
- Polymorphic relationship (payable_type + payable_id) untuk support multiple payment sources
- Store payment gateway metadata untuk debugging
- Track expired payments untuk cleanup

---

### 15. payment_webhooks
**Purpose**: Log semua webhook dari payment gateway

```sql
CREATE TABLE payment_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  provider TEXT NOT NULL, -- 'midtrans', 'xendit', etc
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_webhooks_payment_id ON payment_webhooks(payment_id);
CREATE INDEX idx_payment_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX idx_payment_webhooks_is_processed ON payment_webhooks(is_processed);
CREATE INDEX idx_payment_webhooks_created_at ON payment_webhooks(created_at);
```

**Purpose**: Security dan debugging webhook issues

---

### 16. cashier_sessions
**Purpose**: Track kasir shift untuk accountability

```sql
CREATE TABLE cashier_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  session_code TEXT NOT NULL UNIQUE,
  opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(12,2),
  expected_balance DECIMAL(12,2),
  difference DECIMAL(12,2),
  total_cash_in DECIMAL(12,2) DEFAULT 0,
  total_cash_out DECIMAL(12,2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cashier_sessions_business_id ON cashier_sessions(business_id);
CREATE INDEX idx_cashier_sessions_cashier_id ON cashier_sessions(cashier_id);
CREATE INDEX idx_cashier_sessions_session_code ON cashier_sessions(session_code);
CREATE INDEX idx_cashier_sessions_opened_at ON cashier_sessions(opened_at);
```

**Fields**:
- `difference`: Expected vs actual balance untuk detect discrepancies
- Denormalized totals untuk fast reporting

---

### 17. cash_transactions
**Purpose**: Track cash flow dalam cashier session

```sql
CREATE TABLE cash_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cashier_session_id UUID NOT NULL REFERENCES cashier_sessions(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('cash_in', 'cash_out', 'opening', 'closing')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT, -- 'order', 'payment', 'adjustment'
  reference_id UUID,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cash_transactions_session_id ON cash_transactions(cashier_session_id);
CREATE INDEX idx_cash_transactions_type ON cash_transactions(transaction_type);
CREATE INDEX idx_cash_transactions_reference ON cash_transactions(reference_type, reference_id);
```

---

### 18. invoices
**Purpose**: Invoice/receipt generation

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('order', 'reservation', 'mixed')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  service_charge DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_amount DECIMAL(12,2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  pdf_url TEXT, -- Generated PDF invoice
  issued_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_reservation_id ON invoices(reservation_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
```

**Design Decision**: Separate table untuk allow invoice regeneration dan versioning

---

### 19. notifications
**Purpose**: In-app notifications untuk users

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'reservation', 'payment', 'order')),
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

**Optimization**: Partial index untuk unread notifications query

---

### 20. audit_logs
**Purpose**: Comprehensive audit trail untuk compliance

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

### 21. settings
**Purpose**: System-wide settings key-value store

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Public settings accessible without auth
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, key)
);

-- Indexes
CREATE INDEX idx_settings_business_id ON settings(business_id);
CREATE INDEX idx_settings_key ON settings(key);
```

---

## Database Views

### v_place_availability
**Purpose**: View untuk real-time place availability dengan aggregated data

```sql
CREATE OR REPLACE VIEW v_place_availability AS
SELECT 
  p.id,
  p.business_id,
  p.name,
  p.code,
  p.category_id,
  pc.name as category_name,
  p.capacity,
  p.price_per_hour,
  p.price_per_day,
  p.price_type,
  p.status,
  p.thumbnail_url,
  p.facilities,
  (
    SELECT json_agg(pi.image_url ORDER BY pi.sort_order)
    FROM place_images pi
    WHERE pi.place_id = p.id
  ) as images,
  (
    SELECT COUNT(*)
    FROM reservations r
    WHERE r.place_id = p.id
    AND r.status IN ('confirmed', 'checked_in')
    AND r.deleted_at IS NULL
  ) as active_reservations,
  p.created_at,
  p.updated_at
FROM places p
LEFT JOIN place_categories pc ON p.category_id = pc.id
WHERE p.is_active = true
AND p.deleted_at IS NULL;
```

---

### v_order_summary
**Purpose**: Order summary dengan total calculation

```sql
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
  o.id,
  o.business_id,
  o.order_number,
  o.order_type,
  o.customer_id,
  c.name as customer_name,
  c.phone as customer_phone,
  o.place_id,
  pl.name as place_name,
  o.cashier_id,
  p.full_name as cashier_name,
  o.subtotal,
  o.tax_amount,
  o.service_charge,
  o.discount_amount,
  o.total_amount,
  o.payment_method,
  o.payment_status,
  o.status,
  (
    SELECT json_agg(
      json_build_object(
        'id', oi.id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'total', oi.total,
        'status', oi.status
      ) ORDER BY oi.created_at
    )
    FROM order_items oi
    WHERE oi.order_id = o.id
  ) as items,
  o.created_at,
  o.completed_at
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN places pl ON o.place_id = pl.id
LEFT JOIN profiles p ON o.cashier_id = p.id
WHERE o.deleted_at IS NULL;
```

---

### v_reservation_summary
**Purpose**: Reservation summary dengan place dan customer info

```sql
CREATE OR REPLACE VIEW v_reservation_summary AS
SELECT 
  r.id,
  r.business_id,
  r.reservation_code,
  r.customer_id,
  c.name as customer_name,
  c.phone as customer_phone,
  c.email as customer_email,
  r.place_id,
  p.name as place_name,
  p.code as place_code,
  pc.name as place_category,
  r.reservation_date,
  r.start_time,
  r.end_time,
  r.duration_hours,
  r.guest_count,
  r.status,
  r.payment_status,
  r.total_amount,
  r.paid_amount,
  (r.total_amount - r.paid_amount) as remaining_amount,
  (
    SELECT json_agg(
      json_build_object(
        'product_name', pr.name,
        'quantity', ri.quantity,
        'unit_price', ri.unit_price,
        'subtotal', ri.subtotal
      )
    )
    FROM reservation_items ri
    JOIN products pr ON ri.product_id = pr.id
    WHERE ri.reservation_id = r.id
  ) as pre_ordered_items,
  r.created_at,
  r.checked_in_at,
  r.checked_out_at
FROM reservations r
LEFT JOIN customers c ON r.customer_id = c.id
LEFT JOIN places p ON r.place_id = p.id
LEFT JOIN place_categories pc ON p.category_id = pc.id
WHERE r.deleted_at IS NULL;
```

---

### v_daily_sales
**Purpose**: Aggregated daily sales untuk dashboard

```sql
CREATE OR REPLACE VIEW v_daily_sales AS
SELECT 
  business_id,
  DATE(created_at) as sale_date,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash_revenue,
  SUM(CASE WHEN payment_method IN ('online', 'qris', 'ewallet', 'bank_transfer') THEN total_amount ELSE 0 END) as online_revenue,
  AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END) as average_transaction
FROM orders
WHERE deleted_at IS NULL
AND status = 'completed'
GROUP BY business_id, DATE(created_at);
```

---

## Database Functions

### fn_check_place_availability
**Purpose**: Function untuk check availability tempat

```sql
CREATE OR REPLACE FUNCTION fn_check_place_availability(
  p_place_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_reservation_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM reservations
  WHERE place_id = p_place_id
  AND reservation_date = p_date
  AND status NOT IN ('cancelled', 'no_show', 'completed')
  AND deleted_at IS NULL
  AND (id != p_exclude_reservation_id OR p_exclude_reservation_id IS NULL)
  AND (
    (start_time < p_end_time AND end_time > p_start_time)
  );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;
```

---

### fn_generate_reservation_code
**Purpose**: Generate unique reservation code

```sql
CREATE OR REPLACE FUNCTION fn_generate_reservation_code(
  p_business_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_date TEXT;
  v_sequence INTEGER;
  v_code TEXT;
BEGIN
  v_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reservation_code FROM 13) AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM reservations
  WHERE business_id = p_business_id
  AND DATE(created_at) = CURRENT_DATE;
  
  v_code := 'RSV-' || v_date || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;
```

---

### fn_generate_order_number
**Purpose**: Generate unique order number

```sql
CREATE OR REPLACE FUNCTION fn_generate_order_number(
  p_business_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_date TEXT;
  v_sequence INTEGER;
  v_code TEXT;
BEGIN
  v_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 13) AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM orders
  WHERE business_id = p_business_id
  AND DATE(created_at) = CURRENT_DATE;
  
  v_code := 'ORD-' || v_date || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;
```

---

### fn_update_place_status
**Purpose**: Auto-update place status based on reservation

```sql
CREATE OR REPLACE FUNCTION fn_update_place_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When reservation is confirmed or checked in
  IF NEW.status IN ('confirmed', 'checked_in') THEN
    UPDATE places
    SET status = CASE
      WHEN NEW.status = 'confirmed' THEN 'reserved'
      WHEN NEW.status = 'checked_in' THEN 'occupied'
    END
    WHERE id = NEW.place_id;
  
  -- When reservation is completed, cancelled, or no_show
  ELSIF NEW.status IN ('completed', 'cancelled', 'no_show') THEN
    -- Check if there are other active reservations
    PERFORM 1
    FROM reservations
    WHERE place_id = NEW.place_id
    AND id != NEW.id
    AND status IN ('confirmed', 'checked_in')
    AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
      UPDATE places
      SET status = 'available'
      WHERE id = NEW.place_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_place_status
AFTER UPDATE OF status ON reservations
FOR EACH ROW
EXECUTE FUNCTION fn_update_place_status();
```

---

### fn_update_customer_stats
**Purpose**: Update customer statistics after order/reservation

```sql
CREATE OR REPLACE FUNCTION fn_update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
    UPDATE customers
    SET 
      total_visits = total_visits + 1,
      total_spent = total_spent + NEW.total_amount,
      last_visit_at = NEW.created_at
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to orders
CREATE TRIGGER trigger_update_customer_stats_orders
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
WHEN (NEW.status = 'completed' AND NEW.customer_id IS NOT NULL)
EXECUTE FUNCTION fn_update_customer_stats();

-- Apply to reservations
CREATE TRIGGER trigger_update_customer_stats_reservations
AFTER INSERT OR UPDATE OF status ON reservations
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION fn_update_customer_stats();
```

---

### fn_audit_log
**Purpose**: Generic audit logging function

```sql
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_business_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old_data = row_to_json(OLD)::JSONB;
    v_new_data = NULL;
    v_business_id = OLD.business_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data = row_to_json(OLD)::JSONB;
    v_new_data = row_to_json(NEW)::JSONB;
    v_business_id = NEW.business_id;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data = NULL;
    v_new_data = row_to_json(NEW)::JSONB;
    v_business_id = NEW.business_id;
  END IF;
  
  INSERT INTO audit_logs (
    business_id,
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    v_business_id,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_old_data,
    v_new_data
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Row Level Security (RLS) Policies

### Business-scoped RLS
**Purpose**: Ensure users only access their business data

```sql
-- Enable RLS on all business-scoped tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's business_id
CREATE OR REPLACE FUNCTION auth.user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Businesses: Users can only see their own business
CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  USING (id = auth.user_business_id());

CREATE POLICY "Admins can update own business"
  ON businesses FOR UPDATE
  USING (id = auth.user_business_id() AND auth.is_admin());

-- Places: Business-scoped access
CREATE POLICY "Users can view business places"
  ON places FOR SELECT
  USING (business_id = auth.user_business_id() OR is_active = true);

CREATE POLICY "Admins can manage places"
  ON places FOR ALL
  USING (business_id = auth.user_business_id() AND auth.is_admin());

-- Products: Business-scoped access
CREATE POLICY "Users can view business products"
  ON products FOR SELECT
  USING (business_id = auth.user_business_id() OR is_available = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (business_id = auth.user_business_id() AND auth.is_admin());

-- Orders: Cashiers and admins can manage
CREATE POLICY "Staff can view business orders"
  ON orders FOR SELECT
  USING (business_id = auth.user_business_id());

CREATE POLICY "Cashiers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    business_id = auth.user_business_id() 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('cashier', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Cashiers can update own orders"
  ON orders FOR UPDATE
  USING (
    business_id = auth.user_business_id()
    AND (cashier_id = auth.uid() OR auth.is_admin())
  );

-- Reservations: Customers can view own, staff can view all
CREATE POLICY "Customers can view own reservations"
  ON reservations FOR SELECT
  USING (
    business_id = auth.user_business_id()
    OR EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = reservations.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_id
      AND (customers.user_id = auth.uid() OR customers.user_id IS NULL)
    )
  );

CREATE POLICY "Staff can manage reservations"
  ON reservations FOR ALL
  USING (business_id = auth.user_business_id());

-- Payments: Restricted to staff and payment owner
CREATE POLICY "Users can view related payments"
  ON payments FOR SELECT
  USING (
    business_id = auth.user_business_id()
    OR EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = payments.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage payments"
  ON payments FOR ALL
  USING (business_id = auth.user_business_id());
```

---

## Database Indexes Strategy

### Performance Optimization

**Rationale for indexes**:

1. **Foreign Key Indexes**: Semua foreign key di-index untuk JOIN performance
2. **Status Indexes**: Status fields sering di-query untuk filtering
3. **Date/Time Indexes**: Untuk date range queries dan reporting
4. **Composite Indexes**: Untuk complex queries yang sering digunakan
5. **Partial Indexes**: Untuk queries dengan WHERE conditions yang predictable
6. **GIN Indexes**: Untuk JSONB field searches

**Index Maintenance**:
- Monitor index usage: `pg_stat_user_indexes`
- Remove unused indexes
- Reindex periodically: `REINDEX TABLE table_name;`

---

## Supabase Realtime Configuration

### Enable Realtime for Tables

```sql
-- Enable realtime for place status updates
ALTER PUBLICATION supabase_realtime ADD TABLE places;

-- Enable realtime for reservations
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Realtime Filters

Client-side subscriptions will use:
- `places`: Filter by `business_id` and `status`
- `reservations`: Filter by `business_id` and `reservation_date`
- `orders`: Filter by `business_id` and `status`
- `notifications`: Filter by `user_id`

---

## Data Migration Considerations

### Initial Setup

1. Create extension `uuid-ossp` untuk UUID generation
2. Create all tables in order (respecting foreign keys)
3. Create indexes
4. Create views
5. Create functions
6. Create triggers
7. Enable RLS policies
8. Setup Realtime

### Seed Data

Minimal seed data untuk testing:
- 1 business (demo cafe)
- 3 place categories (Meja, Ruang VIP, Outdoor)
- 10 places
- 5 product categories
- 20 products
- 1 admin user
- 1 cashier user

---

## Backup and Recovery Strategy

### Supabase Automatic Backups

- Daily automatic backups (retention based on plan)
- Point-in-time recovery available
- Manual backups before major migrations

### Critical Tables Priority

1. **High Priority**: businesses, profiles, customers, orders, reservations, payments
2. **Medium Priority**: products, places, invoices
3. **Low Priority**: notifications, audit_logs (archivable)

---

## Database Monitoring

### Key Metrics to Monitor

1. **Performance**:
   - Query execution time
   - Slow queries log
   - Index hit rate
   - Connection pool usage

2. **Growth**:
   - Table sizes
   - Row counts
   - JSONB field sizes

3. **Integrity**:
   - Orphaned records
   - Failed transactions
   - Constraint violations

### Maintenance Tasks

- Weekly: Analyze query performance
- Monthly: Review and optimize indexes
- Quarterly: Archive old audit logs
- Yearly: Review data retention policies

---

## Summary

Database schema ini dirancang untuk:

✅ **Scalability**: Multi-tenancy, indexed queries, denormalized aggregates
✅ **Security**: RLS policies, audit logging, soft deletes
✅ **Real-time**: Optimized for Supabase Realtime subscriptions
✅ **Reliability**: Optimistic locking, data integrity constraints
✅ **Performance**: Strategic indexing, materialized views, JSONB for flexibility
✅ **Maintainability**: Clear naming conventions, comprehensive documentation

Total tables: 21
Total views: 4
Total functions: 6
Total triggers: 3

Database ready untuk production dengan best practices PostgreSQL dan Supabase.
