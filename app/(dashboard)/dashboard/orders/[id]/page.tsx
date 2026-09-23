import { getOrder } from '@/lib/orders/actions';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  completed: { label: 'Selesai', color: 'bg-green-50 text-green-700 border border-green-200' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-700 border border-red-200' },
};

const paymentMethodConfig = {
  cash: 'Tunai',
  qris: 'QRIS',
  bank_transfer: 'Transfer Bank',
  midtrans: 'Midtrans',
  e_wallet: 'E-Wallet',
};

async function OrderDetail({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const status = order.status as keyof typeof statusConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail Order</h1>
              <p className="text-gray-600">
                {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: localeId })}
              </p>
            </div>
            <a
              href="/dashboard/orders"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Kembali ke List Order
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    ORD-{order.id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-gray-500">Order ID: {order.id}</p>
                </div>
                <span className={`rounded-lg px-4 py-2 ${statusConfig[status]?.color}`}>
                  {statusConfig[status]?.label || order.status}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Order</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Produk</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Harga</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.order_items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.products?.[0]?.name || `ID: ${item.product_id}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembayaran</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Metode Pembayaran</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {paymentMethodConfig[order.payments?.[0]?.method as keyof typeof paymentMethodConfig] || order.payments?.[0]?.method || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status Pembayaran</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.payments?.[0]?.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bayar</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.payments?.[0]?.amount || order.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-sm font-semibold text-gray-900">{totalItems} produk</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">Total Tagihan</p>
                  <p className="text-2xl font-bold text-primary-600">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kasir</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nama Kasir</p>
                  <p className="text-sm font-medium text-gray-900">{order.profiles?.[0]?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Waktu Transaksi</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(order.created_at), 'dd MMM yyyy HH:mm:ss', { locale: localeId })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;