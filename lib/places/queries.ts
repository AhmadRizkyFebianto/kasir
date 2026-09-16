'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type Place = Database['public']['Tables']['places']['Row'];
type PlaceCategory = Database['public']['Tables']['place_categories']['Row'];
type Reservation = Database['public']['Tables']['reservations']['Row'];

export async function getPlaces() {
  const supabase = await createClient();

  const { data: places, error } = await supabase
    .from('places')
    .select(
      `
      *,
      place_categories (
        id,
        name,
        description,
        icon
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  return places;
}

export async function getPlaceById(id: string) {
  const supabase = await createClient();

  const { data: place, error } = await supabase
    .from('places')
    .select(
      `
      *,
      place_categories (
        id,
        name,
        description,
        icon
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching place:', error);
    return null;
  }

  return place;
}

export async function getPlacesByCategory(categoryId: string) {
  const supabase = await createClient();

  const { data: places, error } = await supabase
    .from('places')
    .select(
      `
      *,
      place_categories (
        id,
        name,
        description,
        icon
      )
    `
    )
    .eq('category_id', categoryId)
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching places by category:', error);
    return [];
  }

  return places;
}

export async function getPlaceCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('place_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories;
}

export async function checkAvailability(
  placeId: string,
  startTime: Date,
  endTime: Date
) {
  const supabase = await createClient();

  // Check for overlapping reservations
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('place_id', placeId)
    .in('status', ['pending', 'confirmed', 'checked_in'])
    .or(
      `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
    );

  if (error) {
    console.error('Error checking availability:', error);
    return false;
  }

  // If there are any overlapping reservations, the place is not available
  return reservations.length === 0;
}

export async function getPlaceReservations(
  placeId: string,
  date: Date
) {
  const supabase = await createClient();

  // Get start and end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('place_id', placeId)
    .in('status', ['pending', 'confirmed', 'checked_in'])
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return reservations;
}