import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export async function getDashboardMetrics() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Today's revenue
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total_amount, status')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  const todayRevenue = todayOrders?.reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  ) || 0;

  // Today's transactions count
  const { count: todayTransactions } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  // This month's revenue
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', startOfMonth.toISOString());

  const thisMonthRevenue = monthOrders?.reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  ) || 0;

  // Pending payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at, order_number')
    .order('created_at', { ascending: false })
    .limit(10);

  // Top products today
  const { data: topProductsRaw } = await supabase
    .from('order_items')
    .select('product_id, quantity, price, products (name)')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  const topProductsMap: Record<string, { name: string; total_quantity: number; total_revenue: number }> = {};
  topProductsRaw?.forEach((item) => {
    const productId = item.product_id;
    if (!topProductsMap[productId] || !item.products) return;
    
    const productName = (item.products as any).name || 'Produk';
    if (!topProductsMap[productId]) {
      topProductsMap[productId] = { 
        name: productName, 
        total_quantity: 0, 
        total_revenue: 0 
      };
    }
    topProductsMap[productId].total_quantity += item.quantity;
    topProductsMap[productId].total_revenue += item.quantity * Number(item.price);
  });

  const topProducts = Object.entries(topProductsMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 5);

  return {
    todayRevenue,
    todayTransactions: todayTransactions || 0,
    thisMonthRevenue,
    pendingPayments: pendingPayments || 0,
    recentOrders: recentOrders || [],
    topProducts: topProducts || [],
  };
}