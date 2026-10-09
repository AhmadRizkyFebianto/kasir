import { createProduct, getProductCategories } from "@/lib/products/actions";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Produk</h1>
        <Link
          href="/dashboard/products"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Contoh: Nasi Goreng"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                required
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Pilih Kategori</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Harga <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="1"
                required
                placeholder="Contoh: 25000"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Stock Awal
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue="0"
                placeholder="Contoh: 50"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">
                Deskripsi
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Deskripsi produk (opsional)"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Aktif (Tampilkan di POS)
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link
              href="/dashboard/products"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md"
            >
              <Plus className="h-5 w-5" />
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}