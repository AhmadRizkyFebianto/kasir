import { createClient } from '@/lib/supabase/server';

export async function getUsers() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return data;
}

export async function getUser(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}
