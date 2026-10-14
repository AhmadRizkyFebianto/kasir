'use server;'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteProductAction(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized delete attempt');
    redirect('/login');
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      redirect('/dashboard/products?error=delete_failed');
    }

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products?success=deleted');
  } catch (error) {
    console.error('Delete product error:', error);
    redirect('/dashboard/products?error=delete_failed');
  }
}


