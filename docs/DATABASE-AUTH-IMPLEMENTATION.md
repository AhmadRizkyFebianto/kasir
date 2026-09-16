# Database & Authentication Implementation

## ✅ Implementation Status: COMPLETE

This document provides a complete overview of the database schema and authentication system implementation for the Kasir POS & Reservation System.

---

## 📊 Database Schema Implementation

### Tables Created

#### 1. **profiles** - User Profiles
Extends Supabase auth.users with additional user information.

```sql
- id (UUID, PK, FK to auth.users)
- email (TEXT, UNIQUE, NOT NULL)
- full_name (TEXT)
- phone (TEXT)
- role (user_role ENUM, DEFAULT 'customer')
- avatar_url (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_profiles_role` on role
- `idx_profiles_email` on email

---

#### 2. **place_categories** - Place Categories
Categories for different types of places (tables, rooms, fields, etc.).

```sql
- id (UUID, PK)
- name (TEXT, NOT NULL)
- description (TEXT)
- icon (TEXT)
- created_at, updated_at (TIMESTAMP)
```

---

#### 3. **places** - Physical Places
Places that can be reserved by customers.

```sql
- id (UUID, PK)
- category_id (UUID, FK, NOT NULL)
- name (TEXT, NOT NULL)
- number (TEXT, NOT NULL)
- capacity (INTEGER, NOT NULL)
- price_per_hour (DECIMAL(12,2), NOT NULL)
- description (TEXT)
- facilities (TEXT[])
- status (place_status ENUM, DEFAULT 'available')
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_places_category_id` on category_id
- `idx_places_status` on status
- `idx_places_number` on number

**Constraints:**
- UNIQUE(category_id, number)
- CHECK (capacity > 0)
- CHECK (price_per_hour >= 0)

---

#### 4. **reservations** - Place Reservations
Customer reservations for places.

```sql
- id (UUID, PK)
- place_id (UUID, FK, NOT NULL)
- customer_id (UUID, FK, NOT NULL)
- start_time (TIMESTAMP, NOT NULL)
- end_time (TIMESTAMP, NOT NULL)
- duration_hours (INTEGER, NOT NULL)
- total_amount (DECIMAL(12,2), NOT NULL)
- status (reservation_status ENUM, DEFAULT 'pending')
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_reservations_place_id` on place_id
- `idx_reservations_customer_id` on customer_id
- `idx_reservations_status` on status
- `idx_reservations_start_time` on start_time
- `idx_reservations_date_range` on (start_time, end_time)

**Constraints:**
- CHECK (duration_hours > 0)
- CHECK (total_amount >= 0)
- CHECK (end_time > start_time)

---

#### 5. **product_categories** - Product Categories
Categories for products/menu items.

```sql
- id (UUID, PK)
- name (TEXT, NOT NULL)
- description (TEXT)
- created_at, updated_at (TIMESTAMP)
```

---

#### 6. **products** - Products/Menu Items
Items that can be ordered by customers.

```sql
- id (UUID, PK)
- category_id (UUID, FK, NOT NULL)
- name (TEXT, NOT NULL)
- description (TEXT)
- price (DECIMAL(12,2), NOT NULL)
- stock (INTEGER, DEFAULT 0)
- image_url (TEXT)
- is_active (BOOLEAN, DEFAULT true)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_products_category_id` on category_id
- `idx_products_is_active` on is_active
- `idx_products_name` on name

**Constraints:**
- CHECK (price >= 0)
- CHECK (stock >= 0)

---

#### 7. **orders** - Customer Orders
Orders placed by customers for products.

```sql
- id (UUID, PK)
- customer_id (UUID, FK, NOT NULL)
- kasir_id (UUID, FK)
- total_amount (DECIMAL(12,2), NOT NULL)
- status (order_status ENUM, DEFAULT 'pending')
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_orders_customer_id` on customer_id
- `idx_orders_kasir_id` on kasir_id
- `idx_orders_status` on status
- `idx_orders_created_at` on created_at DESC

---

#### 8. **order_items** - Order Line Items
Individual items in an order.

```sql
- id (UUID, PK)
- order_id (UUID, FK, NOT NULL)
- product_id (UUID, FK, NOT NULL)
- quantity (INTEGER, NOT NULL)
- price (DECIMAL(12,2), NOT NULL)
- subtotal (DECIMAL(12,2), NOT NULL)
- created_at (TIMESTAMP)
```

**Indexes:**
- `idx_order_items_order_id` on order_id
- `idx_order_items_product_id` on product_id

**Constraints:**
- CHECK (quantity > 0)
- CHECK (price >= 0)
- CHECK (subtotal >= 0)

---

#### 9. **payments** - Payment Records
Payment records for reservations and orders.

```sql
- id (UUID, PK)
- reservation_id (UUID, FK)
- order_id (UUID, FK)
- amount (DECIMAL(12,2), NOT NULL)
- method (payment_method ENUM, NOT NULL)
- status (payment_status ENUM, DEFAULT 'pending')
- payment_gateway_id (TEXT)
- payment_gateway_response (JSONB)
- paid_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_payments_reservation_id` on reservation_id
- `idx_payments_order_id` on order_id
- `idx_payments_status` on status
- `idx_payments_method` on method
- `idx_payments_gateway_id` on payment_gateway_id

**Constraints:**
- CHECK (amount >= 0)
- CHECK (only one of reservation_id OR order_id is set)

---

#### 10. **cashier_sessions** - Cashier Work Sessions
Tracks cashier shifts and cash handling.

```sql
- id (UUID, PK)
- kasir_id (UUID, FK, NOT NULL)
- start_time (TIMESTAMP, DEFAULT NOW())
- end_time (TIMESTAMP)
- starting_cash (DECIMAL(12,2), NOT NULL)
- ending_cash (DECIMAL(12,2))
- total_sales (DECIMAL(12,2), DEFAULT 0)
- total_transactions (INTEGER, DEFAULT 0)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**Indexes:**
- `idx_cashier_sessions_kasir_id` on kasir_id
- `idx_cashier_sessions_start_time` on start_time DESC

---

#### 11. **audit_logs** - Audit Trail
Tracks important system actions for security and compliance.

```sql
- id (UUID, PK)
- user_id (UUID, FK)
- action (TEXT, NOT NULL)
- table_name (TEXT, NOT NULL)
- record_id (UUID)
- old_data (JSONB)
- new_data (JSONB)
- ip_address (INET)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

**Indexes:**
- `idx_audit_logs_user_id` on user_id
- `idx_audit_logs_table_name` on table_name
- `idx_audit_logs_created_at` on created_at DESC

---

## 🔐 Row Level Security (RLS) Policies

All tables have RLS enabled with comprehensive policies.

### Helper Functions

```sql
- get_user_role() - Returns current user's role
- is_admin() - Checks if user is admin
- is_kasir() - Checks if user is admin or kasir
```

### Policy Summary by Table

#### **profiles**
- Users can view their own profile
- Admin can view all profiles
- Users can update their own profile (except role)
- Admin can update any profile
- Admin can insert profiles
- Users can insert their own profile on signup

#### **place_categories**
- Anyone can view
- Only admin can manage

#### **places**
- Anyone can view
- Admin can fully manage
- Kasir can update status

#### **reservations**
- Customers can view their own reservations
- Admin/kasir can view all reservations
- Customers can create their own reservations
- Customers can update their pending reservations
- Admin/kasir can manage all reservations

#### **product_categories**
- Anyone can view
- Only admin can manage

#### **products**
- Anyone can view active products
- Admin/kasir can view all products
- Only admin can manage

#### **orders**
- Customers can view their own orders
- Admin/kasir can view all orders
- Customers can create their own orders
- Kasir can create orders for any customer
- Admin/kasir can update orders

#### **order_items**
- Customers can view items from their orders
- Admin/kasir can view all order items
- Customers can add items to their orders
- Kasir can manage all order items

#### **payments**
- Customers can view their own payments
- Admin/kasir can view all payments
- Kasir can create and update payments

#### **cashier_sessions**
- Kasir can view their own sessions
- Admin can view all sessions
- Kasir can create and update their own sessions
- Admin can manage all sessions

#### **audit_logs**
- Only admin can view
- System can insert (via triggers)

---

## 🎯 Enums

```sql
- user_role: 'admin', 'kasir', 'customer'
- place_status: 'available', 'reserved', 'occupied', 'maintenance'
- reservation_status: 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled'
- payment_status: 'pending', 'paid', 'failed', 'expired', 'refunded'
- payment_method: 'cash', 'qris', 'virtual_account', 'e_wallet', 'bank_transfer'
- order_status: 'pending', 'processing', 'completed', 'cancelled'
```

---

## 🔄 Triggers

**Auto-update Timestamps:**
All tables with `updated_at` field have triggers that automatically update the timestamp on row modification.

**Auto-create Profile:**
`on_auth_user_created` trigger automatically creates a profile record when a new user signs up via Supabase Auth.

---

## 🌐 Realtime

Enabled for:
- `places` - Live place availability updates
- `reservations` - Live reservation updates
- `orders` - Live order updates

---

## 🔑 Authentication Implementation

### Authentication Flow

```
1. User visits /register or /login
2. Submits credentials
3. Server Action handles auth via Supabase
4. On success, profile is auto-created (for new users)
5. Middleware validates session
6. User redirected to appropriate dashboard based on role
```

### Files Created

#### **lib/auth/actions.ts**
Server actions for authentication:
- `signUp(formData)` - Register new user
- `signIn(formData)` - Login existing user
- `signOut()` - Logout user
- `getCurrentUser()` - Get current user with profile
- `getUserRole()` - Get user's role
- `updateProfile(formData)` - Update user profile

#### **app/(auth)/login/page.tsx**
Login page with:
- Email/password form
- Error handling
- Loading states
- Link to register page
- Demo account credentials display

#### **app/(auth)/register/page.tsx**
Registration page with:
- Full name, email, password fields
- Password confirmation validation
- Error handling
- Loading states
- Link to login page

#### **app/(auth)/layout.tsx**
Clean layout for auth pages (no navbar).

#### **middleware.ts** (already exists)
Handles:
- Session refresh
- Protected route validation
- Redirect to login for unauthenticated users accessing protected routes

---

## 📦 Seed Data

### Pre-populated Data

**Place Categories (4):**
- Meja Reguler
- Booth VIP
- Ruang Meeting
- Lapangan

**Places (12):**
- 5 Regular tables (M01-M05)
- 3 VIP rooms (VIP01-VIP03)
- 2 Meeting rooms (MTG-A, MTG-B)
- 2 Futsal fields (LAP-A, LAP-B)

**Product Categories (4):**
- Minuman (Drinks)
- Makanan (Food)
- Snack
- Paket (Packages)

**Products (23):**
- 8 Drinks (Es Teh, Kopi, Jus, etc.)
- 6 Food items (Nasi Goreng, Ayam, etc.)
- 4 Snacks (Pisang Goreng, French Fries, etc.)
- 3 Package deals

---

## 🚀 Setup Instructions

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note your project URL and anon key

### 2. Run Migrations
In Supabase SQL Editor, run in order:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_seed_data.sql`

### 3. Create Admin & Kasir Accounts
In Supabase Auth Dashboard:
1. Create user: admin@kasir.com / password123
2. Create user: kasir@kasir.com / password123

Then run in SQL Editor:
```sql
UPDATE profiles SET role = 'admin', full_name = 'Admin User' 
WHERE email = 'admin@kasir.com';

UPDATE profiles SET role = 'kasir', full_name = 'Kasir User' 
WHERE email = 'kasir@kasir.com';
```

### 4. Configure Environment
Copy `.env.example` to `.env` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Test Authentication
1. Start dev server: `npm run dev`
2. Visit http://localhost:3000/login
3. Login with admin or kasir account
4. Register new customer account

---

## ✅ Verification Checklist

- [x] All tables created with proper structure
- [x] Foreign keys established
- [x] Indexes created for performance
- [x] Check constraints in place
- [x] Triggers for updated_at fields
- [x] RLS enabled on all tables
- [x] RLS policies for all user roles
- [x] Helper functions for role checking
- [x] Auto-profile creation trigger
- [x] Realtime enabled for key tables
- [x] Seed data loaded
- [x] Authentication actions implemented
- [x] Login page created
- [x] Register page created
- [x] Middleware configured
- [x] Protected routes working

---

## 🎯 Next Steps

The database and authentication foundation is complete. You can now proceed to:

**Phase 3: Customer Booking System**
- Browse places interface
- Place detail pages
- Reservation booking flow
- Availability checking
- Booking confirmation

**Phase 4: Admin Dashboard**
- Analytics dashboard
- Place management CRUD
- Product management CRUD
- User management

**Phase 5: Kasir Interface**
- POS system
- Order management
- Cash payment processing

**Phase 6: Payment Integration**
- Midtrans integration
- Online payment flow
- Webhook handling

---

## 📊 Database Diagram (Simplified)

```
auth.users (Supabase)
    ↓
profiles (role: admin/kasir/customer)
    ↓
├── reservations → places → place_categories
│       ↓
│   payments
│
├── orders → order_items → products → product_categories
│       ↓
│   payments
│
└── cashier_sessions (kasir only)

audit_logs (tracks all important actions)
```

---

**Status:** ✅ Database & Authentication Ready for Development

**Last Updated:** 2026-07-30