import { Suspense } from "react";
import { getStockTransactions } from "@/lib/stock/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

async function StockHistoryPage() {
  const transactions = await getStockTransactions();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Stock</h1>
        <Link
          href="/dashboard/stock"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Tanggal</th>
                <th className="px-6 py-4 text-left font-semibold">Produk</th>
                <th className="px-6 py-4 text-left font-semibold">Kategori</th>
                <th className="px-6 py-4 text-left font-semibold">Perubahan</th>
                <th className="px-6 py-4 text-left font-semibold">Stock Sebelum</th>
                <th className="px-6 py-4 text-left font-semibold">Stock Sesudah</th>
                <th className="px-6 py-4 text-left font-semibold">Jenis</th>
                <th className="px-6 py-4 text-left font-semibold">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{formatDateTime(transaction.created_at)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{transaction.products?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{transaction.product_categories?.name || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        transaction.stock_change > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {transaction.stock_change > 0 ? "+" : ""}{transaction.stock_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{transaction.stock_before}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{transaction.stock_after}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        transaction.type === "input" || transaction.type === "adjustment"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {transaction.type === "input" ? "Input" : transaction.type === "output" ? "Output" : "Adjustment"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{transaction.description || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Belum ada riwayat stock
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StockHistoryWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <StockHistoryPage />
    </Suspense>
  );
}