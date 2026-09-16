'use client';

import { useState, useEffect } from 'react';
import { getDashboardReports } from '@/lib/reservations/dashboard-queries';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getDashboardReports();
        setReports(data);
      } catch (err) {
        setError('Gagal memuat data laporan');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const currencyFormat = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 shadow-md">
        <h1 className="text-2xl font-bold text-red-900">Error</h1>
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }

  if (!reports) return null;

  const dailyRevenueData = {
    labels: reports.thisWeek.daily.map((d: any) => d.label),
    datasets: [{
      label: 'Pendapatan (Rp)',
      data: reports.thisWeek.daily.map((d: any) => d.amount),
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    }],
  };

  const dailyRevenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const } },
    scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } },
  };

  const categoryRevenueData = {
    labels: reports.categories.revenue.map((c: any) => c.name),
    datasets: [{
      label: 'Pendapatan (Rp)',
      data: reports.categories.revenue.map((c: any) => c.amount),
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const categoryRevenueOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'right' as const } } };

  const paymentMethodData = {
    labels: reports.paymentMethods.map((p: any) => p.label),
    datasets: [{
      label: 'Jumlah',
      data: reports.paymentMethods.map((p: any) => p.amount),
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderWidth: 0,
    }],
  };

  const paymentMethodOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'right' as const } } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <div className="text-sm text-gray-500">Terakhir diperbarui: {new Date().toLocaleString('id-ID')}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-sm font-medium text-gray-500">Pendapatan Hari Ini</h3><p className="mt-2 text-3xl font-bold text-gray-900">{currencyFormat(reports.today.totalRevenue)}</p></div>
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-sm font-medium text-gray-500">Reservasi Hari Ini</h3><p className="mt-2 text-3xl font-bold text-gray-900">{reports.today.totalReservations}</p></div>
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-sm font-medium text-gray-500">Pendapatan Bulan Ini</h3><p className="mt-2 text-3xl font-bold text-gray-900">{currencyFormat(reports.thisMonth.totalRevenue)}</p></div>
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-sm font-medium text-gray-500">Total Tempat</h3><p className="mt-2 text-3xl font-bold text-gray-900">{reports.places.total}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan Minggu Ini (7 Hari)</h3><div className="h-64"><Line data={dailyRevenueData} options={dailyRevenueOptions} /></div></div>
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan per Kategori (Hari Ini)</h3><div className="h-64"><Bar data={categoryRevenueData} options={categoryRevenueOptions} /></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran (Hari Ini)</h3><div className="h-64"><Pie data={paymentMethodData} options={paymentMethodOptions} /></div></div>
        <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-lg font-semibold text-gray-900 mb-4">Status Tempat</h3><div className="space-y-3"><div className="flex items-center justify-between"><span className="text-gray-600">Tersedia</span><span className="font-bold text-green-600">{reports.places.byStatus.available}</span></div><div className="flex items-center justify-between"><span className="text-gray-600">Dipesan</span><span className="font-bold text-blue-600">{reports.places.byStatus.reserved}</span></div><div className="flex items-center justify-between"><span className="text-gray-600">Ditempati</span><span className="font-bold text-orange-600">{reports.places.byStatus.occupied}</span></div><div className="flex items-center justify-between"><span className="text-gray-600">Perbaikan</span><span className="font-bold text-red-600">{reports.places.byStatus.maintenance}</span></div></div></div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md"><h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div><span className="text-gray-500 block mb-1">Total Reservasi (Minggu Ini)</span><span className="font-bold text-gray-900">{reports.thisWeek.totalReservations}</span></div><div><span className="text-gray-500 block mb-1">Total Pendapatan (Minggu Ini)</span><span className="font-bold text-gray-900">{currencyFormat(reports.thisWeek.totalRevenue)}</span></div><div><span className="text-gray-500 block mb-1">Pendapatan (Bulan Ini)</span><span className="font-bold text-gray-900">{currencyFormat(reports.thisMonth.totalRevenue)}</span></div></div></div>
    </div>
  );
}