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
  onCheckout?: (paymentMethod: string, customer?: any) => void;
}

export function PaymentModal({ isOpen, onClose, items, total, onCheckout }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'bank_transfer' | 'midtrans'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [isPending, startTransition] = useTransition();
  const [customer, setCustomer] = useState({ firstName: '', email: '', phone: '' });

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

    if (onCheckout) {
      onCheckout(paymentMethod, customer);
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
          {/* Customer Info for Midtrans */}
          {paymentMethod === 'midtrans' && (
            <div className="border-b border-gray-200 p-6">
              <h3 className="mb-4 font-medium text-gray-900">Data Customer</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Nama</label>
                  <input
                    type="text"
                    value={customer.firstName}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    placeholder="Nama customer"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="Email customer"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">No HP</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="mb-4 font-medium text-gray-900">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'qris', label: 'QRIS', icon: Wallet },
                { id: 'bank_transfer', label: 'Transfer', icon: Banknote },
                { id: 'midtrans', label: 'Midtrans', icon: CreditCard },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <method.icon className="h-5 w-5" />
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Payment Fields */}
          {paymentMethod === 'cash' && (
            <div className="border-b border-gray-200 p-6">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Jumlah Uang Diterima</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Masukkan jumlah uang"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 pl-4 pr-16 text-lg font-bold focus:border-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-gray-600">
                    {formatCurrency(Number(amountReceived) || 0)}
                  </span>
                </div>
                {Number(amountReceived) > 0 && (
                  <div className="mt-2 text-lg">
                    <span className="text-gray-600">Kembali: </span>
                    <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(change)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    onClick={() => setAmountReceived(quick.value.toString())}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QRIS Payment */}
          {paymentMethod === 'qris' && (
            <div className="border-b border-gray-200 p-6">
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
            <div className="border-b border-gray-200 p-6">
              <p className="text-sm text-gray-600">
                Catat pembayaran transfer manual setelah dana diterima
              </p>
            </div>
          )}

          {/* Midtrans Payment */}
          {paymentMethod === 'midtrans' && (
            <div className="border-b border-gray-200 p-6">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-6 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-blue-900 mb-2">Bayar via Midtrans</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(total)}</p>
                <p className="text-xs text-blue-600 mt-2">Redirect ke Midtrans payment page</p>
              </div>
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
              className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isPending || (paymentMethod === 'cash' && Number(amountReceived) < total)}
            >
              {isPending ? 'Memproses...' : paymentMethod === 'cash' ? 'Konfirmasi' : 'Bayar Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}