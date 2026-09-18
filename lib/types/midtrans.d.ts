declare module 'midtrans-client/lib/snap' {
  class Snap {
    constructor(config: { isProduction: boolean; serverKey: string; clientKey: string });
    createTransaction(params: any): Promise<{ token: string; redirect_url: string }>;
  }
  export default Snap;
}

declare module 'midtrans-client/lib/coreApi' {
  class CoreApi {
    constructor(config: { isProduction: boolean; serverKey: string; clientKey: string });
    transaction: {
      status(orderId: string): Promise<any>;
      checkNotificationStatus(orderId: string, signatureKey: string): boolean;
    };
  }
  export default CoreApi;
}
