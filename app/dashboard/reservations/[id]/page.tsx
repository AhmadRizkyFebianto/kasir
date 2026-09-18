import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

async function ReservationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: reservation } = await supabase
    .from('reservations')
    .select(`
      id,
      reservation_code,
      guest_name,
      total_amount,
      status,
      payments (status)
    `)
    .eq('id', params.id)
    .single();

  if (!reservation) {
    return notFound();
  }

  const paymentStatus = Array.isArray(reservation.payments) 
    ? reservation.payments[0]?.status 
    : (reservation.payments as any)?.status;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Detail Reservasi</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>ID: {reservation.id}</p>
        <p>Kode: {reservation.reservation_code}</p>
        <p>Pelanggan: {reservation.guest_name}</p>
        <p>Status: {reservation.status}</p>
        <p>Total: {formatCurrency(reservation.total_amount * 1.11)}</p>
        <p>Payment Status: {paymentStatus}</p>
      </div>
      <Link href="/dashboard/reservations" className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
        Kembali
      </Link>
    </div>
  );
}

export default function ReservationDetailWrapper({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ReservationDetailPage params={params} />
    </Suspense>
  );
}
