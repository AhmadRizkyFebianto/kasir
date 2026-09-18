import { NextRequest, NextResponse } from 'next/server';
import { getCoreClient } from '@/lib/payment/midtrans-client';
import { updatePaymentStatus } from '@/lib/reservations/payment-queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status_code, gross_amount, payment_type, signature_key } = body;

    const core = getCoreClient();
    const verifyStatus = await core.transaction.status(order_id);
    const isValid = core.transaction.checkNotificationStatus(order_id, signature_key);

    if (!isValid) {
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    const statusMap: Record<string, string> = {
      '201': 'pending',
      '200': 'paid',
      '202': 'pending',
      '302': 'failed',
      '407': 'failed',
      '501': 'failed',
      '502': 'failed',
      '503': 'failed',
    };

    const paymentStatus = statusMap[status_code] || 'pending';

    await updatePaymentStatus({
      payment_id: order_id.replace('RES-', ''),
      status: paymentStatus,
      midtrans_status: status_code,
    });

    return NextResponse.json({ status: 'success', message: 'Payment updated' }, { status: 200 });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', message: 'Midtrans webhook is active' }, { status: 200 });
}
