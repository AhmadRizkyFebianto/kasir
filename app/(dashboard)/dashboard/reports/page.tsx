import { getDashboardReports } from "@/lib/reservations/dashboard-queries";

export default async function DashboardReportsPage() {
  const reports = await getDashboardReports();

  const currencyFormat = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <div className="text-sm text-gray-500">Terakhir diperbarui: {new Date().toLocaleString("id-ID")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Pendapatan Hari Ini</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{currencyFormat(reports?.today?.totalRevenue || 0)}</p>
        </div>
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Reservasi Hari Ini</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{reports?.today?.totalReservations || 0}</p>
        </div>
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Pendapatan Bulan Ini</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{currencyFormat(reports?.thisMonth?.totalRevenue || 0)}</p>
        </div>
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Tempat</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{reports?.places?.total || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Reservasi (Minggu Ini)</span>
              <span className="font-bold text-gray-900">{reports?.thisWeek?.totalReservations || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Pendapatan (Minggu Ini)</span>
              <span className="font-bold text-gray-900">{currencyFormat(reports?.thisWeek?.totalRevenue || 0)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Tempat</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tersedia</span>
              <span className="font-bold text-green-600">{reports?.places?.byStatus?.available || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dipesan</span>
              <span className="font-bold text-amber-600">{reports?.places?.byStatus?.reserved || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ditempati</span>
              <span className="font-bold text-amber-600">{reports?.places?.byStatus?.occupied || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Perbaikan</span>
              <span className="font-bold text-red-600">{reports?.places?.byStatus?.maintenance || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
