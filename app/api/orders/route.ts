import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createPaymentForOrder } from '@/lib/payment/midtrans-client';

type OrderItemInput = { id: string; price: number; quantity: number };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items, payment_method, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
    }

    if (!payment_method || !['cash', 'qris', 'bank_transfer', 'midtrans'].includes(payment_method)) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum: number, item: OrderItemInput) => sum + Number(item.price) * Number(item.quantity), 0);
    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Total tidak valid' }, { status: 400 });
    }

    // Generate order ID
    const orderPrefix = 'ORD';
    const { data: latestOrder } = await supabase
      .from('orders')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    let orderNumber = 1;
    if (latestOrder) {
      const lastId = latestOrder.id.replace(orderPrefix, '');
      orderNumber = parseInt(lastId) + 1;
    }
    
    const orderId = `${orderPrefix}${orderNumber.toString().padStart(6, '0')}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ 
        id: orderId,
        kasir_id: user.id, 
        total_amount: totalAmount, 
        status: payment_method === 'cash' ? 'completed' : 'pending' 
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Create order error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((item: OrderItemInput) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }))
    );

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // Create payment record
    const paid = payment_method === 'cash';
    const paymentStatus = paid ? 'paid' : 'pending';
    
    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: order.id,
      amount: totalAmount,
      method: payment_method,
      status: paymentStatus,
      paid_at: paid ? new Date().toISOString() : null,
    });

    if (paymentError) {
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    // If Midtrans payment, create snap transaction
    let midtransToken: string | null = null;
    if (payment_method === 'midtrans') {
      try {
        const customerDetails = {
          firstName: customer?.firstName || 'Guest',
          email: customer?.email || '',
          phone: customer?.phone || '',
        };
        
        const result = await createPaymentForOrder({
          orderId: order.id,
          amount: totalAmount,
          customer: customerDetails,
          items: items.map(item => ({
            id: item.id,
            name: item.name || '',
            quantity: item.quantity,
            price: item.price,
          })),
        });
        
        midtransToken = result.token;
        
        // Update payment with midtrans token
        await supabase.from('payments').update({
          midtrans_token: result.token,
          midtrans_status: 'pending',
        }).eq('order_id', order.id);
      } catch (midtransError) {
        console.error('Midtrans payment creation error:', midtransError);
      }
    }

    // Revalidate POS page
    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/orders', 'layout');

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      redirect: payment_method === 'midtrans' ? false : true,
      midtransToken,
      totalAmount,
    }, { status: 200 });

  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json({ error: 'An error occurred while creating the order' }, { status: 500 });
  }
}