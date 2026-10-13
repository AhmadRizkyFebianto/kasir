'use server';

import { createClient } from '@/lib/supabase/server';

export async function deleteUserWithConfirmation(id: string) {
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
      return { error: 'User tidak ditemukan' };
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
      return { error: 'Gagal menghapus profil pengguna' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: 'Terjadi kesalahan saat menghapus pengguna' };
  }
}