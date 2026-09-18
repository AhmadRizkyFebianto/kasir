import Snap from 'midtrans-client/lib/snap';
import CoreApi from 'midtrans-client/lib/coreApi';

let snap: any;
let core: any;

export function getSnapClient() {
  if (!snap) {
    snap = new Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }
  return snap;
}

export function getCoreClient() {
  if (!core) {
    core = new CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }
  return core;
}

export async function createPayment({
  reservationId,
  amount,
  customer,
  items,
}: {
  reservationId: string;
  amount: number;
  customer: { firstName: string; email: string; phone: string };
  items?: { id: string; name: string; quantity: number; price: number }[];
}) {
  const snap = getSnapClient();

  const parameter = {
    transaction_details: {
      order_id: `RES-${reservationId}-${Date.now()}`,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customer.firstName,
      email: customer.email,
      phone: customer.phone,
    },
    item_details: items?.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/status?order_id={order_id}`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error?order_id={order_id}`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?order_id={order_id}`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return { token: transaction.token, redirectUrl: transaction.redirect_url };
  } catch (error) {
    console.error('Midtrans createPayment error:', error);
    throw error;
  }
}

export async function verifySignature(
  orderId: string,
  status_code: string,
  gross_amount: string,
  signature_key: string
) {
  const core = getCoreClient();
  const status = await core.transaction.status(orderId);
  
  // Verify status
  if (status.statusCode === status_code && status.grossAmount === gross_amount) {
    // Check signature using Midtrans library
    const is_valid = core.transaction.checkNotificationStatus(orderId, signature_key);
    return is_valid ? status : null;
  }
  return null;
}

export async function processPaymentNotification(body: any) {
  const core = getCoreClient();
  const status = await core.transaction.status(body.order_id);
  
  return {
    orderId: body.order_id,
    transactionStatus: status.transactionStatus,
    fraudStatus: status.fraudStatus,
    grossAmount: status.grossAmount,
    paymentType: status.paymentType,
    maskedCard: status.maskedCard,
    bank: status.bank,
    approvalCode: status.approvalCode,
    settlementTime: status.settlementTime || '',
  };
}