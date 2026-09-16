import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, category_id, name, description, price, stock, image_url, is_active, product_categories (id, name)')
    .eq('is_active', true)
    .order('name', { ascending: true });
  return data || [];
}

export async function getProductCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_categories')
    .select('id, name')
    .order('name', { ascending: true });
  return data || [];
}

export async function getProductsByCategory(categoryId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, category_id, name, description, price, stock, image_url, is_active, product_categories (id, name)')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('name', { ascending: true });
  return data || [];
}

export async function searchProducts(query: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('id, category_id, name, description, price, stock, image_url, is_active, product_categories (id, name)')
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(20);
  return data || [];
}
