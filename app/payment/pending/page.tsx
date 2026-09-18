import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

async function PendingPaymentPage({ searchParams }: { searchParams: { order_id: string } }) {
  const { order_id } = searchParams;

  if (!order_id) {
    redirect('/dashboard/reservations?error=no_order_id');
  }

  const supabase = await createClient();
  
  // Get payment details
  const { data: payment } = await supabase
    .from('payments')
    .select('*, reservation:reservations(id, reservation_code, guest_name, total_amount)')
    .eq('order_id', order_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!payment) {
    redirect('/dashboard/reservations?error=payment_not_found');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Sedang Diproses</h1>
        <p className="text-gray-600 mb-6">Silakan tunggu sebentar. Status pembayaran akan diperbarui otomatis.</p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="font-mono text-gray-900">{order_id}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(payment.amount)}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">Status saat ini: <span className="font-semibold text-yellow-600">Pending</span></p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Penting:</strong> Jangan tutup halaman ini sampai pembayaran selesai diproses.
          </p>
        </div>
        
        <Link 
          href="/dashboard/reservations"
          className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Kembali ke Dashboard Reservasi
        </Link>
      </div>
    </div>
  );
}

export default function PendingPaymentWrapper({ searchParams }: { searchParams: { order_id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PendingPaymentPage searchParams={searchParams} />
    </Suspense>
  );
}
