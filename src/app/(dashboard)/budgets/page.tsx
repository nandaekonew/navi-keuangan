'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, getBudgetProgressInfo } from '@/lib/utils';
import { BudgetModal } from '@/components/forms/BudgetModal';
import {
  PieChart,
  Plus,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

export default function BudgetsPage() {
  const { categories, budgets, transactions } = useNaviStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Hitung pengeluaran bulan ini
  const currentMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.transaction_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const budgetItems = expenseCategories.map((cat) => {
    const budget = budgets.find(
      (b) => b.category_id === cat.id && b.month === currentMonth && b.year === currentYear
    );
    const spent = currentMonthExpenses
      .filter((t) => t.category_id === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const target = budget ? budget.target_amount : 0;
    const progress = getBudgetProgressInfo(spent, target);
    const remaining = target - spent;

    return {
      cat,
      budget,
      spent,
      target,
      remaining,
      progress,
    };
  });

  const totalTarget = budgetItems.reduce((sum, i) => sum + i.target, 0);
  const totalSpent = budgetItems.reduce((sum, i) => sum + i.spent, 0);
  const overallProgress = getBudgetProgressInfo(totalSpent, totalTarget);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pos Alokasi & Budget Guard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bulan {monthNames[currentMonth - 1]} {currentYear} • Jaga pengeluaran tetap terkontrol
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCatId(undefined);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Atur Pos Alokasi</span>
        </button>
      </div>

      {/* Overview Guard Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Total Budget Guard Rumah Tangga
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dari batas anggaran gabungan seluruh pos alokasi keluarga
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${overallProgress.badgeColor}`}
            >
              {overallProgress.percentage}% Terpakai • {overallProgress.label}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${overallProgress.color}`}
            style={{ width: `${Math.min(overallProgress.percentage, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Terpakai:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {formatRupiah(totalSpent)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Plafon Anggaran:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {formatRupiah(totalTarget)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Sisa Anggaran:</span>
            <span
              className={`font-bold text-sm ${
                totalTarget - totalSpent >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatRupiah(totalTarget - totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Cards per Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetItems.map(({ cat, spent, target, remaining, progress }) => (
          <div
            key={cat.id}
            onClick={() => {
              setSelectedCatId(cat.id);
              setIsModalOpen(true);
            }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {target > 0 ? 'Batas aktif' : 'Belum ada limit'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${progress.badgeColor}`}
              >
                {progress.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progress.color}`}
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              />
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-slate-500">
                <span>Realisasi:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatRupiah(spent)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Target Limit:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {formatRupiah(target)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400">Sisa Plafon:</span>
                <span
                  className={`font-black text-xs ${
                    remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {remaining >= 0 ? formatRupiah(remaining) : `Over ${formatRupiah(Math.abs(remaining))}`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategoryId={selectedCatId}
      />
    </div>
  );
}
