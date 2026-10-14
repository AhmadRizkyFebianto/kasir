'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type UserRole = 'admin' | 'kasir';

export async function createUser(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/dashboard/users');
  }

  try {
    const email = String(formData.get('email') || '');
    const full_name = String(formData.get('full_name') || '');
    const role = String(formData.get('role') || 'kasir') as UserRole;
    const password = String(formData.get('password') || '');

    if (!email || !full_name || !password) {
      redirect('/dashboard/users');
    }

    // Create user in auth
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      redirect('/dashboard/users');
    }

    // Insert profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ email, full_name, role });

    if (profileError) {
      console.error('Profile error:', profileError);
      redirect('/dashboard/users');
    }

    revalidatePath('/dashboard/users');
    redirect('/dashboard/users');
  } catch (error) {
    console.error('Create user error:', error);
    redirect('/dashboard/users');
  }
}

export async function updateUser(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/dashboard/users');
  }

  try {
    const id = String(formData.get('id') || '');
    const full_name = String(formData.get('full_name') || '');
    const role = String(formData.get('role') || 'kasir') as UserRole;

    if (!id) {
      redirect('/dashboard/users');
    }

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name, role },
    });

    if (authError) {
      console.error('Auth update error:', authError);
      redirect('/dashboard/users');
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name, role })
      .eq('id', id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      redirect('/dashboard/users');
    }

    revalidatePath('/dashboard/users');
    redirect('/dashboard/users');
  } catch (error) {
    console.error('Update user error:', error);
    redirect('/dashboard/users');
  }
}

export async function deleteUser(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  try {
    // Get user email first to delete from auth
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (!profile) {
      return { error: 'User not found' };
    }

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(profile.email);

    if (authError) {
      console.error('Auth delete error:', authError);
      // Continue with database delete even if auth delete fails
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Profile delete error:', profileError);
      return { error: 'Failed to delete profile' };
    }

    revalidatePath('/dashboard/users');
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: 'An error occurred while deleting user' };
  }
}

export async function deleteUserAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  
  if (!id) {
    redirect('/dashboard/users');
  }

  const result = await deleteUser(id);
  
  if (result?.error) {
    console.error('Delete error:', result.error);
    redirect('/dashboard/users');
  }
  
  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
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

export async function getUsers() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return data;
}