import { Suspense } from 'react';
import { Search, Filter, Calendar, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { getReservationsForKasir, getReservationStats, getCategoriesForFilter } from '@/lib/reservations/kasir-queries';
import { ReservationTable } from '@/components/reservations/ReservationTable';
import { exportReservationsCSV } from '@/lib/reservations/kasir-actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    date?: string;
    status?: string;
    search?: string;
    quick?: string;
    category_id?: string;
    payment_method?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  };
}

const paymentMethodOptions = [
  { value: 'cash', label: 'Tunai' },
  { value: 'qris', label: 'QRIS' },
  { value: 'bank_transfer', label: 'Transfer' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'virtual_account', label: 'VA' },
];

const categoryOptions = [
  { value: '1', label: 'Standard' },
  { value: '2', label: 'Deluxe' },
  { value: '3', label: 'Luxury' },
];

async function ReservationStats() {
  const stats = await getReservationStats();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Hari Ini</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="rounded-full bg-yellow-100 p-3">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Checked In</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.checked_in}</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="mt-2 text-3xl font-bold text-gray-600">{stats.completed}</p>
          </div>
          <div className="rounded-full bg-gray-100 p-3">
            <CheckCircle className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ReservationList({ searchParams }: PageProps) {
  const [reservations, categories] = await Promise.all([
    getReservationsForKasir({
      date: searchParams.date,
      status: searchParams.status,
      search: searchParams.search,
      quick: searchParams.quick,
      category_id: searchParams.category_id,
      payment_method: searchParams.payment_method,
      sort_by: searchParams.sort_by,
      sort_order: searchParams.sort_order as 'asc' | 'desc',
    }),
    getCategoriesForFilter(),
  ]);

  const categoryOptions = categories.map((c: any) => ({ value: c.id, label: c.name }));
  return <ReservationTable reservations={reservations} categoryOptions={categoryOptions} />;
}

export default function ReservationsPage({ searchParams }: PageProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Reservasi</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kelola reservasi customer, check-in, check-out, dan konfirmasi pembayaran
        </p>
      </div>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        }
      >
        <ReservationStats />
      </Suspense>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow-md">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Cari kode booking, nama..."
              defaultValue={searchParams.search}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              name="category_id"
              defaultValue={searchParams.category_id || ''}
              className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Kategori</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              name="payment_method"
              defaultValue={searchParams.payment_method || ''}
              className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Metode</option>
              <option value="cash">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="bank_transfer">Transfer</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="virtual_account">VA</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700 md:col-span-6"
          >
            Terapkan Filter
          </button>
        </form>
      </div>

      {/* Export Button & Sort Options */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        <div className="flex gap-2">
          <form
            action={async () => {
              'use server';
              await exportReservationsCSV();
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <DollarSign className="h-4 w-4" />
              Export CSV
            </button>
          </form>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">Urutkan:</span>
          <select name="sort_by" defaultValue={searchParams.sort_by || 'start_time'} className="rounded-lg border border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="start_time">Waktu Mulai</option>
            <option value="created_at">Dibuat</option>
          </select>
          <select name="sort_order" defaultValue={searchParams.sort_order || 'desc'} className="rounded-lg border border-gray-300 py-1 pl-3 pr-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="desc">Terbaru</option>
            <option value="asc">Terlama</option>
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <a
          href={`/dashboard/reservations?date=${today}&status=all`}
          className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Hari Ini
        </a>
        <a
          href={`/dashboard/reservations?date=${today}&status=all&quick=unpaid`}
          className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Menunggu Bayar
        </a>
        <a
          href={`/dashboard/reservations?date=${today}&status=all&quick=ready`}
          className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Siap Check-in
        </a>
        <a
          href={`/dashboard/reservations?date=${today}&status=all&quick=active`}
          className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Berlangsung
        </a>
        <a
          href="/dashboard/reservations?status=all"
          className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Semua Reservasi
        </a>
      </div>

      {/* Reservations Table */}
      <Suspense
        fallback={
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading reservations...</p>
          </div>
        }
      >
        <ReservationList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}