import { Suspense } from 'react';
import { Search, Filter, DollarSign, ChevronRight } from 'lucide-react';
import { getOrders, getOrdersCount } from '@/lib/orders/queries';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    status?: string;
    search?: string;
    date?: string;
  };
}

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

async function OrderStats({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const count = await getOrdersCount(searchParams);
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function OrderList({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const orders = await getOrders(searchParams);
  const count = await getOrdersCount(searchParams);

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg px-2 py-1' },
    completed: { label: 'Selesai', color: 'bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1' },
  };

  return (
    <div className="mt-6 rounded-lg bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kasir</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ORD-{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: localeId })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusConfig[order.status as keyof typeof statusConfig]?.color || ''}>
                      {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.profiles?.[0]?.full_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/dashboard/orders/${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Detail
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Tidak ada order
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 p-4 text-sm text-gray-500">
        Menampilkan {orders.length} dari {count} order
      </div>
    </div>
  );
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Penjualan
          </h1>
          <p className="text-gray-600">
            Manajemen order penjualan kasir
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="rounded-lg bg-white p-12 text-center shadow-md">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          }
        >
          <OrderStats searchParams={searchParams} />
        </Suspense>

        {/* Filter Section */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
          <form className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Kode order atau produk..."
                    defaultValue={searchParams?.search}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={searchParams?.status || 'all'}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={searchParams?.date}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700"
                >
                  <Filter className="h-5 w-5" />
                  Terapkan Filter
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <a
            href={`/dashboard/orders?date=${today}&status=all`}
            className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Hari Ini
          </a>
          <a
            href="/dashboard/orders?status=all"
            className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Semua Order
          </a>
        </div>

        <Suspense
          fallback={
            <div className="rounded-lg bg-white p-12 text-center shadow-md">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          }
        >
          <OrderList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}