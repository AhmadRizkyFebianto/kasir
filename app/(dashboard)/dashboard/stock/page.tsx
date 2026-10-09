import { Suspense } from "react";
import { getProductsStock, updateStock } from "@/lib/stock/actions";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

async function StockPage() {
  const products = await getProductsStock();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Stock</h1>
        <Link
          href="/dashboard/products"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
          Kembali ke Produk
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Produk</div>
          <div className="text-3xl font-bold">{products?.length || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-green-100 text-sm font-semibold uppercase tracking-wider">Produk Tersedia</div>
          <div className="text-3xl font-bold">
            {products?.filter((p: any) => p.stock > 0).length || 0}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-yellow-100 text-sm font-semibold uppercase tracking-wider">Produk Habis</div>
          <div className="text-3xl font-bold">
            {products?.filter((p: any) => p.stock === 0).length || 0}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nama Produk</th>
                <th className="px-6 py-4 text-left font-semibold">Kategori</th>
                <th className="px-6 py-4 text-left font-semibold">Stock Saat Ini</th>
                <th className="px-6 py-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-700">{product.product_categories?.name || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        product.stock === 0
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : product.stock < 10
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <form action={updateStock} className="inline">
                        <input type="hidden" name="product_id" value={product.id} />
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            name="stock_change"
                            min="-1000"
                            max="1000"
                            placeholder="+/-"
                            className="w-20 rounded-lg border border-gray-300 py-1 px-2 text-center focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm"
                          >
                            Update
                          </button>
                        </div>
                        <select
                          name="type"
                          className="hidden"
                          defaultValue="adjustment"
                        >
                          <option value="adjustment">Adjustment</option>
                          <option value="input">Input Stock</option>
                          <option value="output">Output Stock</option>
                        </select>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada produk
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

export default function StockWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <StockPage />
    </Suspense>
  );
}