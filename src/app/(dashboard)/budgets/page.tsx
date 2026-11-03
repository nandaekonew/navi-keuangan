'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, getBudgetProgressInfo } from '@/lib/utils';
import { BudgetModal } from '@/components/forms/BudgetModal';
import { CategoryModal } from '@/components/forms/CategoryModal';
import { CATEGORY_ICON_MAP } from '@/lib/categoryIcons';
import { Category, CategoryType } from '@/types';
import {
  PieChart,
  Plus,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export default function BudgetsPage() {
  const { categories, budgets, transactions, deleteCategory } = useNaviStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');

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

  // Hitung pemasukan bulan ini
  const currentMonthIncomes = transactions.filter((t) => {
    if (t.type !== 'income') return false;
    const d = new Date(t.transaction_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

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

  const incomeItems = incomeCategories.map((cat) => {
    const totalEarned = currentMonthIncomes
      .filter((t) => t.category_id === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      cat,
      totalEarned,
    };
  });

  const totalTarget = budgetItems.reduce((sum, i) => sum + i.target, 0);
  const totalSpent = budgetItems.reduce((sum, i) => sum + i.spent, 0);
  const overallProgress = getBudgetProgressInfo(totalSpent, totalTarget);
  const totalIncomeMonth = incomeItems.reduce((sum, i) => sum + i.totalEarned, 0);

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

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setSelectedCatId(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Atur Limit Anggaran</span>
          </button>

          <button
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kategori</span>
          </button>
        </div>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'expense'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Pos Pengeluaran ({expenseCategories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Pos Pemasukan ({incomeCategories.length})</span>
        </button>
      </div>

      {/* Cards per Category */}
      {activeTab === 'expense' ? (
        budgetItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>Belum ada pos kategori pengeluaran yang terdaftar.</p>
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="text-emerald-600 font-bold hover:underline"
            >
              + Tambah Pos Kategori Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetItems.map(({ cat, spent, target, remaining, progress }) => {
              const IconComp = CATEGORY_ICON_MAP[cat.icon || 'Tag'] || Tag;
              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                          style={{ backgroundColor: cat.color || '#10b981' }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {target > 0 ? 'Batas aktif' : 'Belum ada limit'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${progress.badgeColor} mr-0.5`}
                        >
                          {progress.percentage}%
                        </span>
                        <button
                          onClick={() => {
                            setSelectedCatId(cat.id);
                            setIsModalOpen(true);
                          }}
                          title="Atur Limit Anggaran"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          title="Ubah Kategori"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus pos kategori "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          title="Hapus Kategori"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progress.color}`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
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
              );
            })}
          </div>
        )
      ) : incomeItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
          <p>Belum ada pos kategori pemasukan yang terdaftar.</p>
          <button
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="text-emerald-600 font-bold hover:underline"
          >
            + Tambah Pos Pemasukan Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeItems.map(({ cat, totalEarned }) => {
            const IconComp = CATEGORY_ICON_MAP[cat.icon || 'Tag'] || Tag;
            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                        style={{ backgroundColor: cat.color || '#10b981' }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Pos Pemasukan
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCategoryToEdit(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        title="Ubah Kategori"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus pos kategori "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        title="Hapus Kategori"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Total Diterima Bulan Ini:</span>
                    <span className="font-black text-emerald-600 text-sm">
                      {formatRupiah(totalEarned)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategoryId={selectedCatId}
        onOpenCategoryModal={() => {
          setCategoryToEdit(null);
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        defaultType={activeTab}
      />
    </div>
  );
}
