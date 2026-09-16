# Reservation Management for Kasir - Implementation Guide

## Overview

Dokumentasi implementasi sistem manajemen reservasi untuk kasir. Sistem ini memungkinkan kasir untuk melihat, mengelola, check-in, check-out, dan mengkonfirmasi pembayaran reservasi customer.

---

## Features Implemented

### 1. Reservation Queries

**File:** `lib/reservations/kasir-queries.ts`

#### Functions:

**getReservationsForKasir(filters)**
```typescript
// Filters: date, status, search
// Returns: Reservations with customer, place, and payment info
```

**Features:**
- Filter by date
- Filter by status (pending, confirmed, checked_in, completed, cancelled)
- Search by reservation code, customer name, phone, place name
- Includes related data (customer profile, place details, payment status)
- Ordered by start time (newest first)

**getTodayReservations()**
```typescript
// Returns: Today's reservations ordered by start time
```

**getReservationStats()**
```typescript
// Returns: Statistics for today's reservations by status
{
  total: number,
  pending: number,
  confirmed: number,
  checked_in: number,
  completed: number,
  cancelled: number
}
```

---

### 2. Reservation Actions

**File:** `lib/reservations/kasir-actions.ts`

#### Actions:

**checkInReservation(reservationId)**

**Flow:**
1. Verify authentication
2. Get reservation details
3. Validate status (must be 'confirmed')
4. Update reservation status to 'checked_in'
5. Update place status to 'occupied'
6. Revalidate page

**Validation:**
- Only confirmed reservations can be checked in
- User must be authenticated

**checkOutReservation(reservationId)**

**Flow:**
1. Verify authentication
2. Get reservation and payment details
3. Validate status (must be 'checked_in')
4. Validate payment (must be completed)
5. Update reservation status to 'completed'
6. Update place status to 'available'
7. Revalidate page

**Validation:**
- Only checked-in reservations can be checked out
- Payment must be completed first

**cancelReservation(reservationId, reason)**

**Flow:**
1. Verify authentication
2. Get reservation details
3. Validate status (cannot cancel completed/cancelled)
4. Update reservation status to 'cancelled'
5. Add cancellation reason
6. Update place status to 'available' (if checked in)
7. Update payment status to 'cancelled' (if not completed)
8. Revalidate page

**Validation:**
- Cannot cancel completed or already cancelled reservations

**confirmPayment(reservationId)**

**Flow:**
1. Verify authentication
2. Get payment details
3. Validate status (must not be completed)
4. Update payment status to 'completed'
5. Update reservation status to 'confirmed' (if pending)
6. Revalidate page

**Validation:**
- Payment must exist
- Payment must not be already completed

---

### 3. Reservation Table Component

**File:** `components/reservations/ReservationTable.tsx`

#### Features:

**Display:**
- Reservation code
- Customer name & phone
- Place name & number
- Start time (formatted)
- Duration (hours)
- Total amount
- Status badge (color-coded)
- Payment status (Lunas/Pending)
- Actions menu

**Status Colors:**
```typescript
pending: 'bg-yellow-100 text-yellow-800'
confirmed: 'bg-green-100 text-green-800'
checked_in: 'bg-blue-100 text-blue-800'
completed: 'bg-gray-100 text-gray-800'
cancelled: 'bg-red-100 text-red-800'
```

**Actions Menu:**
- Check-in (for confirmed status)
- Check-out (for checked_in status)
- Konfirmasi Bayar (for pending payment)
- Batalkan (for active reservations)

**Interactions:**
- Click three-dot menu to show actions
- Confirmation dialogs for all actions
- Loading states during action execution
- Success/error alerts
- Automatic table refresh after action

---

### 4. Reservation Management Page

**File:** `app/(dashboard)/dashboard/reservations/page.tsx`

#### Layout Structure:

```
┌────────────────────────────────────────────────────┐
│  Manajemen Reservasi                                │
│  Kelola reservasi customer...                       │
├────────────────────────────────────────────────────┤
│  [Stats Cards - 5 columns]                          │
│  Total | Pending | Confirmed | Checked In | Completed│
├────────────────────────────────────────────────────┤
│  [Filters Panel]                                     │
│  Search | Date | Status | [Terapkan Filter]         │
├────────────────────────────────────────────────────┤
│  [Quick Filters]                                     │
│  Hari Ini | Pending Hari Ini | Confirmed | etc.     │
├────────────────────────────────────────────────────┤
│  [Reservations Table]                                │
│  Kode | Customer | Tempat | Waktu | ... | Aksi      │
└────────────────────────────────────────────────────┘
```

#### Components:

**ReservationStats**
- Server Component
- Fetches today's statistics
- 5 metric cards with icons
- Color-coded by status

**ReservationList**
- Server Component
- Fetches filtered reservations
- Passes to ReservationTable component

**Filters Panel:**
- Search input (kode, nama, phone, tempat)
- Date picker (default: today)
- Status dropdown (all, pending, confirmed, etc.)
- Submit button

**Quick Filters:**
- Pre-configured filter links
- "Hari Ini"
- "Pending Hari Ini"
- "Confirmed Hari Ini"
- "Sedang Berlangsung"
- "Semua Reservasi"

#### Features:

**Server-Side Rendering:**
- Dynamic page (force-dynamic)
- Suspense for loading states
- Server Components for data fetching

**Filter Functionality:**
- URL-based filters (searchParams)
- Persistent state via URL
- Browser back/forward support
- Shareable URLs

**Loading States:**
- Skeleton placeholders for stats
- Loading spinner for table
- Optimistic updates

---

## User Flows

### Kasir Check-in Flow

```
1. Kasir buka /dashboard/reservations
2. Filter hari ini + status confirmed
3. Lihat list reservasi yang sudah dikonfirmasi
4. Customer datang
5. Click three-dot menu pada reservasi
6. Click "Check-in"
7. Konfirmasi dialog
8. Reservation status → checked_in
9. Place status → occupied
10. Table refresh otomatis
```

### Kasir Check-out Flow

```
1. Lihat reservasi dengan status checked_in
2. Customer selesai
3. Pastikan payment completed (jika belum, konfirmasi dulu)
4. Click "Check-out"
5. Konfirmasi dialog
6. Reservation status → completed
7. Place status → available
8. Table refresh otomatis
```

### Konfirmasi Pembayaran Flow

```
1. Reservasi dengan payment pending
2. Customer bayar cash di kasir
3. Click "Konfirmasi Bayar"
4. Konfirmasi dialog
5. Payment status → completed
6. Reservation status → confirmed (if was pending)
7. Table refresh otomatis
```

### Pembatalan Reservasi Flow

```
1. Reservasi perlu dibatalkan
2. Click "Batalkan"
3. Input alasan pembatalan
4. Konfirmasi
5. Reservation status → cancelled
6. Payment status → cancelled (if not completed)
7. Place status → available (if was occupied)
8. Table refresh otomatis
```

---

## Database Operations

### Check-in Transaction

```sql
-- 1. Update reservation
UPDATE reservations 
SET status = 'checked_in', updated_at = NOW()
WHERE id = reservation_id;

-- 2. Update place
UPDATE places 
SET status = 'occupied'
WHERE id = place_id;
```

### Check-out Transaction

```sql
-- 1. Verify payment completed
SELECT status FROM payments WHERE reservation_id = reservation_id;

-- 2. Update reservation
UPDATE reservations 
SET status = 'completed', updated_at = NOW()
WHERE id = reservation_id;

-- 3. Update place
UPDATE places 
SET status = 'available'
WHERE id = place_id;
```

### Cancel Transaction

```sql
-- 1. Update reservation
UPDATE reservations 
SET status = 'cancelled', 
    cancellation_reason = reason,
    updated_at = NOW()
WHERE id = reservation_id;

-- 2. Update place (if checked in)
UPDATE places 
SET status = 'available'
WHERE id = place_id;

-- 3. Update payment (if not completed)
UPDATE payments 
SET status = 'cancelled'
WHERE reservation_id = reservation_id 
AND status != 'completed';
```

---

## Security & Authorization

**Authentication:**
- All actions require authenticated user
- Session validated via Supabase Auth

**Authorization:**
- Route protected via middleware
- Only admin & kasir can access
- RLS policies on database level

**Data Validation:**
- Server-side validation for all actions
- Status checks before state changes
- Payment verification for check-out

---

## Error Handling

**Common Errors:**

1. **Unauthorized**
   ```typescript
   return { error: 'Unauthorized' }
   ```

2. **Invalid Status**
   ```typescript
   return { error: 'Only confirmed reservations can be checked in' }
   ```

3. **Payment Not Completed**
   ```typescript
   return { error: 'Payment must be completed before check-out' }
   ```

4. **Already Processed**
   ```typescript
   return { error: 'Cannot cancel completed or already cancelled reservations' }
   ```

**Error Display:**
- Alert dialogs for user feedback
- Console logging for debugging
- Automatic rollback on failure

---

## Performance Optimizations

**Server Components:**
- Data fetching on server
- Reduced client-side JavaScript
- Better initial page load

**Suspense Boundaries:**
- Progressive loading
- Better perceived performance
- Isolated loading states

**Revalidation:**
- Automatic cache invalidation
- Fresh data after mutations
- No manual refresh needed

**Filtering:**
- Client-side search for complex queries
- Server-side for primary filters
- Efficient database queries

---

## Testing Checklist

### Functional Testing

- [ ] View today's reservations
- [ ] Filter by date
- [ ] Filter by status
- [ ] Search by reservation code
- [ ] Search by customer name
- [ ] Search by phone number
- [ ] Check-in confirmed reservation
- [ ] Check-out checked-in reservation
- [ ] Confirm pending payment
- [ ] Cancel active reservation
- [ ] View stats updates
- [ ] Quick filter navigation

### Edge Cases

- [ ] Check-in without confirmation
- [ ] Check-out without payment
- [ ] Cancel completed reservation
- [ ] Cancel already cancelled reservation
- [ ] Multiple check-ins on same reservation
- [ ] Network error during action
- [ ] Invalid reservation ID
- [ ] Concurrent updates

### UI/UX

- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success feedback is shown
- [ ] Table refreshes after action
- [ ] Actions menu opens/closes properly
- [ ] Stats update in real-time
- [ ] Filters work correctly
- [ ] Responsive on mobile
- [ ] Accessible with keyboard
- [ ] Screen reader compatible

---

## Future Enhancements

### Short Term

1. **Notification System**
   - Alert when reservation time approaching
   - Notify on payment received
   - Remind check-out time

2. **Bulk Actions**
   - Bulk check-in
   - Bulk payment confirmation
   - Export selected reservations

3. **Timeline View**
   - Visual timeline of reservations
   - Drag & drop rescheduling
   - Conflict detection

### Medium Term

1. **Advanced Filters**
   - Filter by place category
   - Filter by customer
   - Filter by price range
   - Custom date ranges

2. **Print Functionality**
   - Print reservation list
   - Print individual reservation
   - Print daily report

3. **Notes & Communication**
   - Add notes to reservation
   - Send WhatsApp notification
   - SMS reminders

### Long Term

1. **Analytics Dashboard**
   - Popular times
   - Popular places
   - Revenue by time slot
   - No-show rate

2. **Mobile App**
   - Dedicated kasir mobile app
   - QR code scanning
   - Offline mode

3. **Integration**
   - Calendar sync
   - Accounting software
   - CRM integration

---

## Troubleshooting

### Common Issues

**1. Actions not working**
```
Solution: 
- Check user authentication
- Verify user role (admin/kasir)
- Check network connection
- Verify RLS policies
```

**2. Stats not updating**
```
Solution:
- Refresh the page
- Check date filter
- Verify database connection
- Check server logs
```

**3. Table not refreshing**
```
Solution:
- Check revalidatePath is called
- Verify action completes successfully
- Clear browser cache
- Check for JavaScript errors
```

**4. Payment status not showing**
```
Solution:
- Verify payment record exists
- Check database relationship
- Verify RLS policies
- Check query includes payments
```

---

## API Reference

### Server Actions

**checkInReservation(reservationId: string)**
```typescript
Returns: { success: true } | { error: string }
```

**checkOutReservation(reservationId: string)**
```typescript
Returns: { success: true } | { error: string }
```

**cancelReservation(reservationId: string, reason?: string)**
```typescript
Returns: { success: true } | { error: string }
```

**confirmPayment(reservationId: string)**
```typescript
Returns: { success: true } | { error: string }
```

### Query Functions

**getReservationsForKasir(filters)**
```typescript
Parameters: {
  date?: string,
  status?: string,
  search?: string
}
Returns: Reservation[]
```

**getTodayReservations()**
```typescript
Returns: Reservation[]
```

**getReservationStats()**
```typescript
Returns: {
  total: number,
  pending: number,
  confirmed: number,
  checked_in: number,
  completed: number,
  cancelled: number
}
```

---

## Conclusion

Sistem manajemen reservasi untuk kasir berhasil diimplementasikan dengan fitur lengkap untuk mengelola reservasi customer. Interface intuitif dan optimized untuk workflow kasir sehari-hari.

**Key Features:**
✅ View & filter reservations
✅ Real-time stats dashboard
✅ Check-in & check-out
✅ Payment confirmation
✅ Cancellation with reason
✅ Server-side rendering
✅ Optimistic updates
✅ Error handling
✅ Loading states

**Ready for:**
- Production deployment
- User acceptance testing
- Integration with payment gateway
- Further enhancements

---

**Documentation Version:** 1.0  
**Last Updated:** 2026-07-30  
**Author:** System Implementation Team