'use server';

import { createClient } from '@/lib/supabase/server';

interface Order {
  id: string;
  kasir_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  profiles?: { full_name: string }[];
  order_items?: {
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    products?: { name: string }[];
  }[];
  payments?: { id: string; amount: number; method: string; status: string }[];
}

export async function getOrders(searchParams?: {
  status?: string;
  search?: string;
  date?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      kasir_id,
      profiles:kasir_id (full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (searchParams?.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams?.search) {
    query = query.or(`id.ilike.%${searchParams.search}%`);
  }

  if (searchParams?.date) {
    const dateStart = `${searchParams.date}T00:00:00`;
    const dateEnd = `${searchParams.date}T23:59:59`;
    query = query.gte('created_at', dateStart).lte('created_at', dateEnd);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data as Order[];
}

export async function getOrdersCount(searchParams?: {
  status?: string;
  search?: string;
  date?: string;
}) {
  const orders = await getOrders(searchParams);
  return orders.length;
}