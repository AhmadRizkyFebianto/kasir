'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type CategoryFormData = {
  name: string;
  description?: string;
};

export async function createCategory(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized create attempt');
    redirect('/login');
  }

  try {
    const name = String(formData.get('name') || '');
    const description = String(formData.get('description') || '');

    if (!name) {
      console.error('Validation error: name is required');
      redirect('/dashboard/categories/new?error=validation_failed');
    }

    const { error } = await supabase
      .from('product_categories')
      .insert({ name, description });

    if (error) {
      console.error('Create category error:', error);
      redirect('/dashboard/categories/new?error=creation_failed');
    }

    revalidatePath('/dashboard/categories');
    redirect('/dashboard/categories?success=created');
  } catch (error) {
    console.error('Create category error:', error);
    redirect('/dashboard/categories/new?error=creation_failed');
  }
}

export async function updateCategory(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized update attempt');
    redirect('/login');
  }

  try {
    const id = String(formData.get('id') || '');
    const name = String(formData.get('name') || '');
    const description = String(formData.get('description') || '');

    if (!id) {
      console.error('Validation error: category ID is required');
      redirect('/dashboard/categories?error=validation_failed');
    }

    const { error } = await supabase
      .from('product_categories')
      .update({ name, description })
      .eq('id', id);

    if (error) {
      console.error('Update category error:', error);
      redirect('/dashboard/categories?error=update_failed');
    }

    revalidatePath('/dashboard/categories');
    redirect('/dashboard/categories?success=updated');
  } catch (error) {
    console.error('Update category error:', error);
    redirect('/dashboard/categories?error=update_failed');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized delete attempt');
    redirect('/login');
  }

  try {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete category error:', error);
      redirect('/dashboard/categories?error=delete_failed');
    }

    revalidatePath('/dashboard/categories');
    redirect('/dashboard/categories?success=deleted');
  } catch (error) {
    console.error('Delete category error:', error);
    redirect('/dashboard/categories?error=delete_failed');
  }
}

export async function getCategory(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('product_categories')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

export async function getCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true });

  return data;
}


