import { createClient } from '@/lib/supabase/server';

export async function getReservationsForKasir(filters?: {
  date?: string;
  status?: string;
  search?: string;
  quick?: string;
  category_id?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) {
  const supabase = await createClient();

  let query = supabase
    .from('reservations')
    .select(`
      id,
      start_time,
      end_time,
      duration_hours,
      status,
      total_amount,
      notes,
      created_at,
      profiles:customer_id (id, full_name, phone, email),
      places (id, name, number),
      payments (id, status, method, amount)
    `);

  if (filters?.sort_by || filters?.sort_order) {
    query = query.order(filters.sort_by === 'start_time' ? 'start_time' : 'created_at', { ascending: filters.sort_order === 'asc' });
  } else {
    query = query.order('start_time', { ascending: false });
  }

  if (filters?.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    query = query.gte('start_time', start.toISOString()).lte('start_time', end.toISOString());
  }

  if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);

  if (filters?.category_id) {
    query = query.eq('places.category_id', filters.category_id);
  }

  if (filters?.payment_method) {
    query = query.eq('payments.method', filters.payment_method);
  }

  if (filters?.start_date && filters?.end_date) {
    const start = new Date(filters.start_date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.end_date);
    end.setHours(23, 59, 59, 999);
    query = query.gte('start_time', start.toISOString()).lte('start_time', end.toISOString());
  }

  const { data } = await query;
  let rows = (data || []).map((r) => ({ ...r, reservation_code: `RSV-${r.id.slice(0, 8).toUpperCase()}` }));

  if (filters?.quick) {
    rows = rows.filter((r) => {
      const payment = Array.isArray(r.payments) ? r.payments[0] : r.payments;
      if (filters.quick === 'unpaid') return payment?.status !== 'paid' && r.status !== 'cancelled' && r.status !== 'completed';
      if (filters.quick === 'ready') return r.status === 'confirmed' && payment?.status === 'paid';
      if (filters.quick === 'active') return r.status === 'checked_in' && payment?.status === 'paid';
      return true;
    });
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((r) => {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const place = Array.isArray(r.places) ? r.places[0] : r.places;
      return r.reservation_code.toLowerCase().includes(q)
        || profile?.full_name?.toLowerCase().includes(q)
        || profile?.phone?.includes(q)
        || place?.name?.toLowerCase().includes(q);
    });
  }

  const seen = new Set();
  rows = rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return rows;
}

export async function getTodayReservations() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data } = await supabase
    .from('reservations')
    .select(`id, start_time, end_time, status, total_amount, profiles:customer_id (full_name, phone), places (name, number)`)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .order('start_time', { ascending: true });

  return data || [];
}

export async function getReservationStats() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data } = await supabase
    .from('reservations')
    .select('status')
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString());

  return {
    total: data?.length || 0,
    pending: data?.filter((r) => r.status === 'pending').length || 0,
    confirmed: data?.filter((r) => r.status === 'confirmed').length || 0,
    checked_in: data?.filter((r) => r.status === 'checked_in').length || 0,
    completed: data?.filter((r) => r.status === 'completed').length || 0,
    cancelled: data?.filter((r) => r.status === 'cancelled').length || 0,
  };
}

export async function getCategoriesForFilter() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('place_categories')
    .select('id, name, icon')
    .order('name', { ascending: true });
  return data || [];
}

// =====================================================
// DASHBOARD REPORTS
// =====================================================

export async function getDashboardReports() {
  const supabase = await createClient();
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