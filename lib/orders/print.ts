/**
 * Helper untuk format data struk pembelian
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ReceiptData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  orderNumber: string;
  orderDate: string;
  cashierName: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  thankYouMessage: string;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(dateObj);
}

export async function generateReceiptData(order: any, settings: any): Promise<ReceiptData> {
  const items: ReceiptItem[] = (order.order_items || []).map((item: any) => ({
    name: item.products?.[0]?.name || "Unknown Product",
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal || item.price * item.quantity,
  }));

  const subtotal = items.reduce((sum: number, item: ReceiptItem) => sum + item.subtotal, 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  const payment = order.payments?.[0];
  const amountPaid = payment?.amount || total;
  const change = amountPaid - total;

  return {
    storeName: settings?.store_name || "Kasir Pro",
    storeAddress: settings?.store_address || "",
    storePhone: settings?.store_phone || "",
    orderNumber: "ORD-" + order.id.slice(-6).toUpperCase(),
    orderDate: formatDate(order.created_at),
    cashierName: order.profiles?.[0]?.full_name || "-",
    items,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod: getPaymentMethodName(payment?.method),
    amountPaid,
    change,
    thankYouMessage: "Terima kasih atas kunjungan Anda!",
  };
}

export function getPaymentMethodName(method?: string): string {
  const map: Record<string, string> = {
    cash: "Tunai",
    qris: "QRIS",
    bank_transfer: "Transfer Bank",
    midtrans: "Midtrans",
    e_wallet: "E-Wallet",
  };
  return map[method || ""] || method || "-";
}
