import { NextRequest, NextResponse } from 'next/server';
import { getCoreClient } from '@/lib/payment/midtrans-client';
import { getPaymentByOrderId, updatePaymentWithMidtransStatus } from '@/lib/reservations/payment-queries';
import { getTransactionStatus } from '@/lib/payment/midtrans-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status_code, gross_amount, payment_type, signature_key } = body;

    const core = getCoreClient();
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

    // Get payment by order_id
    const { data: payment } = await getPaymentByOrderId(order_id);

    if (payment) {
      // Get transaction status from Midtrans for settlement_time
      let settlementTime: string | undefined;
      try {
        const midtransStatus = await getTransactionStatus(order_id);
        settlementTime = midtransStatus.settlementTime || midtransStatus.settlement_time;
      } catch (e) {
        console.error('Failed to get transaction status:', e);
      }

      await updatePaymentWithMidtransStatus({
        payment_id: payment.id,
        status: paymentStatus,
        midtrans_status: status_code,
        settlement_time: settlementTime,
      });
    }

    return NextResponse.json({ status: 'success', message: 'Payment updated' }, { status: 200 });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', message: 'Midtrans webhook is active' }, { status: 200 });
}
