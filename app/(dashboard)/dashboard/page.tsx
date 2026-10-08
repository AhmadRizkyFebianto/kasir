import { getDashboardMetrics } from "@/lib/dashboard/queries";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(metrics.todayRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+12% dari kemarin</span>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.todayTransactions}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendapatan Bulan Ini</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(metrics.thisMonthRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transaksi Pending</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{metrics.pendingPayments}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Transaksi Terakhir</h2>
        <div className="space-y-3">
          {metrics.recentOrders.length > 0 ? (
            metrics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{order.order_number || `ORD-${order.id.slice(-6).toUpperCase()}`}</p>
                  <p className="text-sm text-gray-600">{order.created_at}</p>
                </div>
                <div className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-gray-500">Belum ada transaksi</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Produk Terlaris</h2>
        <div className="space-y-3">
          {metrics.topProducts.length > 0 ? (
            metrics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">{index + 1}</div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                </div>
                <div className="text-gray-900">{product.total_quantity} terjual</div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-gray-500">Belum ada data penjualan</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link href="/dashboard/pos" className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50">
          <ShoppingBag className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Buka POS</p>
            <p className="text-sm text-gray-600">Mulai transaksi</p>
          </div>
        </Link>
        <Link href="/dashboard/orders" className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Orders</p>
            <p className="text-sm text-gray-600">Lihat history</p>
          </div>
        </Link>
        <Link href="/dashboard/reports" className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">Laporan</p>
            <p className="text-sm text-gray-600">Lihat statistik</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
