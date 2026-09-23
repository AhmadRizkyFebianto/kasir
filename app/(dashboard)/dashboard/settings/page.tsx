import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function updateSettings(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("Unauthorized");
    return;
  }

  const storeName = String(formData.get("storeName") || "");
  const storeAddress = String(formData.get("storeAddress") || "");
  const storePhone = String(formData.get("storePhone") || "");
  const midtransServerKey = String(formData.get("midtransServerKey") || "");
  const midtransClientKey = String(formData.get("midtransClientKey") || "");
  const isProduction = formData.get("isProduction") === "on";
  const openingTime = String(formData.get("openingTime") || "");
  const closingTime = String(formData.get("closingTime") || "");
  const defaultDiscount = Number(formData.get("defaultDiscount") || 0);

  // Update store settings
  await supabase
    .from("store_settings")
    .upsert({
      store_name: storeName,
      store_address: storeAddress,
      store_phone: storePhone,
      midtrans_server_key: midtransServerKey,
      midtrans_client_key: midtransClientKey,
      is_production: isProduction,
      opening_time: openingTime,
      closing_time: closingTime,
      default_discount: defaultDiscount,
      updated_at: new Date().toISOString()
    });

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?success=1");
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings, error } = await supabase
    .from("store_settings")
    .select("*")
    .single();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Aplikasi</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Store Info */}
          <form action={updateSettings} className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Toko</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Toko</label>
                <input type="text" name="storeName" defaultValue={settings?.store_name || "Kasir Pro"} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Alamat</label>
                <textarea name="storeAddress" rows={3} defaultValue={settings?.store_address || ""} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input type="tel" name="storePhone" defaultValue={settings?.store_phone || ""} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
          </form>

          {/* Payment Settings */}
          <form action={updateSettings} className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pembayaran (Midtrans)</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Midtrans Server Key</label>
                <input type="password" name="midtransServerKey" defaultValue={settings?.midtrans_server_key || ""} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Midtrans Client Key</label>
                <input type="password" name="midtransClientKey" defaultValue={settings?.midtrans_client_key || ""} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isProduction" id="production" defaultChecked={settings?.is_production || false} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="production" className="text-sm text-gray-700">Mode Produksi (Production)</label>
              </div>
            </div>
          </form>
        </div>

        {/* General Settings */}
        <div className="space-y-6">
          <form action={updateSettings} className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pengaturan Umum</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Waktu Buka</label>
                <input type="time" name="openingTime" defaultValue={settings?.opening_time || "08:00"} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Waktu Tutup</label>
                <input type="time" name="closingTime" defaultValue={settings?.closing_time || "22:00"} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Diskon Default (%)</label>
                <input type="number" name="defaultDiscount" defaultValue={settings?.default_discount || 0} min="0" max="100" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
          </form>
          
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <button type="submit" form="settings-form" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-semibold">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
