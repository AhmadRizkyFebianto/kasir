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

// Transaction Actions

export async function getTransactionStatus(orderId: string) {
  const core = getCoreClient();
  try {
    const status = await core.transaction.status(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans getTransactionStatus error:', error);
    throw error;
  }
}

export async function approveTransaction(orderId: string) {
  const core = getCoreClient();
  try {
    const status = await core.transaction.approve(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans approveTransaction error:', error);
    throw error;
  }
}

export async function denyTransaction(orderId: string) {
  const core = getCoreClient();
  try {
    const status = await core.transaction.deny(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans denyTransaction error:', error);
    throw error;
  }
}

export async function cancelTransaction(orderId: string) {
  const core = getCoreClient();
  try {
    const status = await core.transaction.cancel(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans cancelTransaction error:', error);
    throw error;
  }
}

export async function expireTransaction(orderId: string) {
  const core = getCoreClient();
  try {
    const status = await core.transaction.expire(orderId);
    return status;
  } catch (error) {
    console.error('Midtrans expireTransaction error:', error);
    throw error;
  }
}

export async function refundTransaction(
  orderId: string,
  refundCharge?: string,
  amount?: number,
  reason?: string
) {
  const core = getCoreClient();
  try {
    const parameter: any = {
      refundCharge: refundCharge || 'true',
    };
    
    if (amount) {
      parameter.refund_amount = amount;
    }
    
    if (reason) {
      parameter.reason = reason;
    }
    
    const status = await core.transaction.refund(orderId, parameter);
    return status;
  } catch (error) {
    console.error('Midtrans refundTransaction error:', error);
    throw error;
  }
}

export async function createPaymentForOrder({
  orderId,
  amount,
  customer,
  items,
}: {
  orderId: string;
  amount: number;
  customer: { firstName: string; email: string; phone: string };
  items?: { id: string; name: string; quantity: number; price: number }[];
}) {
  const snap = getSnapClient();

  const parameter = {
    transaction_details: {
      order_id: orderId,
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
    console.error('Midtrans createPaymentForOrder error:', error);
    throw error;
  }
}