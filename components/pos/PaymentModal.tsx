'use client';

import { useState, useTransition } from 'react';
import { formatCurrency } from '@/lib/utils';
import { X, CreditCard, Wallet, Banknote } from 'lucide-react';
import { createOrder } from '@/lib/orders/actions';
import { CartItem } from './Cart';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
}

export function PaymentModal({ isOpen, onClose, items, total }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'bank_transfer'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const change = Number(amountReceived) - total;

  const quickAmounts = [
    { label: 'Pas', value: total },
    { label: formatCurrency(50000), value: 50000 },
    { label: formatCurrency(100000), value: 100000 },
    { label: formatCurrency(200000), value: 200000 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'cash' && Number(amountReceived) < total) {
      alert('Jumlah uang yang diterima kurang dari total');
      return;
    }

    const formData = new FormData();
    formData.append('items', JSON.stringify(items));
    formData.append('payment_method', paymentMethod);
    
    if (paymentMethod === 'cash') {
      formData.append('amount_received', amountReceived);
    }

    startTransition(() => {
      createOrder(formData);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Pembayaran</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Total */}
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <p className="text-sm text-gray-600">Total Pembayaran</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="p-6">
            <label className="text-sm font-medium text-gray-900">
              Metode Pembayaran
            </label>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="h-6 w-6" />
                <span className="text-sm font-medium">Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  paymentMethod === 'qris'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm font-medium">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet className="h-6 w-6" />
                <span className="text-sm font-medium">Online</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="border-t border-gray-200 p-6">
              <label className="text-sm font-medium text-gray-900">
                Uang Diterima
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Masukkan jumlah uang"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />

              {/* Quick Amount Buttons */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount.value}
                    type="button"
                    onClick={() => setAmountReceived(amount.value.toString())}
                    className="rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    {amount.label}
                  </button>
                ))}
              </div>

              {/* Change */}
              {amountReceived && Number(amountReceived) >= total && (
                <div className="mt-4 rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-800">Kembalian</p>
                  <p className="mt-1 text-2xl font-bold text-green-900">
                    {formatCurrency(change)}
                  </p>
                </div>
              )}

              {amountReceived && Number(amountReceived) < total && (
                <div className="mt-4 rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-800">
                    Uang kurang {formatCurrency(total - Number(amountReceived))}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QRIS Payment */}
          {paymentMethod === 'qris' && (
            <div className="border-t border-gray-200 p-6">
              <div className="rounded-lg bg-gray-100 p-8 text-center">
                <p className="text-sm text-gray-600">
                  Scan QRIS code dengan aplikasi pembayaran Anda
                </p>
                <div className="mx-auto mt-4 h-48 w-48 rounded-lg bg-white p-4">
                  {/* QR Code placeholder */}
                  <div className="flex h-full items-center justify-center text-gray-400">
                    QR Code
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Payment */}
          {paymentMethod === 'bank_transfer' && (
            <div className="border-t border-gray-200 p-6">
              <p className="text-sm text-gray-600">
                Catat pembayaran transfer manual setelah dana diterima
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 p-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              disabled={isPending}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:bg-gray-400"
              disabled={
                isPending ||
                (paymentMethod === 'cash' && Number(amountReceived) < total)
              }
            >
              {isPending ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}