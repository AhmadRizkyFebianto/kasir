import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProductsStock() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select('*, product_categories(name)')
    .order('name', { ascending: true });

  return data;
}

export async function updateStock(formData: FormData): Promise<void | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('Unauthorized stock update attempt');
    return;
  }

  try {
    const productId = String(formData.get('product_id') || '');
    const stockChange = Number(formData.get('stock_change') || 0);
    const type = String(formData.get('type') || 'adjustment');
    const description = String(formData.get('description') || '');

    if (!productId) {
      console.error('Validation error: product ID is required');
      return;
    }

    if (type === 'output' && stockChange > 0) {
      console.error('Validation error: output must be negative');
      return;
    }

    // Get current stock
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (!product) {
      console.error('Product not found');
      return;
    }

    const newStock = product.stock + stockChange;
    
    if (newStock < 0) {
      console.error('Validation error: insufficient stock');
      return;
    }

    // Update product stock
    const { error: productError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (productError) {
      console.error('Update stock error:', productError);
      return;
    }

    // Insert stock transaction record
    const { error: transactionError } = await supabase
      .from('stock_transactions')
      .insert({
        product_id: productId,
        stock_before: product.stock,
        stock_after: newStock,
        stock_change: stockChange,
        type,
        description,
        created_by: user.id
      });

    if (transactionError) {
      console.error('Insert stock transaction error:', transactionError);
      return;
    }

    revalidatePath('/dashboard/stock');
    revalidatePath('/dashboard/stock/history');
  } catch (error) {
    console.error('Update stock error:', error);
  }
}

export async function getStockTransactions() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stock_transactions')
    .select(`
      *,
      products(name, category_id),
      product_categories(name as category_name)
    `)
    .order('created_at', { ascending: false });

  return data;
}

export async function getStockHistoryByProduct(productId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('stock_transactions')
    .select(`
      *,
      products(name)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  return data;
}