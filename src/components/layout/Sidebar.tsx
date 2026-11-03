'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  PieChart,
  CheckSquare,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/accounts', label: 'Dompet & Akun', icon: WalletCards },
  { href: '/budgets', label: 'Pos Alokasi', icon: PieChart },
  { href: '/bills', label: 'Tagihan Rutin', icon: CheckSquare },
  { href: '/analytics', label: 'Rekap & Grafik', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Household Sync Status Box */}
      <div className="mt-auto p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800/50 dark:to-emerald-950/20 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 text-xs">
        <div className="flex items-center gap-2 mb-1.5 font-bold text-emerald-900 dark:text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Sinkronisasi Suami & Istri</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
          Data tersinkron otomatis antar HP. Setiap catatan menampilkan nama yang menginput.
        </p>
      </div>
    </aside>
  );
}
