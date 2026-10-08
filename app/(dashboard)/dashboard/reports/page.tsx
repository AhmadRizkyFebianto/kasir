import { getDailySales, getWeeklySales, getMonthlySales, getProductSales } from "@/lib/reports/queries";
import { formatCurrency } from "@/lib/utils";
import { format, parse } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default async function DashboardReportsPage({
  searchParams,
}: {
  searchParams?: { date?: string; view?: string };
}) {
  const date = searchParams?.date || new Date().toISOString().split("T")[0];
  const view = searchParams?.view || "daily";

  const dailySales = await getDailySales(date);
  const weeklySales = await getWeeklySales(
    format(new Date(), "yyyy-MM-01"),
    new Date().toISOString()
  );
  const monthlySales = await getMonthlySales(
    new Date().getFullYear(),
    new Date().getMonth() + 1
  );
  const topProducts = await getProductSales(
    format(new Date(), "yyyy-MM-01"),
    new Date().toISOString()
  );

  const currencyFormat = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
        <div className="text-sm text-gray-500">
          Terakhir diperbarui: {format(new Date(), "dd MMM yyyy HH:mm", { locale: localeId })}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["daily", "weekly", "monthly"].map((v) => (
          <a
            key={v}
            href={`/dashboard/reports?view=${v}`}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
              view === v
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {v === "daily" ? "Harian" : v === "weekly" ? "Mingguan" : "Bulanan"}
          </a>
        ))}
      </div>

      {/* Date Picker */}
      {view === "daily" && (
        <div className="flex justify-end">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyFormat(dailySales.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailySales.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Produk Terlaris</p>
              <p className="text-2xl font-bold text-gray-900">
                {topProducts.length > 0 ? topProducts[0].quantity : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tahun {new Date().getFullYear()}</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyFormat(monthlySales.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {view === "daily" ? "Detail Penjualan Hari Ini" : view === "weekly" ? "Penjualan Minggu Ini" : "Penjualan Bulan Ini"}
          </h3>
          <div className="space-y-3">
            {(view === "daily" ? dailySales.orders : view === "weekly" ? weeklySales.dailyBreakdown : monthlySales.dailyBreakdown).length > 0 ? (
              (view === "daily" ? dailySales.orders : view === "weekly" ? weeklySales.dailyBreakdown : monthlySales.dailyBreakdown).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {view === "daily" 
                        ? format(new Date(item.created_at), "HH:mm", { locale: localeId })
                        : item.date}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.transactions || 1} transaksi
                    </p>
                  </div>
                  <div className="font-bold text-gray-900">
                    {currencyFormat(item.revenue || item.total_amount || 0)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Belum ada data penjualan untuk periode ini</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{product.quantity} terjual</p>
                    <p className="text-xs text-gray-600">{currencyFormat(product.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Belum ada data penjualan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pembayaran Hari Ini</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(dailySales.paymentMethodBreakdown).map(([method, count]) => (
            <div key={method} className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-600">
                {method === "cash" ? "Tunai" : method === "qris" ? "QRIS" : method === "bank_transfer" ? "Transfer" : method === "e_wallet" ? "E-Wallet" : "VA"}
              </p>
              <p className="text-2xl font-bold text-blue-600">{count}</p>
            </div>
          ))}
          {Object.keys(dailySales.paymentMethodBreakdown).length === 0 && (
            <p className="text-gray-500">Belum ada data pembayaran</p>
          )}
        </div>
      </div>
    </div>
  );
}
