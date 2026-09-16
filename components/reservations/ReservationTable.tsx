'use client';

import { useState, useTransition } from 'react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MoreVertical,
} from 'lucide-react';
import {
  checkInReservation,
  checkOutReservation,
  cancelReservation,
  confirmPayment,
  exportReservationsCSV,
} from '@/lib/reservations/kasir-actions';

interface Reservation {
  id: string;
  reservation_code: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: string;
  total_amount: number;
  profiles: any;
  places: any;
  payments: any;
}

interface ReservationTableProps {
  reservations: Reservation[];
  categoryOptions?: { value: string; label: string }[];
}

export function ReservationTable({ reservations, categoryOptions = [] }: ReservationTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Terkonfirmasi', color: 'bg-green-100 text-green-800' },
    checked_in: { label: 'Berlangsung', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Selesai', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
  };

  const paymentConfig = {
    pending: { label: 'Belum Dibayar', color: 'text-yellow-600', icon: Clock },
    paid: { label: 'Lunas', color: 'text-green-600', icon: CheckCircle },
    failed: { label: 'Gagal', color: 'text-red-600', icon: XCircle },
    expired: { label: 'Kedaluwarsa', color: 'text-gray-600', icon: Clock },
    refunded: { label: 'Dikembalikan', color: 'text-blue-600', icon: DollarSign },
  };

  const handleCheckIn = (id: string) => {
    if (confirm('Check-in reservasi ini?')) {
      startTransition(async () => {
        const result = await checkInReservation(id);
        if (result.error) {
          alert(result.error);
        } else {
          alert('Berhasil check-in!');
        }
      });
    }
  };

  const handleCheckOut = (id: string) => {
    if (confirm('Check-out reservasi ini?')) {
      startTransition(async () => {
        const result = await checkOutReservation(id);
        if (result.error) {
          alert(result.error);
        } else {
          alert('Berhasil check-out!');
        }
      });
    }
  };

  const handleCancel = (id: string) => {
    const reason = prompt('Alasan pembatalan:');
    if (reason !== null) {
      startTransition(async () => {
        const result = await cancelReservation(id, reason);
        if (result.error) {
          alert(result.error);
        } else {
          alert('Reservasi dibatalkan');
        }
      });
    }
  };

  const handleConfirmPayment = (id: string) => {
    const method = prompt('Metode pembayaran: cash, qris, bank_transfer, e_wallet, virtual_account', 'cash');
    if (method !== null) {
      startTransition(async () => {
        const result = await confirmPayment(id, method.trim() as 'cash');
        if (result.error) {
          alert(result.error);
        } else {
          alert('Pembayaran dikonfirmasi!');
        }
      });
    }
  };

  const handleExportCSV = () => {
    startTransition(async () => {
      const result = await exportReservationsCSV();
      if (result?.error) {
        alert(result.error);
      } else if (result?.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reservasi-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Kode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tempat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Waktu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Durasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Pembayaran
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  <Clock className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2">Tidak ada reservasi</p>
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => {
                const profile = Array.isArray(reservation.profiles)
                  ? reservation.profiles[0]
                  : reservation.profiles;
                const place = Array.isArray(reservation.places)
                  ? reservation.places[0]
                  : reservation.places;
                const payment = Array.isArray(reservation.payments)
                  ? reservation.payments[0]
                  : reservation.payments;

                const paymentStatus =
                  payment && typeof payment === 'object' && 'status' in payment
                    ? String(payment.status)
                    : 'pending';
                const isPaid = paymentStatus === 'paid';
                const canConfirmPayment =
                  !isPaid && reservation.status !== 'cancelled' && reservation.status !== 'completed';
                const canCheckIn = reservation.status === 'confirmed' && isPaid;
                const canCheckOut = reservation.status === 'checked_in' && isPaid;
                const canCancel =
                  !isPaid && (reservation.status === 'pending' || reservation.status === 'confirmed');
                const hasActions = canConfirmPayment || canCheckIn || canCheckOut || canCancel;
                const paymentDisplay = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.pending;
                const PaymentIcon = paymentDisplay.icon;

                return (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {reservation.reservation_code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {profile && typeof profile === 'object' && 'full_name' in profile
                            ? profile.full_name
                            : 'N/A'}
                        </div>
                        <div className="text-gray-500">
                          {profile && typeof profile === 'object' && 'phone' in profile
                            ? profile.phone
                            : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {place && typeof place === 'object' && 'name' in place
                            ? place.name
                            : 'N/A'}
                        </div>
                        <div className="text-gray-500">
                          {place && typeof place === 'object' && 'number' in place
                            ? `#${place.number}`
                            : ''}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {format(new Date(reservation.start_time), 'dd MMM yyyy, HH:mm', {
                        locale: localeId,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {reservation.duration_hours} jam
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(reservation.total_amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusConfig[reservation.status as keyof typeof statusConfig]
                            ?.color
                        }`}
                      >
                        {statusConfig[reservation.status as keyof typeof statusConfig]
                          ?.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${paymentDisplay.color}`}>
                        <PaymentIcon className="h-4 w-4" />
                        {paymentDisplay.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setSelectedId(selectedId === reservation.id ? null : reservation.id)
                          }
                          className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40"
                          disabled={isPending || !hasActions}
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>

                        {selectedId === reservation.id && hasActions && (
                          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              {canCheckIn && (
                                <button
                                  onClick={() => handleCheckIn(reservation.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Check-in
                                </button>
                              )}

                              {canCheckOut && (
                                <button
                                  onClick={() => handleCheckOut(reservation.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Check-out
                                </button>
                              )}

                              {canConfirmPayment && (
                                <button
                                  onClick={() => handleConfirmPayment(reservation.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <DollarSign className="h-4 w-4" />
                                  Konfirmasi Bayar
                                </button>
                              )}

                              {canCancel && (
                                <button
                                  onClick={() => handleCancel(reservation.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Batalkan
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={handleExportCSV}
            disabled={isPending || reservations.length === 0}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          >
            <DollarSign className="h-4 w-4" />
            Export CSV
          </button>
          <span className="text-sm text-gray-500">{reservations.length} item</span>
        </div>
      </div>
    </div>
  );
}