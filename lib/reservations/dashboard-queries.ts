import { createClient } from '@/lib/supabase/client';

export async function getCategoriesForFilter() {
  const supabase = createClient();
  const { data } = await supabase
    .from('place_categories')
    .select('id, name, icon')
    .order('name', { ascending: true });
  return data || [];
}

export async function getDashboardReports() {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = today.toISOString();

  const { data: todayReservations, error: resError } = await supabase
    .from('reservations')
    .select('status, total_amount, places(category_id), payments(status, method)')
    .gte('start_time', now);
  if (resError) console.error('Fetch today reservations failed:', resError);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const { data: weekReservations, error: weekError } = await supabase
    .from('reservations')
    .select('status, total_amount, created_at, places(category_id), payments(status, method)')
    .gte('start_time', thisWeekStart.toISOString());
  if (weekError) console.error('Fetch week reservations failed:', weekError);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const { data: monthReservations, error: monthError } = await supabase
    .from('reservations')
    .select('status, total_amount, created_at, places(category_id), payments(status, method)')
    .gte('start_time', thisMonthStart.toISOString());
  if (monthError) console.error('Fetch month reservations failed:', monthError);

  const { data: categories, error: catError } = await supabase
    .from('place_categories')
    .select('id, name, icon');
  if (catError) console.error('Fetch categories failed:', catError);

  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('status, category_id');
  if (placesError) console.error('Fetch places failed:', placesError);

  const calculateRevenue = (data: any[]) => {
    return data?.reduce((sum, r) => {
      const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
      return payment?.status === 'paid' ? sum + (r.total_amount || 0) : sum;
    }, 0) || 0;
  };

  const categoryRevenue = (data: any[], cats: any[]) => {
    const breakdown: Record<string, number> = {};
    cats?.forEach(cat => breakdown[cat.name] = 0);
    data?.forEach(r => {
      const place = Array.isArray(r.places) ? r.places[0] : r.places;
      const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
      if (payment?.status === 'paid' && place?.category_id) {
        const cat = cats?.find(c => c.id === place.category_id);
        if (cat) breakdown[cat.name] = (breakdown[cat.name] || 0) + (r.total_amount || 0);
      }
    });
    return Object.entries(breakdown).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
  };

  const paymentMethodRevenue = (data: any[]) => {
    const breakdown: Record<string, number> = {};
    data?.forEach(r => {
      const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
      if (payment?.status === 'paid' && payment.method) {
        breakdown[payment.method] = (breakdown[payment.method] || 0) + (r.total_amount || 0);
      }
    });
    return Object.entries(breakdown).map(([method, amount]) => ({
      method, amount, label: method === 'cash' ? 'Tunai' : method === 'qris' ? 'QRIS' : method === 'bank_transfer' ? 'Transfer' : 'VA'
    }));
  };

  const dailyRevenue = (data: any[]) => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    data?.forEach(r => {
      const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
      if (payment?.status === 'paid') {
        const day = r.created_at?.split('T')[0];
        if (days.hasOwnProperty(day)) days[day] = (days[day] || 0) + (r.total_amount || 0);
      }
    });
    return Object.entries(days).map(([date, amount]) => ({
      date, amount, label: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' })
    }));
  };

  const paymentStatusCounts = (data: any[]) => {
    const counts = { paid: 0 as number, pending: 0 as number, failed: 0 as number, refunded: 0 as number };
    data?.forEach(r => {
      const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
      if (payment?.status in counts) counts[payment.status as keyof typeof counts]++;
    });
    return counts;
  };

  const placeStatusCounts = (data: any[]) => {
    const counts = { available: 0 as number, reserved: 0 as number, occupied: 0 as number, maintenance: 0 as number };
    data?.forEach(p => { if (p.status in counts) counts[p.status as keyof typeof counts]++; });
    return counts;
  };

  return {
    today: {
      totalReservations: todayReservations?.length || 0,
      totalRevenue: calculateRevenue(todayReservations || []),
      pendingPayment: paymentStatusCounts(todayReservations || []).pending,
      checkedIn: todayReservations?.filter(r => r.status === 'checked_in').length || 0,
    },
    thisWeek: {
      totalReservations: weekReservations?.length || 0,
      totalRevenue: calculateRevenue(weekReservations || []),
      daily: dailyRevenue(weekReservations || []),
    },
    thisMonth: {
      totalReservations: monthReservations?.length || 0,
      totalRevenue: calculateRevenue(monthReservations || []),
    },
    categories: {
      list: (categories || [])?.map(c => ({ id: c.id, name: c.name, icon: c.icon || 'table' })),
      revenue: categoryRevenue(todayReservations || [], categories || []),
    },
    paymentMethods: paymentMethodRevenue(todayReservations || []),
    places: { total: places?.length || 0, byStatus: placeStatusCounts(places || []) },
  };
}
