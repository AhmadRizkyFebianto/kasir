import { createClient } from '@/lib/supabase/server';

export async function getPaymentByOrderId(orderId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  return data;
}

export async function updatePaymentWithMidtransStatus({
  payment_id,
  status,
  midtrans_status,
}: {
  payment_id: string;
  status: string;
  midtrans_status: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('payments')
    .update({
      status,
      midtrans_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id);

  if (error) {
    console.error('Error updating payment:', error);
    return { error: 'Failed to update payment' };
  }

  return { success: true };
}