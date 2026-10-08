# Product Requirement Document (PRD)
## Web Kasir (POS)

**Version**: 2.0  
**Last Updated**: 6 Oktober 2026  
**Status**: Updated for POS-only System  
**Previous Version**: 1.0 (Web Kasir + Reservasi Tempat)

---

## 1. Product Overview

### 1.1 Executive Summary

Web Kasir (POS) adalah aplikasi SaaS full-stack untuk sistem Point of Sale dan manajemen transaksi harian. Aplikasi ini dirancang untuk bisnis ritel, restoran, cafe, dan usaha kecil menengah di Indonesia yang membutuhkan sistem kasir yang mudah digunakan dengan fitur cetak struk dan laporan keuangan.

### 1.2 Problem Statement

Bisnis seperti toko, warung, cafe, restoran, dan usaha ritel sering menghadapi:

- **Manajemen transaksi yang sulit**: Sistem manual via catatan kertas rentan error dan kehilangan data
- **Tidak ada struk pembelian**: Tidak ada bukti transaksi yang resmi
- **Laporan keuangan manual**: Laporan harian/mingguan/bulanan memakan waktu
- **Data terfragmentasi**: Transaksi tidak ter-record dengan baik
- **Proses pembayaran tidak terstandard**: Kesulitan tracking pendapatan

### 1.3 Solution

Platform POS terpadu yang menyediakan:

✅ **POS System** untuk transaksi walk-in dengan interface yang cepat dan mudah  
✅ **Cetak struk pembelian** dengan format yang profesional  
✅ **Multi-role access** (Kasir, Admin)  
✅ **CMS riwayat pembelian** dengan filter harian, mingguan, dan bulanan  
✅ **Comprehensive reporting** untuk business insights  
✅ **Mobile-responsive** untuk akses dari device apapun

### 1.4 Success Metrics

**Business Metrics**:
- Reduce transaction errors < 1%
- Increase transaction processing speed by 50%
- Reduce daily report preparation time by 80%
- Improve customer satisfaction score > 4.5/5

**Technical Metrics**:
- Page load time < 2 seconds
- Transaction processing time < 2 seconds
- System uptime > 99.5%
- Payment success rate > 95%

---

## 2. Target Users & Personas

### 2.1 Business Owners (Admin)

**Profile**: Pemilik bisnis ritel/restoran/cafe, Usia 25-50 tahun, Tech-savvy

**Goals**: Monitoring pendapatan, Mengelola staff, Mengatur pricing, Data analytics

**Pain Points**: Tracking revenue harian, Operational metrics, Manual reporting

### 2.2 Kasir/Staff

**Profile**: Staff kasir, Usia 18-35 tahun, Familiar dengan sistem kasir digital

**Goals**: Proses transaksi cepat, Mudah mencatat penjualan, Clear visibility pembayaran, Minimal error

**Pain Points**: Sistem rumit dan lambat, Salah hitung kembalian, Sulit tracking order history

---

## 3. User Roles & Permissions

### 3.1 Permission Matrix

| Feature | Cashier | Admin |
|---------|---------|-------|
| Create walk-in order | ✅ | ✅ |
| View own orders | ✅ | ✅ |
| View all orders | ❌ | ✅ |
| Process payment | ✅ | ✅ |
| Refund transaction | ❌ | ✅ |
| View products | ✅ | ✅ |
| Manage products | ❌ | ✅ |
| Update stock | ✅ | ✅ |
| Open/close session | ✅ | ✅ |
| View own session history | ✅ | ✅ |
| View all sessions | ❌ | ✅ |
| View own transactions | ✅ | ✅ |
| View business reports | ❌ | ✅ |
| Export data | ❌ | ✅ |
| Update profile | ✅ | ✅ |
| Manage users | ❌ | ✅ |
| Business settings | ❌ | ✅ |

**Cashier**: Staff yang handle transaksi harian. Akses POS dan cashier session management. Bisa buka/tutup shift sendiri. Melihat transaksi mereka sendiri.

**Admin**: Pemilik atau manager bisnis. Full access ke business data. Manage staff dan configuration. View semua reports dan transactions.

---

## 4. Feature Requirements

### 4.1 POS (Point of Sale)

#### 4.1.1 POS Interface

**User Story**: Sebagai kasir, saya ingin interface POS yang cepat dan mudah agar saya bisa melayani customer dengan efisien

**Layout**: Top (session info), Left (categories), Center (products), Right (cart/receipt preview)

**Product Selection**: Click to add, Quantity (+/-), Variants, Special notes, Search by name/SKU, Hotkeys (F1-F12)

**Order Summary**: Line items, Subtotal, Tax, Discount, Total, Payment breakdown

**Payment**: Cash (received input, auto change), Online (QRIS, E-wallet, VA), Split payment

**Hot Keys**: F1 (new order), F2 (payment), F3 (search), ESC (cancel), Ctrl+P (print)

**Acceptance Criteria**: Product search < 100ms, Calculation accurate, Receipt print < 3s, Keyboard shortcuts working, Mobile responsive, No lag dengan 100+ items

#### 4.1.2 Cashier Session Management

**Open Session**: Input opening balance, Session code auto-generate

**During Session**: Dashboard showing duration, transactions count, sales amount, cash received, expected balance

**Close Session**: Input closing balance, Calculate difference, Reconciliation report, Generate shift report

---

## 5. Payment Architecture

### 5.1 Midtrans Integration

**Flow**: Create payment → Generate QR/Snap token → Customer pays → Webhook confirmation → Update order → Print receipt

### 5.2 Receipt Printing

**Required Info**: Business name/logo, Receipt ID, Date&Time, Items list, Subtotal, Tax, Discount, Total, Payment method, Cashier name, Thank you message

---

## 6. Reporting & Analytics

### 6.1 Daily Sales Report

**Content**: Total transactions, Total sales amount, Breakdown by payment method, Top 10 products

### 6.2 Weekly/Monthly Sales Report

**Content**: Daily breakdown, Total, Comparison (week-over-week/month-over-month), Category performance

### 6.3 Product Sales Report

**Content**: Product name/SKU, Quantity sold, Revenue, Top selling periods

---

## 7. Database Schema

### 7.1 Tables

**users**: id, email, password_hash, role, business_id, created_at

**businesses**: id, name, slug, address, phone, owner_id, settings, created_at

**cashier_sessions**: id, cashier_id, business_id, start_balance, end_balance, status, started_at, closed_at

**orders**: id, order_number, business_id, cashier_id, total_amount, paid_amount, payment_status, payment_method, customer_name, customer_phone, status, created_at, paid_at

**order_items**: id, order_id, product_id, product_name, quantity, unit_price, subtotal, notes

**products**: id, business_id, name, sku, category, price, stock, stock_tracking, image_url, active, created_at, updated_at

**payments**: id, order_id, amount, payment_method, payment_status, midtrans_txn_id, midtrans_status, created_at, paid_at

**payments_webhooks**: id, payment_id, payload, status, processed_at

**reports**: id, business_id, report_type, date_range, data, generated_at

---

## 8. Performance Requirements

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| Page load | < 2s | < 3s |
| Page navigation | < 500ms | < 1s |
| API response | < 200ms | < 500ms |
| Database query | < 100ms | < 300ms |
| Product search | < 100ms | < 200ms |
| Order creation | < 500ms | < 1s |
| Payment processing | < 5s | < 10s |
| Receipt print | < 3s | < 5s |
| Report generation | < 5s | < 10s |

---

## 9. Testing Requirements

### 9.1 Test Scenarios

**Critical Paths**:
1. Kasir creates order → adds items → customer pays cash → receipt printed
2. Kasir creates order → adds items → customer pays online → receipt printed
3. Admin creates product → saves → appears in POS menu
4. Cashier opens session → processes transactions → closes session
5. Admin generates daily/weekly/monthly report

**Edge Cases**: Payment timeout, Network failure, Cash shortage, Order cancellation, Stock depletion

---

## 10. Success Metrics Post-Launch

### 10.1 Success Targets (3 Months Post-Launch)

- 50+ active businesses
- 5,000+ monthly transactions
- 95%+ payment success rate
- 99.5%+ system uptime
- NPS > 40

---

## 11. Conclusion

Document ini mendefinisikan requirements lengkap untuk aplikasi Web Kasir (POS). Implementasi akan mengikuti pendekatan iteratif dengan MVP focus pada core features: POS, payment, dan reporting.

**Timeline Estimate**: ~10 weeks untuk MVP

---

**Document Version**: 2.0  
**Last Updated**: 6 Oktober 2026  
**Status**: Updated for POS-only System  
**Previous Version**: 1.0 (Web Kasir + Reservasi Tempat)
