import { Suspense } from "react";
import { getCategories, deleteCategory } from "@/lib/products/actions";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
        <Link
          href="/dashboard/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg border-2 border-blue-700 hover:bg-blue-700 font-semibold shadow-md"
        >
          <Plus className="h-5 w-5" />
          Tambah Kategori
        </Link>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nama</th>
                <th className="px-6 py-4 text-left font-semibold">Deskripsi</th>
                <th className="px-6 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories && categories.length > 0 ? (
                categories.map((category: any) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-gray-700">{category.description || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/categories/${category.id}/edit`}
                          className="px-3 py-1.5 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-600 font-semibold text-sm shadow-sm"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </Link>
                        <form action={async () => { "use server"; await deleteCategory(category.id); }}>
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg border-2 border-red-400 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-600 font-semibold text-sm shadow-sm"
                          >
                            <Trash2 className="h-4 w-4 inline mr-1" />
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Belum ada kategori
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

export default function CategoriesWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CategoriesPage />
    </Suspense>
  );
}