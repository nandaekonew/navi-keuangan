'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, getBudgetProgressInfo } from '@/lib/utils';
import { BudgetModal } from '@/components/forms/BudgetModal';
import { PieChart, AlertTriangle, ArrowRight, Plus } from 'lucide-react';

export function BudgetProgressList() {
  const { categories, budgets, transactions } = useNaviStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Hitung total pengeluaran per kategori bulan ini
  const currentMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.transaction_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  const budgetedCategories = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const budget = budgets.find(
        (b) => b.category_id === cat.id && b.month === currentMonth && b.year === currentYear
      );
      const spent = currentMonthExpenses
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const target = budget ? budget.target_amount : 0;
      const progress = getBudgetProgressInfo(spent, target);

      return {
        cat,
        budget,
        spent,
        target,
        progress,
      };
    })
    .filter((item) => item.target > 0 || item.spent > 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Pos Alokasi & Budget Guard
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pantau batas limit pengeluaran bulanan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCatId(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Atur Limit</span>
          </button>
        </div>
      </div>

      {budgetedCategories.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          Belum ada pos alokasi yang diatur. Klik Atur Limit untuk mulai budgeting.
        </div>
      ) : (
        <div className="space-y-3.5">
          {budgetedCategories.slice(0, 4).map(({ cat, spent, target, progress }) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setIsModalOpen(true);
              }}
              className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer border border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {cat.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${progress.badgeColor}`}
                >
                  {progress.percentage}% • {progress.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progress.color}`}
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Terpakai: {formatRupiah(spent)}</span>
                <span>Limit: {formatRupiah(target)}</span>
              </div>
            </div>
          ))}

          <div className="pt-2 flex justify-end">
            <Link
              href="/budgets"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <span>Lihat Seluruh Pos Alokasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategoryId={selectedCatId}
      />
    </div>
  );
}
