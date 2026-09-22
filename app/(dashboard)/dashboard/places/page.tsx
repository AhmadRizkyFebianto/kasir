import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPlaces, deletePlace } from "@/lib/places/actions";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

async function PlacesPage() {
  const places = await getPlaces();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Tempat</h1>
        <Link
          href="/dashboard/places/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg border-2 border-blue-700 hover:bg-blue-700 font-semibold shadow-md"
        >
          <Plus className="h-5 w-5" />
          Tambah Tempat
        </Link>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nama</th>
                <th className="px-6 py-4 text-left font-semibold">Nomor</th>
                <th className="px-6 py-4 text-left font-semibold">Kapasitas</th>
                <th className="px-6 py-4 text-left font-semibold">Harga/Jam</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {places && places.length > 0 ? (
                places.map((place: any) => (
                  <tr key={place.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{place.name}</td>
                    <td className="px-6 py-4 text-gray-700">{place.number || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{place.capacity} orang</td>
                    <td className="px-6 py-4 text-gray-900">
                      Rp {new Intl.NumberFormat("id-ID").format(place.price_per_hour || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        place.status === "available"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : place.status === "reserved"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : place.status === "occupied"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {place.status === "available" ? "Tersedia" : place.status === "reserved" ? "Direservasi" : place.status === "occupied" ? "Terisi" : "Maintenance"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/places/${place.id}/edit`}
                          className="px-3 py-1.5 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-600 font-semibold text-sm shadow-sm"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </Link>
                        <form action={async () => { "use server"; await deletePlace(place.id); }}>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada tempat
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

export default function PlacesWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <PlacesPage />
    </Suspense>
  );
}