'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type ProductFormData = {
  name: string;
  category_id: string;
  price: number;
  stock?: number;
  description?: string;
  is_active?: boolean;
};

type CreateUpdateResult = { error?: string } | undefined;

export async function createProduct(formData: FormData): Promise<void | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized create attempt');
    return;
  }

  try {
    const name = String(formData.get('name') || '');
    const category_id = String(formData.get('category_id') || '');
    const price = Number(formData.get('price') || 0);
    const stock = Number(formData.get('stock') || 0);
    const description = String(formData.get('description') || '');
    const is_active = formData.get('is_active') === 'on';

    if (!name || !category_id || price <= 0) {
      console.error('Validation error: name, category, and price are required');
      return;
    }

    const { error } = await supabase
      .from('products')
      .insert({ name, category_id, price, stock, description, is_active });

    if (error) {
      console.error('Create product error:', error);
      return;
    }

    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Create product error:', error);
  }
}

export async function updateProduct(formData: FormData): Promise<void | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized update attempt');
    return;
  }

  try {
    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '');
    const category_id = String(formData.get('category_id') || '');
    const price = Number(formData.get('price') || 0);
    const stock = Number(formData.get('stock') || 0);
    const description = String(formData.get('description') || '');
    const is_active = formData.get('is_active') === 'on';

    if (!id) {
      console.error('Validation error: product ID is required');
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ name, category_id, price, stock, description, is_active })
      .eq('id', id);

    if (error) {
      console.error('Update product error:', error);
      return;
    }

    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Update product error:', error);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized delete attempt');
    return;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
    }

    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Delete product error:', error);
  }
}

export async function getProduct(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

export async function getProducts() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return data;
}

export async function getProductCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true });

  return data;
}