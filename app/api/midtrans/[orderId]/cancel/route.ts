import { NextRequest, NextResponse } from 'next/server';
import { getCoreClient } from '@/lib/payment/midtrans-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }
    const status = await getCoreClient().transaction.cancel(orderId);
    return NextResponse.json({ success: true, message: 'Transaction cancelled', status }, { status: 200 });
  } catch (error) {
    console.error('Midtrans cancel error:', error);
    return NextResponse.json({ error: 'Failed to cancel transaction' }, { status: 500 });
  }
}
