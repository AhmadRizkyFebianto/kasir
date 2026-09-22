'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPlace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    const name = String(formData.get('name') || '');
    const description = String(formData.get('description') || '');
    const capacity = Number(formData.get('capacity') || 0);
    const price_per_hour = Number(formData.get('price_per_hour') || 0);
    const is_active = formData.get('is_active') === 'on';

    if (!name || capacity <= 0 || price_per_hour <= 0) {
      return { error: 'Nama, kapasitas, dan harga per jam wajib diisi' };
    }

    const { error } = await supabase
      .from('places')
      .insert({ name, description, capacity, price_per_hour, is_active });

    if (error) {
      console.error('Create place error:', error);
      return { error: 'Failed to create place' };
    }

    revalidatePath('/dashboard/places');
  } catch (error) {
    console.error('Create place error:', error);
    return { error: 'An error occurred while creating place' };
  }
}

export async function updatePlace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '');
    const description = String(formData.get('description') || '');
    const capacity = Number(formData.get('capacity') || 0);
    const price_per_hour = Number(formData.get('price_per_hour') || 0);
    const is_active = formData.get('is_active') === 'on';

    if (!id) return { error: 'Place ID is required' };

    const { error } = await supabase
      .from('places')
      .update({ name, description, capacity, price_per_hour, is_active })
      .eq('id', id);

    if (error) {
      console.error('Update place error:', error);
      return { error: 'Failed to update place' };
    }

    revalidatePath('/dashboard/places');
  } catch (error) {
    console.error('Update place error:', error);
    return { error: 'An error occurred while updating place' };
  }
}

export async function deletePlace(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete place error:', error);
      return { error: 'Failed to delete place' };
    }

    revalidatePath('/dashboard/places');
  } catch (error) {
    console.error('Delete place error:', error);
    return { error: 'An error occurred while deleting place' };
  }
}

export async function getPlace(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

export async function getPlaces() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false });

  return data;
}