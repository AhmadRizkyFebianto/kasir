'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/orders/print';

interface ReceiptData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  orderNumber: string;
  orderDate: string;
  cashierName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  thankYouMessage: string;
}

export default function PrintReceiptPage() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const orderId = window.location.pathname.split('/')[4];
        const response = await fetch(`/dashboard/orders/${orderId}/print`);
        const data = await response.json();
        setReceipt(data.receipt);
      } catch (error) {
        console.error('Failed to fetch receipt:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();

    // Trigger print after 1 second
    setTimeout(() => {
      window.print();
    }, 1000);
  }, []);

  if (loading || !receipt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat struk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 print:bg-white print:p-0">
      {/* Store Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{receipt.storeName}</h1>
        <p className="text-sm text-gray-600 mt-1">{receipt.storeAddress}</p>
        <p className="text-sm text-gray-600">{receipt.storePhone}</p>
      </div>

      {/* Order Info */}
      <div className="border-b-2 border-gray-300 mb-6 pb-4">
        <p className="text-sm text-gray-600">Order: {receipt.orderNumber}</p>
        <p className="text-sm text-gray-600">{receipt.orderDate}</p>
        <p className="text-sm text-gray-600">Kasir: {receipt.cashierName}</p>
      </div>

      {/* Items */}
      <div className="mb-6">
        {receipt.items.map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <div>
              <span className="text-sm font-medium">{item.quantity}x {item.name}</span>
            </div>
            <span className="text-sm font-medium">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-300 pt-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(receipt.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Diskon</span>
          <span className="font-medium text-green-600">-{formatCurrency(receipt.discount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pajak</span>
          <span className="font-medium">{formatCurrency(receipt.tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
          <span>Total</span>
          <span>{formatCurrency(receipt.total)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="border-t border-gray-300 pt-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Metode Pembayaran</span>
          <span className="font-medium">{receipt.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bayar</span>
          <span className="font-medium">{formatCurrency(receipt.amountPaid)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span className="text-gray-600">Kembalian</span>
          <span className="text-green-600">{formatCurrency(receipt.change)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">{receipt.thankYouMessage}</p>
        <p className="text-xs text-gray-400">Terima kasih atas kunjungan Anda</p>
      </div>
    </div>
  );
}
