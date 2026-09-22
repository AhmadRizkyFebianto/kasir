import { createClient } from '@/lib/supabase/server';

export async function getDashboardMetrics() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's revenue
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .eq('status', 'completed');

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

  // Today's reservations
  const { count: todayReservations } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString());

  // Places availability
  const { data: places } = await supabase
    .from('places')
    .select('status');

  const availablePlaces = places?.filter((p) => p.status === 'available').length || 0;
  const occupiedPlaces = places?.filter((p) => p.status === 'occupied').length || 0;

  // Pending payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return {
    todayRevenue,
    todayTransactions: todayTransactions || 0,
    todayReservations: todayReservations || 0,
    availablePlaces,
    occupiedPlaces,
    totalPlaces: places?.length || 0,
    pendingPayments: pendingPayments || 0,
  };
}

export async function getRecentReservations(limit = 10) {
  const supabase = await createClient();

  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id,
      reservation_code,
      start_time,
      end_time,
      status,
      total_amount,
      profiles:customer_id (
        full_name,
        phone
      ),
      places (
        name,
        number
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  return reservations || [];
}

export async function getRevenueChart(days = 7) {
  const supabase = await createClient();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  // Group by date
  const revenueByDate: Record<string, number> = {};

  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    revenueByDate[date] = (revenueByDate[date] || 0) + Number(order.total_amount);
  });

  return Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export async function getPopularPlaces(limit = 5) {
  const supabase = await createClient();

  const { data: places } = await supabase
    .from('reservations')
    .select(`
      place_id,
      places (
        name,
        number
      )
    `)
    .eq('status', 'completed');

  // Count reservations per place
  const placeCounts: Record<string, { name: string; number: string; count: number }> = {};

  places?.forEach((reservation) => {
    const placeId = reservation.place_id;
    const place = Array.isArray(reservation.places) 
      ? reservation.places[0] 
      : reservation.places;
    
    if (place && typeof place === 'object' && 'name' in place && 'number' in place) {
      if (!placeCounts[placeId]) {
        placeCounts[placeId] = {
          name: place.name as string,
          number: place.number as string,
          count: 0,
        };
      }
      placeCounts[placeId].count++;
    }
  });

  // Sort and limit
  return Object.values(placeCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}