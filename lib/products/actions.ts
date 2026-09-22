'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    const name = String(formData.get('name') || '');
    const category_id = String(formData.get('category_id') || '');
    const price = Number(formData.get('price') || 0);
    const stock = Number(formData.get('stock') || 0);
    const is_active = formData.get('is_active') === 'on';

    if (!name || !category_id || price <= 0) {
      return { error: 'Nama, kategori, dan harga wajib diisi' };
    }

    const { error } = await supabase
      .from('products')
      .insert({ name, category_id, price, stock, is_active });

    if (error) {
      console.error('Create product error:', error);
      return { error: 'Failed to create product' };
    }

    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Create product error:', error);
    return { error: 'An error occurred while creating product' };
  }
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '');
    const category_id = String(formData.get('category_id') || '');
    const price = Number(formData.get('price') || 0);
    const stock = Number(formData.get('stock') || 0);
    const is_active = formData.get('is_active') === 'on';

    if (!id) return { error: 'Product ID is required' };

    const { error } = await supabase
      .from('products')
      .update({ name, category_id, price, stock, is_active })
      .eq('id', id);

    if (error) {
      console.error('Update product error:', error);
      return { error: 'Failed to update product' };
    }

    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Update product error:', error);
    return { error: 'An error occurred while updating product' };
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      return { error: 'Failed to delete product' };
    }

    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Delete product error:', error);
    return { error: 'An error occurred while deleting product' };
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