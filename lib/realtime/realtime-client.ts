import { createClient } from '@/lib/supabase/client';

export class RealtimeClient {
  private supabase: any;
  private channels: Map<string, any> = new Map();

  constructor() {
    this.supabase = createClient();
  }

  async subscribeToReservations(callback: (data: any) => void) {
    const channel = this.supabase
      .channel('reservations-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
        },
        callback
      )
      .subscribe();

    this.channels.set('reservations', channel);
    return channel;
  }

  async subscribeToPayments(callback: (data: any) => void) {
    const channel = this.supabase
      .channel('payments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        callback
      )
      .subscribe();

    this.channels.set('payments', channel);
    return channel;
  }

  async subscribeToPlaces(callback: (data: any) => void) {
    const channel = this.supabase
      .channel('places-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'places',
        },
        callback
      )
      .subscribe();

    this.channels.set('places', channel);
    return channel;
  }

  async unsubscribeAll() {
    for (const [name, channel] of this.channels) {
      await this.supabase.removeChannel(channel);
    }
    this.channels.clear();
  }
}

export const realtimeClient = new RealtimeClient();
