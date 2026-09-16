'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Calendar,
  MapPin,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  role: 'admin' | 'kasir';
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'kasir'],
  },
  {
    name: 'POS',
    href: '/dashboard/pos',
    icon: ShoppingCart,
    roles: ['admin', 'kasir'],
  },
  {
    name: 'Reservasi',
    href: '/dashboard/reservations',
    icon: Calendar,
    roles: ['admin', 'kasir'],
  },
  {
    name: 'Tempat',
    href: '/dashboard/places',
    icon: MapPin,
    roles: ['admin'],
  },
  {
    name: 'Produk',
    href: '/dashboard/products',
    icon: Package,
    roles: ['admin'],
  },
  {
    name: 'Pengguna',
    href: '/dashboard/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    name: 'Laporan',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    name: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <div className="flex w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShoppingCart className="h-8 w-8 text-primary-500" />
          <span className="text-xl font-bold text-white">Kasir Pro</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={() => {
            // Logout will be handled
            window.location.href = '/api/auth/signout';
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </div>
  );
}