"use client";

import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MoreVertical,
} from "lucide-react";
import {
  checkInReservation,
  checkOutReservation,
  cancelReservation,
  confirmPayment,
  exportReservationsCSV,
} from "@/lib/reservations/kasir-actions";

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
    pending: { label: "Menunggu", color: "bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg px-2 py-1" },
    confirmed: { label: "Terkonfirmasi", color: "bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1" },
    checked_in: { label: "Berlangsung", color: "bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-1" },
    completed: { label: "Selesai", color: "bg-gray-50 text-gray-700 rounded-lg px-2 py-1" },
    cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1" },
  };

  const paymentConfig = {
    pending: { label: "Belum Dibayar", color: "text-yellow-600", icon: Clock },
    paid: { label: "Lunas", color: "text-green-600", icon: CheckCircle },
    failed: { label: "Gagal", color: "text-red-600", icon: XCircle },
    expired: { label: "Kedaluwarsa", color: "text-gray-600", icon: Clock },
    refunded: { label: "Dikembalikan", color: "text-blue-600", icon: DollarSign },
  };

  const handleCheckIn = (id: string) => {
    if (confirm("Check-in reservasi ini?")) {
      startTransition(async () => {
        const result = await checkInReservation(id);
        if (result.error) {
          alert(result.error);
        } else {
          alert("Berhasil check-in!");
        }
      });
    }
  };

  const handleCheckOut = (id: string) => {
    if (confirm("Check-out reservasi ini?")) {
      startTransition(async () => {
        const result = await checkOutReservation(id);
        if (result.error) {
          alert(result.error);
        } else {
          alert("Berhasil check-out!");
        }
      });
    }
  };

  const handleCancel = (id: string) => {
    const reason = prompt("Alasan pembatalan:");
    if (reason !== null) {
      startTransition(async () => {
        const result = await cancelReservation(id, reason);
        if (result.error) {
          alert(result.error);
        } else {
          alert("Reservasi dibatalkan");
        }
      });
    }
  };

  const handleConfirmPayment = (id: string) => {
    const method = prompt("Metode pembayaran: cash, qris, bank_transfer, e_wallet, virtual_account", "cash");
    if (method !== null) {
      startTransition(async () => {
        const result = await confirmPayment(id, method.trim() as "cash");
        if (result.error) {
          alert(result.error);
        } else {
          alert("Pembayaran dikonfirmasi!");
        }
      });
    }
  };

  const handleExportCSV = () => {
    startTransition(async () => {
      const result = await exportReservationsCSV();
      if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="rounded-lg border-2 border-slate-200 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-gray-700">Kode</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Pelanggan</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Tempat</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Waktu</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Pembayaran</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((reservation) => {
                const status = statusConfig[reservation.status as keyof typeof statusConfig] || statusConfig.pending;
                const payment = Array.isArray(reservation.payments) ? reservation.payments[0] : reservation.payments;
                const paymentStatus = payment ? paymentConfig[payment.status as keyof typeof paymentConfig] : paymentConfig.pending;
                const Place = Array.isArray(reservation.places) ? reservation.places[0] : reservation.places;
                const Profile = Array.isArray(reservation.profiles) ? reservation.profiles[0] : reservation.profiles;

                const canCheckIn = reservation.status === "confirmed";
                const canCheckOut = reservation.status === "checked_in";
                const canConfirmPayment = payment && payment.status === "pending" && reservation.status !== "cancelled";
                const canCancel = ["pending", "confirmed", "checked_in"].includes(reservation.status);

                const hasActions = canCheckIn || canCheckOut || canConfirmPayment || canCancel;

                return (
                  <tr key={reservation.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50">
                    <td className="px-4 py-3 font-mono text-gray-900">{reservation.reservation_code}</td>
                    <td className="px-4 py-3 text-gray-900">{Profile?.full_name || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{Place?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(reservation.start_time), "dd MMM yyyy HH:mm", { locale: localeId })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={status.color}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${paymentStatus.color}`}>
                        <paymentStatus.icon className="h-4 w-4" />
                        {paymentStatus.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(reservation.total_amount)}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedId(selectedId === reservation.id ? null : reservation.id)}
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
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  Tidak ada reservasi
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t-2 border-slate-200 p-4 flex justify-between items-center">
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
