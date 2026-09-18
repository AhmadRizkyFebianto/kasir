import { redirect } from 'next/navigation';
import { createPayment } from '@/lib/payment/midtrans-client';

export default async function PaymentPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const reservationId = searchParams?.reservation_id as string;
  const guestName = searchParams?.guest_name as string;
  const guestEmail = searchParams?.guest_email as string;
  const guestPhone = searchParams?.guest_phone as string;
  const amount = Number(searchParams?.amount);

  if (!reservationId || !amount) {
    redirect('/dashboard/reservations?error=invalid_data');
  }

  try {
    const result = await createPayment({
      reservationId,
      amount,
      customer: {
        firstName: guestName || 'Customer',
        email: guestEmail || '',
        phone: guestPhone || '081234567890',
      },
      items: [],
    });

    if (result.redirectUrl) {
      redirect(result.redirectUrl);
    } else {
      redirect('/dashboard/reservations?error=no_redirect');
    }
  } catch (error) {
    console.error('Payment error:', error);
    redirect('/dashboard/reservations?error=payment_failed');
  }
}
