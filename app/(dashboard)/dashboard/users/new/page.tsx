import { createUser } from "@/lib/users/actions";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function NewUserPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna</h1>
        <Link
          href="/dashboard/users"
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md p-6">
        <form action={createUser} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                name="full_name"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Contoh: budi@kasir.com"
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Minimal 6 karakter"
                minLength={6}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                required
                className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Pilih Role</option>
                <option value="admin">Admin</option>
                <option value="kasir">Kasir</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link
              href="/dashboard/users"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md"
            >
              <Plus className="h-5 w-5" />
              Simpan Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}