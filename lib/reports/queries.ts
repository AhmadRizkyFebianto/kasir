import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function getDailySales(date: string) {
  const supabase = await createClient();
  
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_number,
      kasir_id,
      profiles:kasir_id (full_name)
    `)
    .ilike("created_at", `${date}%`)
    .order("created_at", { ascending: false });

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const totalTransactions = orders?.length || 0;

  // Payment method breakdown
  const { data: payments } = await supabase
    .from("payments")
    .select("method")
    .in("payment_status", ["paid", "pending"])
    .ilike("created_at", `${date}%`);

  const paymentMethodBreakdown: Record<string, number> = {};
  payments?.forEach((payment) => {
    const method = payment.method || "cash";
    paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + 1;
  });

  return {
    totalRevenue,
    totalTransactions,
    paymentMethodBreakdown,
    orders: orders || [],
  };
}

export async function getWeeklySales(startDate: string, endDate: string) {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_number
    `)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  // Group by date
  const dailyBreakdown: Record<string, { date: string; revenue: number; transactions: number }> = {};
  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    if (!dailyBreakdown[date]) {
      dailyBreakdown[date] = { date, revenue: 0, transactions: 0 };
    }
    dailyBreakdown[date].revenue += Number(order.total_amount);
    dailyBreakdown[date].transactions += 1;
  });

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const totalTransactions = orders?.length || 0;

  return {
    dailyBreakdown: Object.values(dailyBreakdown),
    totalRevenue,
    totalTransactions,
  };
}

export async function getMonthlySales(year: number, month: number) {
  const supabase = await createClient();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_number
    `)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });

  // Group by date
  const dailyBreakdown: Record<string, { date: string; revenue: number; transactions: number }> = {};
  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    if (!dailyBreakdown[date]) {
      dailyBreakdown[date] = { date, revenue: 0, transactions: 0 };
    }
    dailyBreakdown[date].revenue += Number(order.total_amount);
    dailyBreakdown[date].transactions += 1;
  });

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const totalTransactions = orders?.length || 0;

  return {
    dailyBreakdown: Object.values(dailyBreakdown),
    totalRevenue,
    totalTransactions,
  };
}

export async function getProductSales(startDate: string, endDate: string) {
  const supabase = await createClient();

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, quantity, price, products (name, sku)")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Aggregate by product
  const productSales: Record<string, { name: string; sku: string; quantity: number; revenue: number }> = {};
  orderItems?.forEach((item) => {
    if (!item.products || Array.isArray(item.products)) return;
    
    const productId = item.product_id;
    if (!productSales[productId]) {
      productSales[productId] = {
        name: (item.products as any).name || "Produk",
        sku: (item.products as any).sku || "-",
        quantity: 0,
        revenue: 0,
      };
    }
    productSales[productId].quantity += item.quantity;
    productSales[productId].revenue += item.quantity * Number(item.price);
  });

  return Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
}
