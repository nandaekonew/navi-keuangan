'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from 'lucide-react';
import { StatDetailModal, StatDetailType } from '@/components/dashboard/StatDetailModal';

export function StatCards() {
  const { accounts, transactions } = useNaviStore();
  const [activeDetail, setActiveDetail] = useState<StatDetailType | null>(null);

  // Total balance across all accounts
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Current month calculation
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((t) => {
    const txDate = new Date(t.transaction_date);
    return (
      txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    );
  });

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  const handleKeyDown = (e: React.KeyboardEvent, type: StatDetailType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDetail(type);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Saldo Rekening & Kas */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveDetail('balance')}
          onKeyDown={(e) => handleKeyDown(e, 'balance')}
          className="group text-left bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300">
              Total Kas & Rekening
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-white">
            {formatRupiah(totalBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mb-3">
            Dari {accounts.length} akun bank, e-wallet & tabungan
          </div>
          <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300 group-hover:text-emerald-300 font-medium transition-colors">
            <span>Rincian 10 akun & saldo</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-emerald-400" />
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveDetail('income')}
          onKeyDown={(e) => handleKeyDown(e, 'income')}
          className="group text-left bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pemasukan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-1">
            {formatRupiah(totalIncome)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mb-3">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Gaji Suami & Penghasilan Istri</span>
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
            <span>Tabel acuan pemasukan ({currentMonthTransactions.filter(t => t.type === 'income').length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveDetail('expense')}
          onKeyDown={(e) => handleKeyDown(e, 'expense')}
          className="group text-left bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-red-200 dark:hover:border-red-800/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pengeluaran Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 tracking-tight mb-1">
            {formatRupiah(totalExpense)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-red-700 dark:text-red-300 font-medium mb-3">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Belanja, Tagihan & Kebutuhan</span>
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 font-medium transition-colors">
            <span>Tabel acuan pengeluaran ({currentMonthTransactions.filter(t => t.type === 'expense').length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Sisa Arus Kas / Surplus */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveDetail('surplus')}
          onKeyDown={(e) => handleKeyDown(e, 'surplus')}
          className="group text-left bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-800/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Surplus Kas Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight mb-1 ${
              netCashflow >= 0
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatRupiah(netCashflow)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 truncate">
            {netCashflow >= 0
              ? 'Dana siap dialokasikan ke tabungan/investasi'
              : 'Perhatikan batas anggaran pengeluaran!'}
          </div>
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-medium transition-colors">
            <span>Formula kalkulasi & evaluasi</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Modal Rincian & Acuan Dasar Tabel */}
      <StatDetailModal
        type={activeDetail}
        onClose={() => setActiveDetail(null)}
      />
    </>
  );
}
