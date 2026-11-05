'use client';

import React from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function StatCards() {
  const { accounts, transactions } = useNaviStore();

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Saldo Rekening & Kas */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300">
            Total Kas & Rekening
          </span>
          <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black tracking-tight mb-1">
          {formatRupiah(totalBalance)}
        </div>
        <div className="text-[11px] text-slate-400">
          Dari {accounts.length} akun bank, e-wallet & tabungan
        </div>
      </div>

      {/* Pemasukan Bulan Ini */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pemasukan Bulan Ini
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-1">
          {formatRupiah(totalIncome)}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Gaji Suami & Penghasilan Istri</span>
        </div>
      </div>

      {/* Pengeluaran Bulan Ini */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pengeluaran Bulan Ini
          </span>
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 tracking-tight mb-1">
          {formatRupiah(totalExpense)}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-red-700 dark:text-red-300 font-medium">
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>Belanja, Tagihan & Kebutuhan</span>
        </div>
      </div>

      {/* Sisa Arus Kas / Surplus */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Surplus Kas Bulan Ini
          </span>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
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
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {netCashflow >= 0
            ? 'Dana siap dialokasikan ke tabungan/investasi'
            : 'Perhatikan batas anggaran pengeluaran!'}
        </div>
      </div>
    </div>
  );
}
