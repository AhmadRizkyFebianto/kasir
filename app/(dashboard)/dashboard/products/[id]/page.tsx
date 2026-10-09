import { getProduct, deleteProduct, getProductCategories } from "@/lib/products/actions";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface PageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();
  }

  const categories = await getProductCategories();
  const categoryName = categories?.find((c: any) => c.id === product.category_id)?.name || "-";

  const handleDelete = async () => {
    "use server";
    await deleteProduct(product.id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detail Produk</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/products" className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md">
            <ArrowLeft className="h-5 w-5" /> Kembali
          </Link>
          <Link href={`/dashboard/products/${product.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold shadow-md">
            <Edit className="h-5 w-5" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">ID:</span>
                    <span className="font-mono text-gray-500">{product.id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Kategori</p>
                  <p className="text-sm font-medium text-gray-900">{categoryName}</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Harga</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Stock</p>
                  <p className="text-sm font-medium text-gray-900">{product.stock} unit</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{product.is_active ? "Aktif" : "Tidak Aktif"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Lainnya</h3>
            <div className="space-y-3">
              <form action={handleDelete}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-red-400 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-600 font-semibold"
                >
                  <Trash2 className="h-5 w-5" />
                  Hapus Produk
                </button>
              </form>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Info Produk</h3>
            <p className="text-xs text-blue-700">Produk ini dapat dilihat di halaman POS jika statusnya aktif.</p>
          </div>
        </div>
      </div>
    </div>
  );
}