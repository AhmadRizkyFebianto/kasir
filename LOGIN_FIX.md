# Login "Fetch Failed" Fix

## Root Cause

The "fetch failed" error occurred because:

1. **Demo accounts don't exist** - The login page mentioned demo accounts (admin@kasir.com, kasir@kasir.com) but these users were never created in Supabase.

2. **Middleware cookie handling issue** - The middleware was using `request.cookies.set()` which doesn't exist in Next.js 14. This caused session refresh failures.

## Changes Made

### 1. Updated Login Page (`app/(auth)/login/page.tsx`)

Changed the demo account info to show a clearer warning that accounts must be created manually:

```tsx
<div className="rounded-md bg-amber-50 p-4">
  <div className="flex">
    <div className="ml-3">
      <h3 className="text-sm font-medium text-amber-800">
        Demo Account Belum Dibuat
      </h3>
      <div className="mt-2 text-sm text-amber-700">
        <p>Account demo (admin/kasir) belum tersedia di database.</p>
        <p className="mt-1">
          Daftar akun baru di bawah atau buat akun demo manual via Supabase Dashboard.
        </p>
      </div>
    </div>
  </div>
</div>
```

### 2. Fixed Middleware Cookie Handling (`middleware.ts`)

Changed from:
```ts
cookiesToSet.forEach(({ name, value, options }) =>
  request.cookies.set(name, value)  // ❌ Doesn't exist
);
```

To:
```ts
try {
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)  // ✅ Correct
  );
} catch {
  // The `setAll` method was called from a Server Component.
}
```

### 3. Created Demo Setup API Route (`app/api/demo/setup/route.ts`)

Created an API endpoint that can be used to create demo accounts:
- admin@kasir.com / password123
- kasir@kasir.com / password123

## How to Create Demo Accounts

### Option 1: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add user** > **Create new user**
4. Fill in:
   - Email: `admin@kasir.com`
   - Password: `password123`
   - Auto Confirm User: Yes
5. After creating, go to **Authentication** > **User Config**
6. Edit the user and add metadata:
   - `full_name`: "Admin Kasir"
   - `role`: "admin"
7. Create the kasir user similarly with email `kasir@kasir.com` and role "kasir"

### Option 2: Via API (for development)

1. Start the dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/demo/setup`
3. This will create both demo accounts

### Option 3: Register New Account

1. Go to `/register`
2. Fill in your email and password
3. After registration, manually update the role in Supabase dashboard:
   - Go to the `profiles` table
   - Find your user ID
   - Update the `role` field to "admin" or "kasir"

## How to Test the Fix

1. Try logging in with a non-existent account:
   - Email: `test@example.com`
   - Password: `wrongpassword`
   - Expected: Clear error message shown

2. Try logging in with a valid account:
   - Email: `admin@kasir.com`
   - Password: `password123`
   - Expected: Redirect to `/dashboard`

## Notes

- The middleware now properly handles cookies and won't cause fetch errors
- Error messages are displayed on the login page instead of generic "fetch failed"
- Demo accounts must be created manually for security reasons
