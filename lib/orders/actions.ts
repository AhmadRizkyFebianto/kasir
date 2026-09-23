'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type OrderItemInput = { id: string; price: number; quantity: number };

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const items = JSON.parse(String(formData.get('items') || '[]')) as OrderItemInput[];
    const method = String(formData.get('payment_method') || 'cash');
    const amountReceived = Number(formData.get('amount_received') || 0);

    if (!items.length) return { error: 'Keranjang kosong' };
    if (!['cash', 'qris', 'bank_transfer', 'e_wallet'].includes(method)) return { error: 'Metode pembayaran tidak valid' };

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    if (totalAmount <= 0) return { error: 'Total tidak valid' };
    if (method === 'cash' && amountReceived < totalAmount) return { error: 'Uang diterima kurang dari total' };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ kasir_id: user.id, total_amount: totalAmount, status: method === 'cash' ? 'completed' : 'pending' })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Create order error:', orderError);
      return { error: 'Failed to create order' };
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }))
    );

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id);
      return { error: 'Failed to create order items' };
    }

    const paid = method === 'cash';
    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: order.id,
      amount: totalAmount,
      method,
      status: paid ? 'paid' : 'pending',
      paid_at: paid ? new Date().toISOString() : null,
    });

    if (paymentError) {
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      return { error: 'Failed to create payment' };
    }

    revalidatePath('/dashboard/pos');
    redirect(`/dashboard/orders/${order.id}`);
  } catch (error) {
    console.error('Create order error:', error);
    return { error: 'An error occurred while creating the order' };
  }
}

export async function getOrder(orderId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_items (id, quantity, price, subtotal, product_id, products (name)),
      payments (id, amount, method, status),
      profiles:kasir_id (full_name)
    `)
    .eq('id', orderId)
    .single();

  return data;
}
