# Product Requirement Document (PRD)
## Web Kasir + Reservasi Tempat

**Version**: 1.0  
**Last Updated**: 30 Juli 2026  
**Status**: Planning Phase

---

## 1. Product Overview

### 1.1 Executive Summary

Web Kasir + Reservasi Tempat adalah aplikasi SaaS full-stack yang mengintegrasikan sistem Point of Sale (POS) dengan platform reservasi tempat. Aplikasi ini dirancang untuk bisnis hospitality dan entertainment di Indonesia yang membutuhkan manajemen tempat dan transaksi dalam satu platform terpadu.

### 1.2 Problem Statement

Bisnis seperti restoran, cafe, billiard, karaoke, coworking space, dan tempat olahraga sering menghadapi:

- **Kesulitan manajemen reservasi**: Sistem manual via WhatsApp/telepon rentan double booking
- **Tidak ada visibilitas real-time**: Customer tidak tahu tempat mana yang tersedia
- **Proses pembayaran tidak terintegrasi**: Payment gateway terpisah dari sistem kasir
- **Data terfragmentasi**: Reservasi dan transaksi tidak ter-record dengan baik
- **Pengalaman customer kurang optimal**: Proses booking yang tidak seamless

### 1.3 Solution

Platform terpadu yang menyediakan:

✅ **Real-time availability** tempat dengan Supabase Realtime  
✅ **Online booking** dengan pembayaran terintegrasi (Midtrans)  
✅ **POS system** untuk transaksi walk-in dan add-on orders  
✅ **Multi-role access** (Customer, Kasir, Admin)  
✅ **Comprehensive reporting** untuk business insights  
✅ **Mobile-responsive** untuk akses dari device apapun

### 1.4 Success Metrics

**Business Metrics**:
- Reduce double booking rate < 1%
- Increase online reservation rate by 40%
- Reduce payment processing time by 60%
- Improve customer satisfaction score > 4.5/5

**Technical Metrics**:
- Page load time < 2 seconds
- Real-time update latency < 500ms
- System uptime > 99.5%
- Payment success rate > 95%

---

## 2. Target Users & Personas

### 2.1 Business Owners (Admin)

**Profile**:
- Pemilik bisnis hospitality/entertainment
- Usia 25-45 tahun
- Tech-savvy, ingin efisiensi operasional

**Goals**:
- Monitoring pendapatan dan performa bisnis
- Mengelola staff dan inventory
- Mengatur pricing dan promosi
- Mendapat insights dari data analytics

**Pain Points**:
- Sulitnya tracking revenue across multiple channels
- Tidak ada visibility ke operational metrics
- Manual reporting memakan waktu

### 2.2 Kasir/Staff

**Profile**:
- Staff front-desk atau kasir
- Usia 18-35 tahun
- Familiar dengan sistem kasir digital

**Goals**:
- Proses transaksi cepat dan akurat
- Mudah mencatat reservasi walk-in
- Clear visibility ke status tempat
- Minimal error dalam pembayaran

**Pain Points**:
- Sistem yang rumit dan lambat
- Sering salah hitung kembalian
- Sulit tracking order add-on dari reservation

### 2.3 Customers

**Profile**:
- End-user yang ingin booking tempat
- Usia 18-45 tahun
- Mobile-first behavior

**Goals**:
- Cepat menemukan tempat yang available
- Booking process yang simple
- Multiple payment options
- Konfirmasi instant

**Pain Points**:
- Harus telepon/WA untuk cek availability
- Booking tidak pasti sampai dikonfirmasi manual
- Limited payment options
- Tidak ada history booking

---

## 3. User Roles & Permissions

### 3.1 Permission Matrix

| Feature | Customer | Cashier | Admin | Super Admin |
|---------|----------|---------|-------|-------------|
| **Places** |
| View available places | ✅ | ✅ | ✅ | ✅ |
| Create reservation | ✅ | ✅ | ✅ | ✅ |
| View all reservations | Own only | Business | Business | All |
| Cancel reservation | Own only | Business | Business | All |
| Manage places | ❌ | ❌ | ✅ | ✅ |
| **Orders & POS** |
| Create walk-in order | ❌ | ✅ | ✅ | ✅ |
| View orders | Own only | Business | Business | All |
| Process payment | ❌ | ✅ | ✅ | ✅ |
| Refund transaction | ❌ | ❌ | ✅ | ✅ |
| **Products** |
| View products | ✅ | ✅ | ✅ | ✅ |
| Manage products | ❌ | ❌ | ✅ | ✅ |
| Update stock | ❌ | ✅ | ✅ | ✅ |
| **Cashier Session** |
| Open/close session | ❌ | ✅ | ✅ | ✅ |
| View session history | ❌ | Own only | Business | All |
| **Reporting** |
| View own transactions | ✅ | ✅ | ✅ | ✅ |
| View business reports | ❌ | Limited | ✅ | ✅ |
| Export data | ❌ | ❌ | ✅ | ✅ |
| **Settings** |
| Update profile | ✅ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Business settings | ❌ | ❌ | ✅ | ✅ |
| System configuration | ❌ | ❌ | ❌ | ✅ |

### 3.2 Role Descriptions

**Customer**:
- Self-service user yang melakukan booking
- Akses terbatas ke fitur public-facing
- Bisa track reservasi mereka sendiri

**Cashier**:
- Staff yang handle transaksi harian
- Akses POS dan reservation management
- Bisa buka/tutup shift sendiri

**Admin**:
- Pemilik atau manager bisnis
- Full access ke business data
- Manage staff dan configuration

**Super Admin**:
- System administrator (internal team)
- Multi-tenant management
- System-wide configuration

---

## 4. Feature Requirements

### 4.1 Customer Website Features

#### 4.1.1 Landing Page

**Description**: Homepage yang menampilkan informasi bisnis dan CTA untuk booking

**User Story**:
> Sebagai customer, saya ingin melihat overview bisnis dan available places agar saya bisa memutuskan untuk booking

**Requirements**:
- Hero section dengan business name, logo, dan CTA "Book Now"
- Featured places dengan gambar dan harga
- Business info (alamat, jam buka, kontak)
- Testimonials section
- Mobile responsive design
- SEO optimized (Next.js App Router SSG)

**Acceptance Criteria**:
- [ ] Page load < 2 detik
- [ ] Images lazy loaded
- [ ] CTA button prominent dan accessible
- [ ] Mobile viewport optimal
- [ ] Working navigation menu

#### 4.1.2 Place Listing & Search

**Description**: Halaman browse tempat dengan filtering dan real-time availability

**User Story**:
> Sebagai customer, saya ingin browse available places dengan filter agar saya bisa menemukan tempat yang sesuai kebutuhan

**Requirements**:
- Grid/List view untuk places
- Filter by:
  - Category (meja, ruangan, booth, etc)
  - Capacity (jumlah orang)
  - Price range
  - Facilities (AC, WiFi, TV, etc)
- Search by name/code
- Real-time status indicator:
  - 🟢 Available
  - 🔴 Reserved
  - 🟡 Occupied
  - ⚪ Maintenance
- Sort by: price, capacity, popularity

**Acceptance Criteria**:
- [ ] Filter bekerja dengan kombinasi
- [ ] Real-time status update via Supabase Realtime
- [ ] Search results instant (< 100ms)
- [ ] Pagination untuk large dataset
- [ ] Status color coding consistent

#### 4.1.3 Place Detail Page

**Description**: Detail lengkap tentang tempat tertentu

**User Story**:
> Sebagai customer, saya ingin melihat detail lengkap tempat sebelum booking agar saya yakin dengan pilihan saya

**Requirements**:
- Image gallery (multiple photos)
- Place information:
  - Name, code, category
  - Capacity
  - Pricing (per hour/day)
  - Facilities list
  - Location/floor
  - Description
- Real-time availability calendar
- CTA "Book Now"
- Related/similar places suggestions

**Acceptance Criteria**:
- [ ] Image gallery swipeable/clickable
- [ ] Availability calendar interactive
- [ ] Pricing calculation preview
- [ ] Mobile gesture support untuk gallery
- [ ] Social share buttons functional

#### 4.1.4 Booking Flow

**Description**: Multi-step booking process

**User Story**:
> Sebagai customer, saya ingin proses booking yang simple dan jelas agar saya tidak bingung

**Requirements**:

**Step 1: Select Date & Time**
- Date picker (disable past dates)
- Time slot selector
- Duration input (hours)
- Real-time availability check
- Price calculation preview

**Step 2: Add Pre-order (Optional)**
- Browse products/menu
- Add items to pre-order
- Quantity selection
- Special requests input
- Running total calculation

**Step 3: Customer Information**
- Name, email, phone (required)
- Guest count
- Special requests/notes
- Save info for future bookings

**Step 4: Review & Confirm**
- Summary of booking:
  - Place details
  - Date, time, duration
  - Pre-ordered items
  - Total amount breakdown
- Terms & conditions checkbox
- Edit buttons untuk each section

**Acceptance Criteria**:
- [ ] Step indicator visible
- [ ] Back button functional
- [ ] Form validation comprehensive
- [ ] Progress saved (client-side)
- [ ] Mobile-friendly inputs
- [ ] Clear error messages

#### 4.1.5 Payment Integration

**Description**: Multiple payment methods dengan Midtrans integration

**User Story**:
> Sebagai customer, saya ingin membayar dengan metode yang saya suka agar transaksi lancar

**Requirements**:

**Payment Methods**:
- 💳 QRIS (all banks)
- 🏦 Virtual Account (BCA, Mandiri, BRI, BNI)
- 📱 E-wallet (GoPay, DANA, OVO, ShopeePay)
- 💰 Cash (pay at venue)

**Payment Flow - Online**:
1. Customer select payment method
2. Create Midtrans transaction
3. Redirect to payment page/QR
4. Customer complete payment
5. Webhook received
6. Update payment status
7. Send confirmation notification

**Payment Flow - Cash**:
1. Customer select "Pay at Venue"
2. Reservation created dengan status "Pending Payment"
3. Customer datang ke venue
4. Kasir process payment
5. Reservation confirmed

**Requirements**:
- Midtrans Snap integration
- Webhook signature verification
- Payment status tracking
- Automatic expiry (24 hours)
- Retry mechanism untuk failed webhooks
- Payment receipt generation

**Acceptance Criteria**:
- [ ] All payment methods functional
- [ ] Webhook processed < 5 seconds
- [ ] Payment timeout handled gracefully
- [ ] Receipt sent via email
- [ ] Failed payment user-friendly message
- [ ] Idempotent payment processing

#### 4.1.6 Reservation Confirmation

**Description**: Konfirmasi booking dengan detail lengkap

**User Story**:
> Sebagai customer, saya ingin konfirmasi booking yang jelas agar saya tahu booking saya berhasil

**Requirements**:
- Success page dengan:
  - Reservation code
  - QR code untuk check-in
  - Place details
  - Date, time, duration
  - Payment status
  - Total amount
  - Countdown to reservation
- Email confirmation
- Add to calendar button
- Share booking option
- Direction/map ke venue

**Acceptance Criteria**:
- [ ] Page accessible via direct link
- [ ] QR code scannable
- [ ] Email sent within 1 minute
- [ ] Calendar invite (.ics file) working
- [ ] Mobile notification (if app)

#### 4.1.7 My Reservations

**Description**: Dashboard untuk customer melihat booking history

**User Story**:
> Sebagai customer, saya ingin melihat semua reservasi saya agar saya bisa track status mereka

**Requirements**:
- List reservations dengan status:
  - Upcoming (confirmed, pending payment)
  - Ongoing (checked in)
  - Past (completed, cancelled, no-show)
- For each reservation:
  - Reservation code
  - Place name
  - Date & time
  - Status badge
  - Payment status
  - Total amount
  - Actions (view detail, cancel, re-book)
- Filter by status
- Search by code/date
- Cancel reservation flow (dengan konfirmasi)

**Acceptance Criteria**:
- [ ] Real-time status updates
- [ ] Cancellation policy enforced
- [ ] Refund process initiated (if applicable)
- [ ] Past reservations paginated
- [ ] Mobile scroll performance optimized

---

### 4.2 Admin/Kasir Dashboard Features

#### 4.2.1 Dashboard Overview

**Description**: Main dashboard dengan key metrics dan quick actions

**User Story**:
> Sebagai admin, saya ingin melihat overview bisnis saya hari ini agar saya bisa monitor performa

**Requirements**:

**Metrics Cards**:
- Today's revenue (dengan comparison ke yesterday)
- Total transactions
- Total reservations (today)
- Available places count
- Occupied places count

**Charts**:
- Revenue trend (7/30 days)
- Transactions by payment method
- Popular places (top 5)
- Hourly booking distribution

**Quick Actions**:
- Create new reservation
- Process walk-in order
- Open cashier session
- View today's reservations

**Recent Activity Feed**:
- Latest reservations
- Recent orders
- Pending payments
- Low stock alerts

**Acceptance Criteria**:
- [ ] Metrics update real-time
- [ ] Charts interactive (hover tooltips)
- [ ] Quick actions accessible
- [ ] Activity feed auto-refresh
- [ ] Loading states smooth

#### 4.2.2 POS (Point of Sale)

**Description**: Kasir interface untuk proses transaksi

**User Story**:
> Sebagai kasir, saya ingin interface POS yang cepat dan mudah agar saya bisa melayani customer dengan efisien

**Requirements**:

**Layout**:
- Left: Product categories tabs
- Center: Product grid dengan search
- Right: Cart/Order summary

**Product Selection**:
- Click to add product ke cart
- Quantity adjustment (+/-)
- Product variants selector
- Special notes per item
- Search product by name/SKU

**Order Summary**:
- Line items dengan price
- Subtotal calculation
- Tax calculation (if applicable)
- Service charge (if applicable)
- Discount input
- Total amount prominent
- Link to place/table (if dine-in)
- Link to reservation (if addon order)

**Payment**:
- Payment method selector
- Cash payment:
  - Amount received input
  - Change calculation auto
  - Denominations quick select
- Online payment:
  - QRIS generate
  - E-wallet select
  - Virtual account generate
- Split payment support
- Print receipt button

**Hot Keys**:
- F1: New order
- F2: Payment
- F3: Search product
- ESC: Cancel current action

**Acceptance Criteria**:
- [ ] Product search instant
- [ ] Calculation accurate
- [ ] Receipt print < 3 seconds
- [ ] Keyboard shortcuts working
- [ ] Mobile responsive (tablet mode)
- [ ] No lag dengan 50+ items

#### 4.2.3 Reservation Management

**Description**: Manage semua reservations dalam satu tempat

**User Story**:
> Sebagai kasir/admin, saya ingin manage reservations dengan mudah agar tidak ada yang terlewat

**Requirements**:

**Views**:
- **List View**: Table dengan columns:
  - Reservation code
  - Customer name & phone
  - Place name
  - Date & time
  - Duration
  - Status
  - Payment status
  - Actions
- **Calendar View**: Month/week/day view
  - Color coded by status
  - Click to view detail
  - Drag to reschedule
- **Timeline View**: Horizontal timeline per place
  - Visual blocked times
  - Easy spot availability gaps

**Filters**:
- Date range
- Status
- Place
- Payment status
- Customer name/phone

**Actions**:
- View detail
- Edit reservation
- Check-in customer (QR scan atau manual)
- Check-out customer
- Cancel reservation
- Send reminder (email/SMS)
- Add notes

**Bulk Actions**:
- Export to Excel
- Send bulk reminders
- Bulk status update

**Real-time Updates**:
- Auto-refresh new bookings
- Status change notifications
- Payment confirmation alerts

**Acceptance Criteria**:
- [ ] Filter combinations working
- [ ] Calendar drag-drop smooth
- [ ] QR scanner functional
- [ ] Export complete dataset
- [ ] Mobile view usable
- [ ] Real-time < 1 second latency

#### 4.2.4 Place Management

**Description**: CRUD operations untuk places

**User Story**:
> Sebagai admin, saya ingin manage tempat dengan mudah agar data selalu up-to-date

**Requirements**:

**List View**:
- Grid/table dengan preview
- Quick status toggle
- Bulk actions
- Sort by various fields

**Create/Edit Form**:
- Basic info (name, code, category)
- Pricing (hourly/daily/session)
- Capacity
- Facilities (checkboxes)
- Description (rich text)
- Image upload (multiple)
  - Drag & drop
  - Crop/resize tool
  - Set primary image
- Location details (floor, area)
- QR code auto-generate
- Status selector
- Active/inactive toggle

**Place Detail View**:
- Full information display
- Booking history
- Revenue contribution
- Utilization rate chart
- Edit/delete actions

**Validation**:
- Required fields enforcement
- Unique code validation
- Price format validation
- Image size/format check

**Acceptance Criteria**:
- [ ] Form validation real-time
- [ ] Image upload multiple files
- [ ] QR code generated correctly
- [ ] Delete confirmation dialog
- [ ] Audit log recorded

#### 4.2.5 Product/Menu Management

**Description**: Manage products untuk pre-order dan POS

**User Story**:
> Sebagai admin, saya ingin manage produk dengan mudah termasuk stock tracking

**Requirements**:

**Product List**:
- Table/grid view
- Filter by category, availability
- Search by name/SKU
- Quick edit inline
- Bulk price update

**Product Form**:
- Basic info (name, SKU, category)
- Description (rich text)
- Price & cost (profit calculation)
- Image upload
- Stock management:
  - Enable/disable tracking
  - Current quantity
  - Low stock threshold
  - Unit of measure
- Variants (if applicable):
  - Size, type, add-ons
  - Price modifiers
- Tags untuk filtering
- Availability toggle
- Featured flag

**Stock Management**:
- Stock in/out transactions
- Stock adjustment
- Stock history log
- Low stock alerts
- Auto-disable ketika stock 0

**Acceptance Criteria**:
- [ ] SKU auto-generate option
- [ ] Profit margin calculated
- [ ] Stock alerts triggered
- [ ] Variant pricing correct
- [ ] Image optimized auto

#### 4.2.6 Customer Management

**Description**: Customer database dan history

**User Story**:
> Sebagai admin, saya ingin data customer terpusat agar saya bisa provide better service

**Requirements**:

**Customer List**:
- Searchable table
- Filter by:
  - Registration date
  - Total visits
  - Total spent
  - Last visit date
- Sort by various metrics

**Customer Profile**:
- Personal info (name, email, phone, address)
- Statistics:
  - Total visits
  - Total spent
  - Average transaction
  - Favorite places
- Booking history
- Order history
- Notes (internal)
- Tags untuk segmentation

**Actions**:
- Merge duplicate customers
- Send notification
- Add to loyalty program (future)
- Export customer data

**Privacy**:
- GDPR-compliant data handling
- Customer can request data deletion
- Audit log semua akses

**Acceptance Criteria**:
- [ ] Search fuzzy matching
- [ ] Statistics accurate
- [ ] History paginated
- [ ] Export includes GDPR notice
- [ ] Merge handles conflicts

#### 4.2.7 Cashier Session Management

**Description**: Manage shift kasir untuk accountability

**User Story**:
> Sebagai kasir, saya ingin buka/tutup shift dengan jelas agar cash management akurat

**Requirements**:

**Open Session**:
- Input opening balance
- Record denominations
- Take opening balance photo (optional)
- Session code auto-generate

**During Session**:
- Dashboard showing:
  - Session duration
  - Total transactions
  - Cash in/out
  - Expected balance
  - Current cash drawer status
- Quick actions:
  - Cash in (terima uang tambahan)
  - Cash out (ambil uang)
  - Add transaction note

**Close Session**:
- Input closing balance
- Record denominations
- Calculate difference
- Reconciliation report:
  - Expected vs actual
  - Breakdown by payment method
  - Transaction summary
  - Cash movements
- Add closing notes
- Generate shift report
- Require supervisor approval (if difference significant)

**Session History**:
- List all past sessions
- Filter by cashier, date
- View detailed reports
- Export untuk audit

**Acceptance Criteria**:
- [ ] Only one active session per cashier
- [ ] Balance calculation accurate
- [ ] Difference alerts working
- [ ] Report comprehensive
- [ ] Cannot close dengan pending transactions

#### 4.2.8 Payment Management

**Description**: Track dan manage semua payments

**User Story**:
> Sebagai admin, saya ingin visibility ke semua payment agar tidak ada transaksi yang hilang

**Requirements**:

**Payment List**:
- Table dengan columns:
  - Payment code
  - Date & time
  - Customer
  - Amount
  - Method
  - Provider
  - Status
  - Actions
- Filter by:
  - Date range
  - Method
  - Provider
  - Status
- Search by code/transaction ID

**Payment Detail**:
- Full payment information
- Related order/reservation
- Provider response data
- Status history timeline
- Webhook logs
- Receipt preview/download

**Actions**:
- View receipt
- Resend receipt
- Refund payment (dengan confirmation)
- Manual status update (admin only)
- Retry failed webhook

**Refund Flow**:
1. Admin initiate refund
2. Input refund amount & reason
3. Process via payment gateway
4. Update payment status
5. Update order/reservation status
6. Send refund confirmation

**Acceptance Criteria**:
- [ ] Real-time status updates
- [ ] Webhook retries exponential backoff
- [ ] Refund processed correctly
- [ ] Receipt regenerated after refund
- [ ] Audit trail complete

#### 4.2.9 Reports & Analytics

**Description**: Comprehensive business intelligence

**User Story**:
> Sebagai admin, saya ingin insights mendalam tentang bisnis saya agar saya bisa make data-driven decisions

**Requirements**:

**Report Types**:

**1. Sales Report**
- Revenue by period (daily/weekly/monthly/yearly)
- Revenue by payment method
- Revenue by place
- Revenue by product category
- Growth trends
- Comparison periods

**2. Reservation Report**
- Total reservations by period
- Reservation status breakdown
- Cancellation rate
- No-show rate
- Average booking value
- Peak hours/days analysis
- Lead time analysis (booking to visit)

**3. Place Utilization Report**
- Occupancy rate per place
- Revenue per place
- Average duration
- Most/least popular places
- Maintenance downtime

**4. Product Performance**
- Best/worst selling products
- Revenue by category
- Stock turnover rate
- Profit margin analysis

**5. Customer Analytics**
- New vs returning customers
- Customer lifetime value
- Retention rate
- RFM analysis (Recency, Frequency, Monetary)
- Geographic distribution

**6. Staff Performance**
- Transactions per cashier
- Average transaction value
- Session variances
- Speed metrics

**Features**:
- Date range selector
- Export to Excel/PDF
- Scheduled reports (email)
- Custom report builder
- Chart visualizations
- Downloadable charts

**Acceptance Criteria**:
- [ ] Reports generated < 10 seconds
- [ ] Export includes all data
- [ ] Charts interactive
- [ ] Scheduled reports sent on time
- [ ] Mobile view readable

---

### 4.3 Authentication & User Management

#### 4.3.1 Authentication Flow

**Description**: Secure authentication dengan Supabase Auth

**User Story**:
> Sebagai user, saya ingin login dengan aman dan mudah

**Requirements**:

**Registration**:
- Email + password
- Email verification required
- Password requirements:
  - Min 8 characters
  - Mix of letters, numbers, symbols
- Terms & conditions acceptance
- Auto-create profile record

**Login**:
- Email + password
- "Remember me" option
- Password reset link
- Social login (future):
  - Google
  - Facebook

**Password Reset**:
- Request reset via email
- Secure reset token
- Token expiry (1 hour)
- New password form
- Confirmation email

**Security**:
- Rate limiting (max 5 attempts per 15 min)
- Session management dengan JWT
- Automatic logout after inactivity (30 min)
- Device tracking
- Suspicious activity detection

**Acceptance Criteria**:
- [ ] Email verification working
- [ ] Password reset functional
- [ ] Rate limiting enforced
- [ ] Session persisted correctly
- [ ] Logout clears all data

#### 4.3.2 User Profile Management

**Description**: User dapat manage profile mereka

**Requirements**:
- Edit personal info
- Change password
- Upload avatar
- Notification preferences
- Privacy settings
- Connected devices view
- Activity log

**Acceptance Criteria**:
- [ ] Changes saved immediately
- [ ] Avatar upload/crop working
- [ ] Password change requires old password
- [ ] Email change requires verification

---

### 4.4 Notifications System

#### 4.4.1 Notification Types

**Email Notifications**:
- Registration confirmation
- Email verification
- Booking confirmation
- Payment received
- Booking reminder (24h before)
- Booking cancelled
- Refund processed
- Password reset

**In-App Notifications**:
- New booking received (staff)
- Payment status update
- Booking status change
- Low stock alert (admin)
- Session variance alert (admin)

**Push Notifications** (future):
- Booking reminder
- Payment confirmation
- Check-in reminder

**Requirements**:
- User preferences untuk each type
- Unsubscribe link
- Notification history
- Mark as read/unread
- Bulk actions

**Acceptance Criteria**:
- [ ] Emails delivered < 1 minute
- [ ] In-app real-time updates
- [ ] Preferences respected
- [ ] Unsubscribe working

---

## 5. User Journey Flows

### 5.1 Customer Booking Journey

```
1. Landing Page
   ↓
2. Browse Places (with filters)
   ↓
3. View Place Detail
   ↓
4. Click "Book Now"
   ↓
5. Select Date & Time
   - Check availability
   - Calculate price
   ↓
6. Add Pre-order Items (optional)
   - Browse menu
   - Add to cart
   ↓
7. Fill Customer Info
   - Name, email, phone
   - Guest count
   - Special requests
   ↓
8. Review & Confirm
   - See summary
   - Accept terms
   ↓
9. Select Payment Method
   ↓
10a. Online Payment
    - Redirect to Midtrans
    - Complete payment
    - Webhook received
    - Confirmation sent
    ↓
10b. Cash Payment
    - Reservation created (pending)
    - Pay at venue
    - Kasir confirms
    ↓
11. Confirmation Page
    - Reservation code
    - QR code
    - Details
    - Add to calendar

Success: Customer receives booking confirmation
Alternative: Payment fails → retry or cancel
```

### 5.2 Kasir POS Transaction Journey

```
1. Open Cashier Session
   - Input opening balance
   - Session started
   ↓
2. Customer arrives (walk-in)
   ↓
3. Kasir creates new order
   ↓
4. Select items from POS
   - Search/browse products
   - Add to cart
   - Adjust quantity
   ↓
5. Assign to place (if dine-in)
   ↓
6. Review order
   - Check totals
   - Apply discount (if any)
   ↓
7. Customer ready to pay
   ↓
8. Select payment method
   ↓
9a. Cash Payment
    - Input received amount
    - Calculate change
    - Print receipt
    ↓
9b. Online Payment
    - Generate QR/link
    - Wait for payment
    - Confirm received
    - Print receipt
    ↓
10. Order completed
    - Update inventory (if tracked)
    - Update place status
    ↓
11. Repeat for next customer
    ↓
12. End of shift
    ↓
13. Close Cashier Session
    - Input closing balance
    - Reconcile
    - Generate report

Success: Transaction recorded, receipt printed
Alternative: Payment fails → void order or retry
```

### 5.3 Admin Daily Workflow

```
Morning:
1. Login to dashboard
   ↓
2. Review overnight bookings
   ↓
3. Check today's reservations
   ↓
4. Verify staff assignments
   ↓
5. Review inventory levels

During Day:
6. Monitor real-time dashboard
   ↓
7. Respond to booking inquiries
   ↓
8. Handle cancellations/changes
   ↓
9. Monitor cashier sessions
   ↓
10. Resolve payment issues

Evening:
11. Review end-of-day reports
    ↓
12. Close outstanding items
    ↓
13. Plan for next day
    ↓
14. Export data for accounting

Weekly:
15. Generate weekly reports
    ↓
16. Analyze trends
    ↓
17. Update pricing/promotions
    ↓
18. Staff performance review
```

---

## 6. Payment Architecture

### 6.1 Midtrans Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│           Next.js Application                       │
│                                                     │
│  ┌─────────────────┐      ┌──────────────────────┐│
│  │  Customer UI    │      │   Server Actions     ││
│  │  - Select       │─────>│   - Create payment   ││
│  │    payment      │      │   - Update status    ││
│  │  - Redirect     │<─────│   - Handle webhook   ││
│  └─────────────────┘      └──────────────────────┘│
│            │                         │             │
└────────────┼─────────────────────────┼─────────────┘
             │                         │
             │ Snap Token              │ Webhook
             ↓                         ↓
    ┌──────────────────────────────────────────────┐
    │            Midtrans API                      │
    │  - Snap API (payment page)                   │
    │  - Core API (transaction management)         │
    │  - Webhook notifications                     │
    └──────────────────────────────────────────────┘
                         │
                         │ Payment Status
                         ↓
    ┌──────────────────────────────────────────────┐
    │          Supabase Database                   │
    │  - payments table                            │
    │  - payment_webhooks table                    │
    │  - orders/reservations update                │
    └──────────────────────────────────────────────┘
```

### 6.2 Payment Flow - Online Payment

```typescript
// 1. Create Payment
async function createPayment(data: PaymentData) {
  // Create payment record in database
  const payment = await createPaymentRecord({
    amount: data.amount,
    payable_type: data.type, // 'order' or 'reservation'
    payable_id: data.id,
    payment_method: data.method
  });

  // Create Midtrans transaction
  const snapToken = await midtrans.createTransaction({
    transaction_details: {
      order_id: payment.payment_code,
      gross_amount: data.amount
    },
    customer_details: {
      first_name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone
    },
    enabled_payments: getEnabledPayments(data.method),
    callbacks: {
      finish: `${BASE_URL}/payment/finish?code=${payment.payment_code}`,
      error: `${BASE_URL}/payment/error`,
      pending: `${BASE_URL}/payment/pending`
    }
  });

  // Update payment record dengan snap token
  await updatePayment(payment.id, {
    transaction_id: snapToken.token,
    payment_url: snapToken.redirect_url,
    expired_at: add24Hours()
  });

  return { payment, snapToken };
}

// 2. Handle Webhook
async function handleWebhook(req: Request) {
  // Verify signature
  const signature = req.headers['x-signature'];
  if (!verifyMidtransSignature(signature, req.body)) {
    throw new Error('Invalid signature');
  }

  // Log webhook
  await logWebhook({
    provider: 'midtrans',
    event_type: req.body.transaction_status,
    payload: req.body,
    signature: signature,
    is_verified: true
  });

  // Get payment by order_id
  const payment = await getPaymentByCode(req.body.order_id);
  
  // Update status based on transaction_status
  const statusMap = {
    'capture': 'success',
    'settlement': 'success',
    'pending': 'pending',
    'deny': 'failed',
    'expire': 'expired',
    'cancel': 'failed'
  };

  const newStatus = statusMap[req.body.transaction_status];
  
  // Update payment
  await updatePayment(payment.id, {
    status: newStatus,
    paid_at: newStatus === 'success' ? new Date() : null,
    metadata: req.body
  });

  // Update order/reservation
  if (newStatus === 'success') {
    await handleSuccessfulPayment(payment);
  }

  // Send notification
  await sendPaymentNotification(payment, newStatus);

  return { success: true };
}

// 3. Handle Successful Payment
async function handleSuccessfulPayment(payment: Payment) {
  if (payment.payable_type === 'order') {
    await updateOrder(payment.payable_id, {
      payment_status: 'paid',
      paid_amount: payment.amount,
      status: 'completed'
    });
  } else if (payment.payable_type === 'reservation') {
    await updateReservation(payment.payable_id, {
      payment_status: 'paid',
      paid_amount: payment.amount,
      status: 'confirmed'
    });
    
    // Update place status
    await updatePlaceStatus(reservation.place_id, 'reserved');
  }

  // Generate invoice
  await generateInvoice(payment);

  // Send receipt
  await sendReceipt(payment);
}
```

### 6.3 Payment Flow - Cash Payment

```typescript
// POS Cash Payment
async function processCashPayment(orderId: string, data: CashPaymentData) {
  // Get cashier session
  const session = await getActiveCashierSession(data.cashier_id);
  if (!session) {
    throw new Error('No active cashier session');
  }

  // Create payment record
  const payment = await createPaymentRecord({
    payable_type: 'order',
    payable_id: orderId,
    amount: data.amount,
    payment_method: 'cash',
    status: 'success',
    paid_at: new Date(),
    processed_by: data.cashier_id
  });

  // Update order
  await updateOrder(orderId, {
    payment_status: 'paid',
    paid_amount: data.amount,
    payment_method: 'cash',
    change_amount: data.received_amount - data.amount,
    status: 'completed'
  });

  // Record cash transaction in session
  await createCashTransaction({
    cashier_session_id: session.id,
    transaction_type: 'cash_in',
    amount: data.amount,
    description: `Payment for order ${order.order_number}`,
    reference_type: 'payment',
    reference_id: payment.id,
    created_by: data.cashier_id
  });

  // Update session totals
  await updateCashierSession(session.id, {
    total_cash_in: session.total_cash_in + data.amount,
    total_transactions: session.total_transactions + 1
  });

  // Generate receipt
  const invoice = await generateInvoice(payment);

  return { payment, invoice };
}
```

---

## 7. Security Requirements

### 7.1 Authentication Security

**Requirements**:
- Password hashing dengan bcrypt (Supabase built-in)
- JWT token-based authentication
- Refresh token rotation
- Session expiry (30 minutes inactivity)
- Device fingerprinting
- Suspicious login detection
- Rate limiting:
  - Login: 5 attempts per 15 min
  - Password reset: 3 attempts per hour
  - API calls: 100 per minute per IP

**Implementation**:
- Supabase Auth handles most security
- Additional middleware untuk rate limiting
- Redis untuk tracking attempts (if needed)

### 7.2 Authorization & Access Control

**Requirements**:
- Role-Based Access Control (RBAC)
- Row Level Security (RLS) di Supabase
- API endpoint protection
- Business data isolation (multi-tenancy)
- Principle of least privilege

**RLS Policies**:
- Users can only access their business data
- Customers can only see their own bookings
- Cashiers can only manage their own sessions
- Admins have full business access
- Super admins have system-wide access

### 7.3 Data Security

**Requirements**:
- Encryption at rest (Supabase default)
- Encryption in transit (HTTPS only)
- PII data protection
- Credit card data never stored (PCI-DSS compliance via Midtrans)
- Audit logging semua sensitive operations
- Soft delete untuk data retention
- Regular backups

**Sensitive Data Handling**:
- Customer phone/email encrypted
- Payment metadata sanitized
- Logs tidak contain PII
- GDPR-compliant data export/deletion

### 7.4 API Security

**Requirements**:
- CORS configured properly
- API key authentication untuk webhooks
- Signature verification (Midtrans webhooks)
- Input validation & sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (Content Security Policy)
- CSRF tokens untuk forms

**Rate Limiting**:
```typescript
const rateLimits = {
  auth: {
    login: '5 per 15min',
    register: '3 per hour',
    passwordReset: '3 per hour'
  },
  api: {
    general: '100 per min',
    search: '50 per min',
    payment: '10 per min'
  },
  webhook: {
    midtrans: '1000 per min' // High for production
  }
};
```

### 7.5 Webhook Security

**Requirements**:
- Signature verification wajib
- Idempotent processing (prevent duplicate)
- IP whitelisting (Midtrans IPs only)
- Request logging
- Retry mechanism dengan exponential backoff
- Timeout handling

```typescript
function verifyMidtransSignature(signature: string, payload: any): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const orderId = payload.order_id;
  const statusCode = payload.status_code;
  const grossAmount = payload.gross_amount;
  
  const signatureKey = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');
    
  return signature === signatureKey;
}
```

---

## 8. Performance Requirements

### 8.1 Response Time

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| Page load (initial) | < 2s | < 3s |
| Page navigation | < 500ms | < 1s |
| API response | < 200ms | < 500ms |
| Database query | < 100ms | < 300ms |
| Real-time update | < 500ms | < 1s |
| Payment processing | < 5s | < 10s |
| Report generation | < 10s | < 30s |
| Search results | < 100ms | < 500ms |

### 8.2 Scalability

**Database**:
- Optimized indexes untuk frequent queries
- Connection pooling (Supabase Supavisor)
- Read replicas untuk reporting (if needed)
- Partitioning untuk large tables (future)

**Application**:
- Next.js App Router dengan Server Components
- Static Generation untuk public pages
- Incremental Static Regeneration (ISR)
- Edge caching via Vercel/CDN
- Image optimization (Next.js Image)
- Code splitting & lazy loading

**Real-time**:
- Supabase Realtime channels per business
- Client-side filtering untuk reduce load
- Debounce frequent updates
- Connection pooling

### 8.3 Caching Strategy

**Level 1: Browser Cache**
- Static assets: 1 year
- Images: 1 month
- API responses: per-endpoint basis

**Level 2: CDN Cache**
- Public pages: 1 hour
- Images: 1 week
- API: bypass (dynamic)

**Level 3: Application Cache**
- Redis untuk session data (if needed)
- In-memory cache untuk reference data
- Query result cache (short TTL)

**Level 4: Database Cache**
- Supabase built-in query cache
- Materialized views untuk reports

### 8.4 Monitoring & Observability

**Metrics to Track**:
- Response times (p50, p95, p99)
- Error rates
- Database query performance
- Real-time connection count
- Payment success rate
- User session duration
- Page views & conversions

**Tools**:
- Vercel Analytics (built-in)
- Supabase Dashboard metrics
- Sentry untuk error tracking
- Custom logging ke database

**Alerts**:
- Error rate > 1%
- Response time > 3s
- Payment failure rate > 5%
- Database connection issues
- Webhook processing failures

---

## 9. Testing Requirements

### 9.1 Testing Strategy

**Unit Tests**:
- Business logic functions
- Utility functions
- Data validation
- Calculation formulas
- Target: >80% coverage

**Integration Tests**:
- API endpoints
- Database operations
- Payment integration
- Email sending
- Real-time updates

**E2E Tests**:
- Customer booking flow
- POS transaction flow
- Admin management tasks
- Critical user paths
- Payment scenarios

**Manual Testing**:
- UI/UX testing
- Cross-browser testing
- Mobile responsiveness
- Accessibility testing
- Security penetration testing

### 9.2 Test Scenarios

**Critical Paths** (must be tested):
1. Customer books place → pays online → receives confirmation
2. Customer books place → pays cash → kasir confirms → booking confirmed
3. Kasir creates order → adds items → customer pays cash → receipt printed
4. Admin creates place → uploads images → saves → appears on customer site
5. Payment webhook received → status updated → notification sent

**Edge Cases**:
- Double booking prevention
- Payment timeout handling
- Network failure during payment
- Concurrent place booking
- Cashier session variance
- Stock depletion
- Refund scenarios

### 9.3 Test Data

**Seed Data Required**:
- 1 business (demo cafe)
- 5 places berbagai kategori
- 20 products
- 3 staff accounts (admin, kasir 1, kasir 2)
- 10 customer accounts
- 50 historical orders
- 30 reservations (past & future)

---

## 10. Deployment & DevOps

### 10.1 Deployment Architecture

**Platform**: Vercel (recommended untuk Next.js)

**Environments**:
1. **Development**: Local development
2. **Staging**: Pre-production testing
3. **Production**: Live application

**Infrastructure**:
```
┌────────────────────────────────────────┐
│         Vercel (Next.js App)          │
│  - Edge Network                        │
│  - Serverless Functions                │
│  - Automatic HTTPS                     │
│  - Preview Deployments                 │
└────────────────────────────────────────┘
                │
                │ API Calls
                ↓
┌────────────────────────────────────────┐
│       Supabase (Backend)              │
│  - PostgreSQL Database                 │
│  - Auth Service                        │
│  - Storage (Images)                    │
│  - Realtime                           │
└────────────────────────────────────────┘
                │
                │ Payment API
                ↓
┌────────────────────────────────────────┐
│         Midtrans                       │
│  - Payment Gateway                     │
│  - Webhook Notifications               │
└────────────────────────────────────────┘
```

### 10.2 CI/CD Pipeline

**On Push to Main**:
1. Run linter (ESLint)
2. Run type checking (TypeScript)
3. Run unit tests
4. Run integration tests
5. Build application
6. Deploy to staging
7. Run smoke tests
8. Manual approval
9. Deploy to production

**On Pull Request**:
1. Run all checks
2. Create preview deployment
3. Comment with preview URL

**Tools**:
- GitHub Actions untuk CI/CD
- Vercel automatic deployments
- Database migrations via Supabase CLI

### 10.3 Environment Variables

**Required Variables**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=

# Email (Resend or similar)
EMAIL_API_KEY=
EMAIL_FROM=

# Optional
SENTRY_DSN=
REDIS_URL=
```

### 10.4 Database Migrations

**Strategy**:
- Version controlled SQL migrations
- Supabase migrations folder
- Automated via CI/CD
- Rollback capability

**Process**:
1. Create migration file
2. Test locally
3. Apply to staging
4. Verify functionality
5. Apply to production
6. Monitor for issues

---

## 11. Future Enhancements (v2.0+)

### 11.1 Phase 2 Features

**Loyalty Program**:
- Points system
- Tier-based benefits
- Redemption options
- Birthday rewards

**Advanced Analytics**:
- Predictive analytics
- Customer segmentation
- Revenue forecasting
- Demand planning

**Marketing Automation**:
- Email campaigns
- SMS notifications
- Push notifications
- Promo code system

**Mobile App**:
- React Native app
- Offline mode
- Push notifications
- Faster booking

### 11.2 Phase 3 Features

**Multi-location Support**:
- Chain/franchise management
- Centralized reporting
- Inter-location transfers

**Advanced POS**:
- Kitchen display system
- Table management
- Queue management
- Order tracking

**Integration**:
- Accounting software (Accurate, Jurnal)
- Delivery platforms (GoFood, GrabFood)
- Social media booking
- Google/Apple calendar sync

**AI Features**:
- Chatbot support
- Dynamic pricing
- Demand prediction
- Personalized recommendations

---

## 12. Acceptance Criteria & Launch Readiness

### 12.1 MVP Launch Criteria

**Must Have** ✅:
- [ ] Customer dapat browse dan book tempat
- [ ] Payment Midtrans integration working (minimal QRIS & VA)
- [ ] Kasir dapat process transaksi POS
- [ ] Real-time place status updates
- [ ] Admin dashboard dengan basic reports
- [ ] Email notifications working
- [ ] Mobile responsive
- [ ] Security measures implemented
- [ ] Performance targets met
- [ ] Critical bugs resolved

**Nice to Have** (can be post-launch):
- [ ] Calendar view untuk reservations
- [ ] Advanced reporting
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Multiple payment methods
- [ ] SMS notifications

### 12.2 Launch Checklist

**Technical**:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] SEO optimization completed
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Backup strategy verified
- [ ] SSL certificates configured
- [ ] Domain configured
- [ ] Email deliverability tested

**Business**:
- [ ] Terms & conditions finalized
- [ ] Privacy policy created
- [ ] Refund policy defined
- [ ] Pricing model confirmed
- [ ] Support process established
- [ ] User documentation created
- [ ] Training materials prepared

**Marketing**:
- [ ] Landing page optimized
- [ ] Demo account prepared
- [ ] Marketing materials ready
- [ ] Launch announcement prepared
- [ ] Social media presence established

---

## 13. Success Metrics Post-Launch

### 13.1 KPIs to Track

**Customer Metrics**:
- Daily active users (DAU)
- Monthly active users (MAU)
- Booking conversion rate
- Average booking value
- Customer retention rate
- Net Promoter Score (NPS)

**Business Metrics**:
- Total GMV (Gross Merchandise Value)
- Revenue growth rate
- Average transaction size
- Payment success rate
- Cancellation rate
- Place utilization rate

**Technical Metrics**:
- System uptime
- Average response time
- Error rate
- Payment processing time
- Real-time latency

### 13.2 Success Targets (3 Months Post-Launch)

- 100+ active businesses
- 10,000+ monthly bookings
- 95%+ payment success rate
- 99.5%+ system uptime
- < 5% cancellation rate
- NPS > 50

---

## 14. Support & Maintenance

### 14.1 Support Channels

- Email: support@[app-name].com
- In-app chat (future)
- Knowledge base/FAQ
- Video tutorials
- Response time: < 4 hours (business hours)

### 14.2 Maintenance Windows

- Regular updates: Weekly (Sunday 2-4 AM WIB)
- Emergency patches: As needed
- Database maintenance: Monthly
- Backup verification: Weekly

### 14.3 Monitoring & Alerts

**24/7 Monitoring**:
- System health checks
- Error rate monitoring
- Payment gateway status
- Database performance
- Real-time connection health

**Alert Recipients**:
- Critical: On-call engineer (SMS + Email)
- High: Dev team (Email)
- Medium: Team Slack channel
- Low: Daily digest email

---

## 15. Conclusion

Document ini mendefinisikan requirements lengkap untuk aplikasi Web Kasir + Reservasi Tempat. Implementasi akan mengikuti pendekatan iteratif dengan MVP focus pada core features: booking, payment, dan POS.

**Next Steps**:
1. Review dan approval PRD ini
2. Finalisasi design mockups (lihat design.md)
3. Setup development environment
4. Sprint planning dan task breakdown
5. Begin development (Sprint 1: Auth & Database setup)

**Timeline Estimate**:
- Sprint 0 (Setup): 1 week
- Sprint 1-2 (MVP Core): 4 weeks
- Sprint 3-4 (Integration & Testing): 4 weeks
- Sprint 5 (Polish & Launch Prep): 2 weeks
- **Total**: ~11 weeks untuk MVP

**Team Required**:
- 1 Full-stack Developer (Next.js + Supabase)
- 1 UI/UX Designer (part-time)
- 1 QA Engineer (part-time)
- 1 Product Manager (part-time)

---

**Document Version**: 1.0  
**Last Updated**: 30 Juli 2026  
**Status**: Ready for Review  
**Next Review Date**: TBD after stakeholder approval
