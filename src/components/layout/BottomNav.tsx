'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  CheckSquare,
  Plus,
} from 'lucide-react';
import { useNaviStore } from '@/lib/store/useNaviStore';

export function BottomNav() {
  const pathname = usePathname();
  const { setQuickInputOpen } = useNaviStore();

  const navItems = [
    { href: '/', label: 'Beranda', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transaksi', icon: Receipt },
    { isAction: true },
    { href: '/budgets', label: 'Anggaran', icon: PieChart },
    { href: '/bills', label: 'Tagihan', icon: CheckSquare },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pb-safe pt-1">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <div key="fab-btn" className="relative -top-5 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setQuickInputOpen(true)}
                  aria-label="Catat Transaksi Cepat"
                  className="w-14 h-14 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white p-3.5 shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all flex items-center justify-center border-4 border-white dark:border-slate-900"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Catat
                </span>
              </div>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
