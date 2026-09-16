'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/actions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const activeReservationStatuses = ['pending', 'confirmed', 'checked_in'];

export async function createReservation(formData: FormData) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return { error: 'Anda harus login terlebih dahulu' };

  const placeId = String(formData.get('place_id') || '');
  const startTime = new Date(String(formData.get('start_time') || ''));
  const endTime = new Date(String(formData.get('end_time') || ''));
  const notes = String(formData.get('notes') || '').trim();

  if (!placeId || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { error: 'Data reservasi tidak valid' };
  }

  if (startTime < new Date()) return { error: 'Tidak dapat memesan waktu yang sudah lewat' };
  if (endTime <= startTime) return { error: 'Waktu selesai harus lebih dari waktu mulai' };

  const durationHours = Math.ceil((endTime.getTime() - startTime.getTime()) / 3_600_000);
  if (durationHours <= 0) return { error: 'Durasi reservasi tidak valid' };

  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('id, price_per_hour, status')
    .eq('id', placeId)
    .single();

  if (placeError || !place) return { error: 'Tempat tidak ditemukan' };
  if (place.status === 'maintenance') return { error: 'Tempat sedang maintenance' };

  const { data: overlaps, error: overlapError } = await supabase
    .from('reservations')
    .select('id')
    .eq('place_id', placeId)
    .in('status', activeReservationStatuses)
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString())
    .limit(1);

  if (overlapError) return { error: 'Gagal mengecek ketersediaan tempat' };
  if (overlaps?.length) return { error: 'Tempat sudah dibooking pada waktu tersebut' };

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      place_id: placeId,
      customer_id: user.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: durationHours,
      total_amount: Number(place.price_per_hour) * durationHours,
      status: 'pending',
      notes: notes || null,
    })
    .select('id')
    .single();

  if (error || !reservation) {
    console.error('Error creating reservation:', error);
    return { error: 'Gagal membuat reservasi' };
  }

  revalidatePath('/places');
  revalidatePath(`/places/${placeId}`);
  redirect(`/reservations/${reservation.id}`);
}

export async function getMyReservations() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('reservations')
    .select(`*, places (id, name, number, image_url, place_categories (name))`)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return data || [];
}

export async function getReservationById(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      places (id, name, number, capacity, price_per_hour, description, facilities, image_url, place_categories (name)),
      payments (id, amount, method, status, paid_at)
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }

  return data;
}

export async function cancelReservation(reservationId: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { error: 'Anda harus login terlebih dahulu' };

  const { data: reservation } = await supabase
    .from('reservations')
    .select('status')
    .eq('id', reservationId)
    .eq('customer_id', user.id)
    .single();

  if (!reservation) return { error: 'Reservasi tidak ditemukan' };
  if (reservation.status !== 'pending') return { error: 'Hanya reservasi pending yang dapat dibatalkan' };

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', reservationId);

  if (error) return { error: 'Gagal membatalkan reservasi' };

  revalidatePath('/reservations');
  return { success: true };
}
