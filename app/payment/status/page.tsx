import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPaymentById } from '@/lib/reservations/payment-queries';

async function PaymentStatusPage({ searchParams }: { searchParams: { order_id: string } }) {
  const { data: payment, error } = await getPaymentById(searchParams.order_id);

  if (error || !payment) {
    return notFound();
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pembayaran Berhasil!';
      case 'failed':
        return 'Pembayaran Gagal';
      case 'pending':
        return 'Menunggu Pembayaran';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className={`inline-block p-4 rounded-full mb-6 ${getStatusColor(payment.status)}`}>
          {payment.status === 'paid' && (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {payment.status === 'failed' && (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {payment.status === 'pending' && (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{getStatusMessage(payment.status)}</h1>
        
        <div className="space-y-4 text-left">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600">ID Transaksi</p>
            <p className="font-medium">{payment.id}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600">Reservasi</p>
            <p className="font-medium">
              {payment.reservation?.reservation_code || '-'}
            </p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600">Jumlah</p>
            <p className="font-bold text-xl text-blue-600">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600">Metode Pembayaran</p>
            <p className="font-medium">
              {payment.payment_method?.name || '-'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Waktu Pembuatan</p>
            <p className="font-medium">
              {new Date(payment.created_at).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {payment.status === 'paid' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-green-600 mb-4">Terima kasih atas pembayaran Anda!</p>
            <a href="/dashboard/reservations" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Lihat Reservasi Saya
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusWrapper({ searchParams }: { searchParams: { order_id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PaymentStatusPage searchParams={searchParams} />
    </Suspense>
  );
}
