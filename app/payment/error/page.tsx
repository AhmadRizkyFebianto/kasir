import { notFound } from 'next/navigation';

async function PaymentErrorPage({ searchParams }: { searchParams: { order_id: string } }) {
  const orderId = searchParams.order_id;

  if (!orderId) {
    return notFound();
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block p-4 rounded-full bg-red-100 text-red-600 mb-6">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">Pembayaran Gagal</h1>
        
        <p className="text-gray-600 mb-6">
          Maaf, terjadi kesalahan saat memproses pembayaran Anda. 
          Silakan coba lagi atau hubungi customer service.
        </p>
        
        <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-red-700 font-medium">Order ID:</p>
          <p className="text-sm text-red-600">{orderId}</p>
        </div>

        <div className="space-y-3">
          <a href="/dashboard/reservations" className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Kembali ke Reservasi
          </a>
          <a href="mailto:support@hotel.com" className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
            Hubungi Customer Service
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentErrorWrapper({ searchParams }: { searchParams: { order_id: string } }) {
  return <PaymentErrorPage searchParams={searchParams} />;
}
