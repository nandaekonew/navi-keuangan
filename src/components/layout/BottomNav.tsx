'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useNaviStore } from '@/lib/store/useNaviStore';

export function BottomNav() {
  const pathname = usePathname();
  const { setQuickInputOpen, setMobileDrawerOpen, isMobileDrawerOpen } = useNaviStore();

  const isOtherActive =
    pathname === '/accounts' ||
    pathname === '/installments' ||
    pathname === '/analytics' ||
    pathname === '/settings' ||
    pathname === '/bills';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pb-safe pt-1">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
        {/* 1. Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
            pathname === '/'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </Link>

        {/* 2. Transaksi */}
        <Link
          href="/transactions"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
            pathname === '/transactions'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Transaksi</span>
        </Link>

        {/* 3. Catat Cepat Floating Action Button */}
        <div className="relative -top-5 flex flex-col items-center">
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

        {/* 4. Pos Alokasi / Anggaran */}
        <Link
          href="/budgets"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
            pathname === '/budgets'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Anggaran</span>
        </Link>

        {/* 5. Menu Lengkap (Mirrors Desktop Sidebar in Image 3) */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Buka Semua Menu Aplikasi"
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
            isMobileDrawerOpen || isOtherActive
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </nav>
  );
}
