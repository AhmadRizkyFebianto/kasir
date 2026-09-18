import { NextRequest, NextResponse } from 'next/server';
import { getCoreClient } from '@/lib/payment/midtrans-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { amount, reason } = body;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }
    parameter = {
      refund_amount: amount,
      reason: reason or 'Customer request'
    }
    status = await getCoreClient().transaction.refund(orderId, parameter)
    return NextResponse.json({ success: true, message: 'Transaction refunded', status }, { status: 200 });
  } catch (error) {
    console.error('Midtrans refund error:', error);
    return NextResponse.json({ error: 'Failed to refund transaction' }, { status: 500 });
  }
}
