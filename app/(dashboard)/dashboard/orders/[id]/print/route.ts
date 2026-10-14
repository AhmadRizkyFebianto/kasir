import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/orders/print';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (quantity, price, subtotal, product_id, products (name)),
        payments (amount, method),
        profiles:kasir_id (full_name)
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: settings } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    const items: Array<{name: string; quantity: number; price: number; subtotal: number}> = (order.order_items || []).map((item: any) => ({
      name: item.products?.[0]?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal || item.price * item.quantity,
    }));

    const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const tax = 0;
    const discount = 0;
    const total = subtotal + tax - discount;

    const payment = order.payments?.[0];
    const amountPaid = payment?.amount || total;
    const change = amountPaid - total;

    const orderDate = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(order.created_at));

    const itemsHtml = items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px;">
        <span>${item.quantity}x ${item.name}</span>
        <span>${formatCurrency(item.subtotal)}</span>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Struk Pembayaran - ${settings?.store_name || 'Kasir Pro'}</title>
        <script>
          window.onload = function() { window.print(); }
        </script>
        <style>
          body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; }
          .header p { margin: 5px 0; font-size: 12px; color: #666; }
          .divider { border-top: 2px solid #ddd; margin: 15px 0; }
          .section { margin-bottom: 15px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
          .total-row.total { font-weight: bold; font-size: 16px; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${settings?.store_name || 'Kasir Pro'}</h1>
          <p>${settings?.store_address || ''}</p>
          <p>${settings?.store_phone || ''}</p>
        </div>
        <div class="divider"></div>
        <div class="section">
          <p>Order: ORD-${order.id.slice(-6).toUpperCase()}</p>
          <p>${orderDate}</p>
          <p>Kasir: ${order.profiles?.[0]?.full_name || '-'}</p>
        </div>
        <div class="divider"></div>
        <div class="section">
          ${itemsHtml}
        </div>
        <div class="divider"></div>
        <div class="section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Diskon</span>
            <span style="color: green">-${formatCurrency(discount)}</span>
          </div>
          <div class="total-row">
            <span>Pajak</span>
            <span>${formatCurrency(tax)}</span>
          </div>
          <div class="total-row total">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
          </div>
          <div class="total-row">
            <span>Bayar</span>
            <span>${formatCurrency(amountPaid)}</span>
          </div>
          <div class="total-row" style="color: green; font-weight: bold;">
            <span>Kembalian</span>
            <span>${formatCurrency(change)}</span>
          </div>
        </div>
        <div class="footer">
          <p>Terima kasih atas kunjungan Anda</p>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Print route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
