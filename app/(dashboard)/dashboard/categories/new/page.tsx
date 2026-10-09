import { createCategory } from "@/lib/products/actions";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function NewCategoryPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Kategori</h1>
        <Link
          href="/dashboard/categories"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
        <form action={createCategory} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nama Kategori <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Contoh: Makanan"
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
                placeholder="Deskripsi kategori (opsional)"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link
              href="/dashboard/categories"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md"
            >
              <Plus className="h-5 w-5" />
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}