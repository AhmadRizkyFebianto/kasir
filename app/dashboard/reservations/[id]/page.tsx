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
      guest_email,
      guest_phone,
      total_amount,
      status,
      payments (status, amount, order_id)
    `)
    .eq('id', params.id)
    .single();

  if (!reservation) {
    return notFound();
  }

  const paymentStatus = Array.isArray(reservation.payments) 
    ? reservation.payments[0]?.status 
    : (reservation.payments as any)?.status;
  
  const amount = reservation.total_amount * 1.11;

  const handleMidtransPayment = async (formData: FormData) => {
    'use server';
    const guestName = formData.get('guestName') as string;
    const guestEmail = formData.get('guestEmail') as string;
    const guestPhone = formData.get('guestPhone') as string;
    
    const redirectUrl = `/payment/pay?reservation_id=${params.id}&guest_name=${encodeURIComponent(guestName)}&guest_email=${encodeURIComponent(guestEmail)}&guest_phone=${encodeURIComponent(guestPhone)}&amount=${amount}`;
    return { redirectUrl };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Detail Reservasi</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="mb-2"><strong>ID:</strong> {reservation.id}</p>
        <p className="mb-2"><strong>Kode:</strong> {reservation.reservation_code}</p>
        <p className="mb-2"><strong>Pelanggan:</strong> {reservation.guest_name}</p>
        {reservation.guest_email && <p className="mb-2"><strong>Email:</strong> {reservation.guest_email}</p>}
        {reservation.guest_phone && <p className="mb-2"><strong>Phone:</strong> {reservation.guest_phone}</p>}
        <p className="mb-2"><strong>Status:</strong> <span className="px-2 py-1 rounded text-sm font-semibold">{reservation.status}</span></p>
        <p className="mb-2"><strong>Total:</strong> {formatCurrency(amount)}</p>
        {paymentStatus && <p className="mb-2"><strong>Payment Status:</strong> <span className="px-2 py-1 rounded text-sm font-semibold">{paymentStatus}</span></p>}
      </div>
      
      {paymentStatus !== 'paid' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">Bayar dengan Midtrans</h3>
          <form action={handleMidtransPayment}>
            <input type="hidden" name="guestName" value={reservation.guest_name} />
            <input type="hidden" name="guestEmail" value={reservation.guest_email || ''} />
            <input type="hidden" name="guestPhone" value={reservation.guest_phone || ''} />
            <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              Bayar Sekarang via Midtrans
            </button>
          </form>
        </div>
      )}
      
      <div className="flex gap-3">
        <Link href="/dashboard/reservations" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          Kembali
        </Link>
        {paymentStatus === 'paid' && (
          <Link href={`/payment/status?order_id=${reservation.payments[0]?.order_id || reservation.payments[0]?.id}`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Lihat Status Pembayaran
          </Link>
        )}
      </div>
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
