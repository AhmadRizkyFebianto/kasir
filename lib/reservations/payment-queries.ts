import { createClient } from '@/lib/supabase/client';

export async function getPaymentMethods() {
  const supabase = createClient();
  const { data } = await supabase
    .from('payment_methods')
    .select('id, name, icon, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });
  return data || [];
}

export async function createPaymentTransaction({
  reservation_id,
  method_id,
  amount,
  status = 'pending',
}: {
  reservation_id: string;
  method_id: string;
  amount: number;
  status?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .insert({
      reservation_id,
      method_id,
      amount,
      status,
    })
    .select()
    .single();
  return { data, error };
}

export async function updatePaymentStatus({
  payment_id,
  status,
  midtrans_status,
}: {
  payment_id: string;
  status: string;
  midtrans_status?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      midtrans_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment_id)
    .select()
    .single();
  return { data, error };
}

export async function getPaymentByReservationId(reservation_id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('reservation_id', reservation_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

export async function getPaymentById(payment_id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', payment_id)
    .single();
  return { data, error };
}

export async function getPaymentByOrderId(order_id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', order_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

export async function updatePaymentWithMidtransStatus({
  payment_id,
  status,
  midtrans_status,
  settlement_time,
}: {
  payment_id: string;
  status: string;
  midtrans_status?: string;
  settlement_time?: string;
}) {
  const supabase = createClient();
  const updates: any = {
    status,
    midtrans_status,
    updated_at: new Date().toISOString(),
  };
  
  if (settlement_time) {
    updates.settlement_time = settlement_time;
  }
  
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', payment_id)
    .select()
    .single();
  return { data, error };
}

export async function getPaymentsByStatus(status: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getPaymentHistory({
  page = 1,
  limit = 20,
  status,
  date_from,
  date_to,
}: {
  page?: number;
  limit?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  const supabase = createClient();
  let query = supabase
    .from('payments')
    .select('*, reservation:reservations(id, guest_name, reservation_code, start_time), payment_method:payment_methods(name, icon)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (date_from) {
    query = query.gte('created_at', date_from);
  }

  if (date_to) {
    query = query.lte('created_at', date_to);
  }

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await query.range(start, end);

  return {
    data: data || [],
    count: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}