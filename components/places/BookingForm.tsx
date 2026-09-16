'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { createReservation } from '@/lib/reservations/actions';
import { formatCurrency } from '@/lib/utils';

interface BookingFormProps {
  place: {
    id: string;
    name: string;
    price_per_hour: number;
  };
}

export function BookingForm({ place }: BookingFormProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  };

  const duration = calculateDuration();
  const totalAmount = duration * Number(place.price_per_hour);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!date || !startTime || !endTime) {
      setError('Mohon lengkapi tanggal dan waktu');
      setLoading(false);
      return;
    }

    if (endTime <= startTime) {
      setError('Waktu selesai harus lebih dari waktu mulai');
      setLoading(false);
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Tidak dapat memesan tanggal yang sudah lewat');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('place_id', place.id);
    formData.append(
      'start_time',
      new Date(`${date}T${startTime}`).toISOString()
    );
    formData.append('end_time', new Date(`${date}T${endTime}`).toISOString());
    formData.append('notes', notes);

    const result = await createReservation(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, redirect is handled by createReservation
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Buat Reservasi
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 rounded-lg bg-red-50 p-4"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Date */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4" />
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Waktu Mulai
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Waktu Selesai
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Catatan (Opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Tambahkan catatan untuk reservasi Anda..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Summary */}
        {duration > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg bg-primary-50 p-4"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Durasi:</span>
                <span className="font-medium text-gray-900">
                  {duration} jam
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Harga per jam:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(place.price_per_hour)}
                </span>
              </div>
              <div className="flex justify-between border-t border-primary-100 pt-2">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !date || !startTime || !endTime}
          className="w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Buat Reservasi'}
        </button>

        <p className="text-center text-xs text-gray-500">
          Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
        </p>
      </form>
    </motion.div>
  );
}