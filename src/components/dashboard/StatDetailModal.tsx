'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Landmark,
  CreditCard,
  Banknote,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export type StatDetailType = 'balance' | 'income' | 'expense' | 'surplus';

interface StatDetailModalProps {
  type: StatDetailType | null;
  onClose: () => void;
}

export function StatDetailModal({ type, onClose }: StatDetailModalProps) {
  const {
    accounts,
    transactions,
    categories,
    members,
    setQuickInputOpen,
    setTransferOpen,
  } = useNaviStore();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // 1. Akun dan total saldo
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => b.balance - a.balance);
  }, [accounts]);

  // 2. Transaksi bulan berjalan
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.transaction_date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // Transaksi Pemasukan
  const incomeTransactions = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income')
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [currentMonthTransactions]);

  const totalIncome = useMemo(() => {
    return incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [incomeTransactions]);

  // Breakdown Pemasukan per Kategori
  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();
    incomeTransactions.forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.category_id);
      const name = cat?.name || 'Pemasukan Lainnya';
      map.set(name, (map.get(name) || 0) + tx.amount);
    });
    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [incomeTransactions, categories]);

  // Transaksi Pengeluaran
  const expenseTransactions = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [expenseTransactions]);

  // Breakdown Pengeluaran per Kategori
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenseTransactions.forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.category_id);
      const name = cat?.name || 'Pengeluaran Lainnya';
      map.set(name, (map.get(name) || 0) + tx.amount);
    });
    return Array.from(map.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions, categories, totalExpense]);

  // Arus kas bersih (Surplus/Defisit)
  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netCashflow / totalIncome) * 100) : 0;

  if (!type) return null;

  // Render konten sesuai tipe kartu yang diklik
  return (
    <Modal
      isOpen={Boolean(type)}
      onClose={onClose}
      title={
        type === 'balance'
          ? 'Acuan Dasar: Total Kas & Rekening'
          : type === 'income'
          ? 'Acuan Dasar: Pemasukan Bulan Ini'
          : type === 'expense'
          ? 'Acuan Dasar: Pengeluaran Bulan Ini'
          : 'Acuan Dasar: Kalkulasi Surplus Kas'
      }
      subtitle={
        type === 'balance'
          ? 'Rincian saldo riil per rekening bank, e-wallet, dan kas tunai keluarga'
          : type === 'income'
          ? `Sumber dan daftar transaksi pemasukan periode ${monthName}`
          : type === 'expense'
          ? `Seluruh pos belanja, tagihan rutin, dan kebutuhan periode ${monthName}`
          : `Rumus perhitungan dan rasio tabungan keluarga periode ${monthName}`
      }
      maxWidth="2xl"
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {/* ===================== 1. TABEL RINCIAN KAS & REKENING ===================== */}
        {type === 'balance' && (
          <div className="space-y-4">
            {/* Summary Highlight Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Total Akumulasi Saldo Saat Ini
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {formatRupiah(totalBalance)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {accounts.length} Akun Terdaftar
                </span>
              </div>
            </div>

            {/* Structured Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3.5">Rekening / Dompet</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3">No. Rekening</th>
                      <th className="py-2.5 px-3 text-right">Porsi (%)</th>
                      <th className="py-2.5 px-3.5 text-right">Saldo Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedAccounts.map((acc) => {
                      const share =
                        totalBalance > 0
                          ? ((acc.balance / totalBalance) * 100).toFixed(1)
                          : '0';

                      return (
                        <tr
                          key={acc.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: acc.color || '#10b981' }}
                              />
                              <span className="truncate max-w-[160px] sm:max-w-xs">{acc.name}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 capitalize">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {acc.type === 'bank' ? (
                                <Landmark className="w-3 h-3 text-blue-500" />
                              ) : acc.type === 'ewallet' ? (
                                <CreditCard className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Banknote className="w-3 h-3 text-amber-500" />
                              )}
                              <span>{acc.type}</span>
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                            {acc.account_number || '-'}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(Number(share), 100)}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-500">{share}%</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5 text-right font-black text-slate-900 dark:text-white">
                            {formatRupiah(acc.balance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTransferOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer Antar Rekening</span>
              </button>

              <Link
                href="/accounts"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              >
                <span>Buka Menu Dompet & Akun Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ===================== 2. TABEL RINCIAN PEMASUKAN ===================== */}
        {type === 'income' && (
          <div className="space-y-4">
            {/* Summary Highlight Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-emerald-100 block">
                    Total Pemasukan ({monthName})
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    +{formatRupiah(totalIncome)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {incomeTransactions.length} Transaksi Masuk
                </span>
              </div>
            </div>

            {/* Breakdown per Kategori Pemasukan */}
            {incomeByCategory.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-2">
                  Distribusi Kategori Pemasukan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {incomeByCategory.map((item) => (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 pl-2">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="py-2.5 px-3.5">Tanggal</th>
                      <th className="py-2.5 px-3">Kategori / Keterangan</th>
                      <th className="py-2.5 px-3">Masuk ke Rekening</th>
                      <th className="py-2.5 px-3 text-center">Pencatat</th>
                      <th className="py-2.5 px-3.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {incomeTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          Belum ada transaksi pemasukan yang dicatat pada bulan ini.
                        </td>
                      </tr>
                    ) : (
                      incomeTransactions.map((tx) => {
                        const account = accounts.find((a) => a.id === tx.account_id);
                        const category = categories.find((c) => c.id === tx.category_id);
                        const user = members.find((m) => m.id === tx.user_id);
                        const isSuami = user?.persona === 'suami';

                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                          >
                            <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {formatDateIndo(tx.transaction_date)}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {category?.name || 'Pemasukan'}
                              </span>
                              {tx.description && (
                                <span className="text-[11px] text-slate-400 italic truncate block max-w-xs">
                                  {tx.description}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                              <span className="truncate block max-w-[140px]">
                                {account?.name || 'Kas'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isSuami
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                                }`}
                              >
                                {isSuami ? 'Suami' : 'Istri'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              +{formatRupiah(tx.amount)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setQuickInputOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Catat Pemasukan Baru</span>
              </button>

              <Link
                href="/transactions"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              >
                <span>Buka Riwayat Transaksi Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ===================== 3. TABEL RINCIAN PENGELUARAN ===================== */}
        {type === 'expense' && (
          <div className="space-y-4">
            {/* Summary Highlight Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-rose-100 block">
                    Total Pengeluaran ({monthName})
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    -{formatRupiah(totalExpense)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {expenseTransactions.length} Transaksi Pengeluaran
                </span>
              </div>
            </div>

            {/* Top Spending Categories Breakdown */}
            {expenseByCategory.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 block mb-2">
                  Top Pos Pengeluaran Terbesar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {expenseByCategory.slice(0, 6).map((item) => (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-800/60"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {formatRupiah(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="py-2.5 px-3.5">Tanggal</th>
                      <th className="py-2.5 px-3">Pos Pengeluaran</th>
                      <th className="py-2.5 px-3">Sumber Rekening</th>
                      <th className="py-2.5 px-3 text-center">Pencatat</th>
                      <th className="py-2.5 px-3.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenseTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          Belum ada transaksi pengeluaran yang dicatat pada bulan ini.
                        </td>
                      </tr>
                    ) : (
                      expenseTransactions.map((tx) => {
                        const account = accounts.find((a) => a.id === tx.account_id);
                        const category = categories.find((c) => c.id === tx.category_id);
                        const user = members.find((m) => m.id === tx.user_id);
                        const isSuami = user?.persona === 'suami';

                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                          >
                            <td className="py-2.5 px-3.5 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {formatDateIndo(tx.transaction_date)}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {category?.name || 'Pengeluaran'}
                              </span>
                              {tx.description && (
                                <span className="text-[11px] text-slate-400 italic truncate block max-w-xs">
                                  {tx.description}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                              <span className="truncate block max-w-[140px]">
                                {account?.name || 'Kas'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isSuami
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                                }`}
                              >
                                {isSuami ? 'Suami' : 'Istri'}
                              </span>
                            </td>

                            <td className="py-2.5 px-3.5 text-right font-black text-red-600 dark:text-red-400 whitespace-nowrap">
                              -{formatRupiah(tx.amount)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setQuickInputOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>+ Catat Pengeluaran Baru</span>
              </button>

              <Link
                href="/budgets"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm transition"
              >
                <span>Periksa Pos Alokasi & Budget</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ===================== 4. TABEL KALKULASI SURPLUS KAS ===================== */}
        {type === 'surplus' && (
          <div className="space-y-4">
            {/* Visual Math Formula Breakdown */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Formula Perhitungan Arus Kas Bersih (Net Cashflow):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                {/* 1. Total Pemasukan */}
                <div className="p-3 rounded-xl bg-white/10 border border-emerald-400/30">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">
                    (+) Total Pemasukan
                  </span>
                  <div className="text-lg font-black text-white">
                    {formatRupiah(totalIncome)}
                  </div>
                  <span className="text-[10px] text-slate-400">Dari {incomeTransactions.length} transaksi</span>
                </div>

                {/* 2. Total Pengeluaran */}
                <div className="p-3 rounded-xl bg-white/10 border border-rose-400/30">
                  <span className="text-[10px] font-bold text-rose-400 block mb-0.5">
                    (-) Total Pengeluaran
                  </span>
                  <div className="text-lg font-black text-white">
                    {formatRupiah(totalExpense)}
                  </div>
                  <span className="text-[10px] text-slate-400">Dari {expenseTransactions.length} transaksi</span>
                </div>

                {/* 3. Hasil Surplus Bersih */}
                <div
                  className={`p-3 rounded-xl border ${
                    netCashflow >= 0
                      ? 'bg-purple-950/70 border-purple-400/50 text-purple-200'
                      : 'bg-amber-950/70 border-amber-400/50 text-amber-200'
                  }`}
                >
                  <span className="text-[10px] font-bold block mb-0.5">
                    (=) {netCashflow >= 0 ? 'Surplus Bersih' : 'Defisit Kas'}
                  </span>
                  <div className="text-lg font-black text-white">
                    {formatRupiah(netCashflow)}
                  </div>
                  <span className="text-[10px]">
                    {netCashflow >= 0 ? 'Kas keluarga surplus' : 'Perlu evaluasi anggaran'}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Health Ratio Card */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Indikator Kesehatan Arus Kas Keluarga
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Savings Rate: {savingsRate.toFixed(1)}%
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {netCashflow >= 0
                  ? `Keluarga berhasil menyisihkan ${savingsRate.toFixed(1)}% dari total pendapatan bulan ini. Angka ini mencerminkan pengelolaan keuangan yang sehat dan stabil. Dana surplus sebesar ${formatRupiah(netCashflow)} siap dialokasikan ke pos tabungan dana darurat atau investasi.`
                  : `Pengeluaran bulan ini melebihi pendapatan sebesar ${formatRupiah(Math.abs(netCashflow))}. Disarankan untuk meninjau kembali pos pengeluaran fleksibel di menu Pos Alokasi agar arus kas kembali seimbang.`}
              </p>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/budgets"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <span>Tinjau Pos Alokasi Anggaran</span>
              </Link>

              <Link
                href="/analytics"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition"
              >
                <span>Buka Rekap & Grafik Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
