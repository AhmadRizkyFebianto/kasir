export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'kasir' | 'customer';

export type PlaceStatus = 'available' | 'reserved' | 'occupied' | 'maintenance';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded';

export type PaymentMethod =
  | 'cash'
  | 'qris'
  | 'virtual_account'
  | 'e_wallet'
  | 'bank_transfer';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      place_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      places: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          number: string;
          capacity: number;
          price_per_hour: number;
          description: string | null;
          facilities: string[] | null;
          status: PlaceStatus;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          number: string;
          capacity: number;
          price_per_hour: number;
          description?: string | null;
          facilities?: string[] | null;
          status?: PlaceStatus;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          number?: string;
          capacity?: number;
          price_per_hour?: number;
          description?: string | null;
          facilities?: string[] | null;
          status?: PlaceStatus;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          place_id: string;
          customer_id: string;
          start_time: string;
          end_time: string;
          duration_hours: number;
          total_amount: number;
          status: ReservationStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          customer_id: string;
          start_time: string;
          end_time: string;
          duration_hours: number;
          total_amount: number;
          status?: ReservationStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          customer_id?: string;
          start_time?: string;
          end_time?: string;
          duration_hours?: number;
          total_amount?: number;
          status?: ReservationStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          reservation_id: string | null;
          order_id: string | null;
          amount: number;
          method: PaymentMethod;
          status: PaymentStatus;
          payment_gateway_id: string | null;
          payment_gateway_response: Json | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_id?: string | null;
          order_id?: string | null;
          amount: number;
          method: PaymentMethod;
          status?: PaymentStatus;
          payment_gateway_id?: string | null;
          payment_gateway_response?: Json | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string | null;
          order_id?: string | null;
          amount?: number;
          method?: PaymentMethod;
          status?: PaymentStatus;
          payment_gateway_id?: string | null;
          payment_gateway_response?: Json | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          kasir_id: string | null;
          total_amount: number;
          status: OrderStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          kasir_id?: string | null;
          total_amount: number;
          status?: OrderStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          kasir_id?: string | null;
          total_amount?: number;
          status?: OrderStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      place_status: PlaceStatus;
      reservation_status: ReservationStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      order_status: OrderStatus;
    };
  };
}