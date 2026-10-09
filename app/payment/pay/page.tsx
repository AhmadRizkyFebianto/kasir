"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, ShieldCheck, Lock } from "lucide-react";
import { getSnapClient } from "@/lib/payment/midtrans-client";

interface PaymentPageProps {
  searchParams: {
    order_id: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    amount: string;
  };
}

export default function PaymentPage({ searchParams }: PaymentPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [transactionToken, setTransactionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initializePayment() {
      const snap = getSnapClient();
      
      try {
        const response = await fetch("/api/midtrans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId: searchParams.order_id,
            amount: parseFloat(searchParams.amount),
            customer: {
              firstName: searchParams.guest_name || "Guest",
              email: searchParams.guest_email || "",
              phone: searchParams.guest_phone || "",
            },
            items: [
              {
                id: searchParams.order_id,
                name: "Payment for order " + searchParams.order_id,
                quantity: 1,
                price: parseFloat(searchParams.amount),
              },
            ],
          }),
        });

        const result = await response.json();

        if (result.success && result.token) {
          setTransactionToken(result.token);
          setIsLoading(false);
        } else {
          setError(result.error || "Failed to create payment transaction");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Payment initialization error:", err);
        setError("Gagal memuat halaman pembayaran. Silakan coba lagi.");
        setIsLoading(false);
      }
    }

    initializePayment();
  }, []);

  useEffect(() => {
    if (transactionToken) {
      const snap = getSnapClient();
      
      snap.popup(transactionToken, {
        onSuccess: (result: any) => {
          window.location.href = `/dashboard/orders/${searchParams.order_id}?payment_status=paid`;
        },
        onPending: (result: any) => {
          window.location.href = `/dashboard/orders/${searchParams.order_id}?payment_status=pending`;
        },
        onClose: () => {
          window.location.href = `/dashboard/orders/${searchParams.order_id}?payment_status=cancelled`;
        },
      });
    }
  }, [transactionToken]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Menyiapkan pembayaran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Gagal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard/pos")}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Kembali ke POS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <CreditCard className="h-8 w-8 text-green-600" />
          <ShieldCheck className="h-8 w-8 text-green-600" />
          <Lock className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to payment gateway...</h1>
        <p className="text-gray-600">Jangan tutup browser ini</p>
      </div>
    </div>
  );
}