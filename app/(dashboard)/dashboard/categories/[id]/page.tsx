import { getCategory, deleteCategory } from "@/lib/products/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Edit } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const category = await getCategory(params.id);
  
  if (!category) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detail Kategori</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/categories"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kategori</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nama</label>
              <p className="text-lg font-semibold text-gray-900">{category.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
              <p className="text-gray-700">{category.description || "-"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi</h2>
          <div className="space-y-3">
            <Link
              href={`/dashboard/categories/${category.id}/edit`}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-600 font-semibold"
            >
              <Edit className="h-5 w-5" />
              Edit Kategori
            </Link>
            <form action={async () => { "use server"; await deleteCategory(category.id); }}>
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-red-400 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-600 font-semibold w-full"
              >
                <Trash2 className="h-5 w-5" />
                Hapus Kategori
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}