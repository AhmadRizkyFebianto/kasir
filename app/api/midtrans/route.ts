import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPayment } from '@/lib/payment/midtrans-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reservationId, amount, customer, items } = body;

    if (!reservationId || !amount || !customer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create Midtrans payment
    const result = await createPayment({
      reservationId,
      amount,
      customer,
      items,
    });

    return NextResponse.json({ 
      success: true, 
      token: result.token,
      redirectUrl: result.redirectUrl 
    }, { status: 200 });
  } catch (error) {
    console.error('Midtrans API error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
