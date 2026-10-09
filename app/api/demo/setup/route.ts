import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const demoAccounts = [
    {
      email: 'admin@kasir.com',
      password: 'password123',
      full_name: 'Admin Kasir',
      role: 'admin',
    },
    {
      email: 'kasir@kasir.com',
      password: 'password123',
      full_name: 'Kasir User',
      role: 'kasir',
    },
  ];

  const errors = [];

  for (const account of demoAccounts) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            full_name: account.full_name,
          },
        },
      });

      if (authError) {
        errors.push(`${account.email}: ${authError.message}`);
        continue;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: account.role, full_name: account.full_name })
          .eq('id', authData.user.id);

        if (profileError) {
          errors.push(`Failed to set profile for ${account.email}: ${profileError.message}`);
        }
      }
    } catch (err) {
      errors.push(`Unexpected error for ${account.email}: ${String(err)}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors.join('\n') },
      { status: 400 }
    );
  }

  redirect('/login?accounts=created');
}