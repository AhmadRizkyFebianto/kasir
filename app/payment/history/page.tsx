'use client';

import { useState, useEffect } from 'react';
import { getPaymentHistory } from '@/lib/reservations/payment-queries';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const result = await getPaymentHistory({
        page: currentPage,
        status: statusFilter || undefined,
      });
      setPayments(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    const headers = ['ID,Pelanggan,Reservasi,Metode,Jumlah,Status,Tanggal'];
    const rows = payments.map((p) => [
      p.id,
      p.reservation?.guest_name || '-',
      p.reservation?.reservation_code || '-',
      p.payment_method?.name || '-',
      p.amount,
      p.status,
      new Date(p.created_at).toLocaleDateString('id-ID'),
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers[0], ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'payment-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button onClick={fetchPayments} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Pelanggan</th>
              <th className="px-4 py-3 text-left">Reservasi</th>
              <th className="px-4 py-3 text-left">Metode</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b">
                <td className="px-4 py-3">{payment.id}</td>
                <td className="px-4 py-3">{payment.reservation?.guest_name || '-'}</td>
                <td className="px-4 py-3">{payment.reservation?.reservation_code || '-'}</td>
                <td className="px-4 py-3">{payment.payment_method?.name || '-'}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-sm ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada pembayaran ditemukan</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-600">
          Halaman {currentPage} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
