'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function createAuditLog(action: string, tableName: string, recordId?: string, oldData?: any, newData?: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData,
        new_data: newData,
      });
    
    if (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}

async function requireKasir() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'kasir')) {
    return { supabase, user: null, error: 'Forbidden' };
  }

  return { supabase, user, error: null };
}

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export async function checkInReservation(reservationId: string) {
  const { supabase, user, error: authError } = await requireKasir();
  if (!user) return { error: authError };

  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('status, place_id, payments(status)')
    .eq('id', reservationId)
    .single();

  if (fetchError) console.error('Fetch reservation for check-in failed:', fetchError);
  if (!reservation) return { error: 'Reservation not found' };
  if (reservation.status !== 'confirmed') return { error: 'Only confirmed reservations can be checked in' };

  const payment = first(reservation.payments);
  if (!payment || payment.status !== 'paid') return { error: 'Payment must be paid before check-in' };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'checked_in', updated_at: now })
    .eq('id', reservationId);

  if (error) {
    console.error('Check-in reservation failed:', error);
    return { error: 'Failed to check in reservation' };
  }

  await createAuditLog('CHECK_IN', 'reservations', reservationId, { status: reservation.status }, { status: 'checked_in' });

  const { error: placeError } = await supabase.from('places').update({ status: 'occupied' }).eq('id', reservation.place_id);
  if (placeError) console.error('Update place occupied failed:', placeError);

  revalidatePath('/dashboard/reservations');
  return { success: true };
}

export async function checkOutReservation(reservationId: string) {
  const { supabase, user, error: authError } = await requireKasir();
  if (!user) return { error: authError };

  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('status, place_id, payments(status)')
    .eq('id', reservationId)
    .single();

  if (fetchError) console.error('Fetch reservation for check-out failed:', fetchError);
  if (!reservation) return { error: 'Reservation not found' };
  if (reservation.status !== 'checked_in') return { error: 'Only checked-in reservations can be checked out' };

  const payment = first(reservation.payments);
  if (!payment || payment.status !== 'paid') return { error: 'Payment must be paid before check-out' };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'completed', updated_at: now })
    .eq('id', reservationId);

  if (error) {
    console.error('Check-out reservation failed:', error);
    return { error: 'Failed to check out reservation' };
  }

  await createAuditLog('CHECK_OUT', 'reservations', reservationId, { status: reservation.status }, { status: 'completed' });

  const { error: placeError } = await supabase.from('places').update({ status: 'available' }).eq('id', reservation.place_id);
  if (placeError) console.error('Update place available failed:', placeError);

  revalidatePath('/dashboard/reservations');
  return { success: true };
}

export async function cancelReservation(reservationId: string, _reason?: string) {
  const { supabase, user, error: authError } = await requireKasir();
  if (!user) return { error: authError };

  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('status, place_id, payments(status)')
    .eq('id', reservationId)
    .single();

  if (fetchError) console.error('Fetch reservation for cancel failed:', fetchError);
  if (!reservation) return { error: 'Reservation not found' };
  if (reservation.status === 'completed' || reservation.status === 'cancelled') {
    return { error: 'Cannot cancel completed or already cancelled reservations' };
  }

  const payment = first(reservation.payments);
  if (payment?.status === 'paid') return { error: 'Paid reservations must be refunded manually before cancel' };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: now })
    .eq('id', reservationId);

  if (error) {
    console.error('Cancel reservation failed:', error);
    return { error: 'Failed to cancel reservation' };
  }

  await createAuditLog('CANCEL', 'reservations', reservationId, { status: reservation.status }, { status: 'cancelled' });

  if (reservation.status === 'checked_in') {
    const { error: placeError } = await supabase.from('places').update({ status: 'available' }).eq('id', reservation.place_id);
    if (placeError) console.error('Update place available after cancel failed:', placeError);
  }

  revalidatePath('/dashboard/reservations');
  return { success: true };
}

const paymentMethods = ['cash', 'qris', 'virtual_account', 'e_wallet', 'bank_transfer'] as const;
type PaymentMethod = (typeof paymentMethods)[number];

export async function confirmPayment(reservationId: string, method: PaymentMethod = 'cash') {
  if (!paymentMethods.includes(method)) return { error: 'Invalid payment method' };
  const { supabase, user, error: authError } = await requireKasir();
  if (!user) return { error: authError };

  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('status, total_amount, payments(id, status)')
    .eq('id', reservationId)
    .single();

  if (fetchError) console.error('Fetch reservation for payment failed:', fetchError);
  if (!reservation) return { error: 'Reservation not found' };
  if (reservation.status === 'cancelled') return { error: 'Cannot pay cancelled reservation' };
  if (reservation.status === 'completed') return { error: 'Cannot pay completed reservation' };

  const payment = first(reservation.payments);
  const now = new Date().toISOString();

  if (payment) {
    if (payment.status === 'paid') return { error: 'Payment already paid' };
    const { error } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: now, updated_at: now })
      .eq('id', payment.id);
    if (error) {
      console.error('Confirm payment failed:', error);
      return { error: 'Failed to confirm payment' };
    }
  } else {
    const { error } = await supabase.from('payments').insert({
      reservation_id: reservationId,
      amount: reservation.total_amount,
      method,
      status: 'paid',
      paid_at: now,
    });
    if (error) {
      console.error('Create reservation payment failed:', error);
      return { error: 'Failed to create payment' };
    }
  }

  if (reservation.status === 'pending') {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'confirmed', updated_at: now })
      .eq('id', reservationId);
    if (error) {
      console.error('Confirm reservation after payment failed:', error);
      return { error: 'Payment paid, but failed to confirm reservation' };
    }
  }

  await createAuditLog('PAYMENT_CONFIRM', 'payments', payment?.id || null, null, { status: 'paid' });

  revalidatePath('/dashboard/reservations');
  return { success: true };
}

export async function exportReservationsCSV() {
  const supabase = await createClient();
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select(`
      id,
      start_time,
      end_time,
      duration_hours,
      status,
      total_amount,
      notes,
      created_at,
      profiles:customer_id (full_name, phone, email),
      places (name, number),
      payments (id, status, method, amount)
    `)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Fetch reservations for export failed:', error);
    return { error: 'Gagal mengambil data reservasi' };
  }

  if (!reservations || reservations.length === 0) {
    return { error: 'Tidak ada reservasi untuk diekspor' };
  }

  const headers = [
    'Kode Booking',
    'Waktu Mulai',
    'Waktu Selesai',
    'Durasi (Jam)',
    'Status',
    'Total Amount',
    'Customer',
    'Phone',
    'Email',
    'Tempat',
    'Nomor Tempat',
    'Payment Status',
    'Payment Method',
    'Created At',
  ];

  const rows = reservations.map((r) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const place = Array.isArray(r.places) ? r.places[0] : r.places;
    const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
    return [
      `RSV-${r.id.slice(0, 8).toUpperCase()}`,
      new Date(r.start_time).toLocaleString('id-ID'),
      new Date(r.end_time).toLocaleString('id-ID'),
      r.duration_hours,
      r.status,
      r.total_amount.toString(),
      profile?.full_name || '',
      profile?.phone || '',
      profile?.email || '',
      place?.name || '',
      place?.number || '',
      payment?.status || '',
      payment?.method || '',
      new Date(r.created_at).toLocaleString('id-ID'),
    ].map((field) => `"${String(field ?? '').replace(/"/g, '""')}"`);
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  return { csv: csvContent };
}
