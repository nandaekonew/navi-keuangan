'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, getBudgetProgressInfo } from '@/lib/utils';
import { BudgetModal } from '@/components/forms/BudgetModal';
import { CategoryModal } from '@/components/forms/CategoryModal';
import { resolveCategoryIcon } from '@/lib/categoryIcons';
import { Category, CategoryType } from '@/types';
import {
  PieChart,
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  SlidersHorizontal,
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

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  // Calculate spending per expense category for current month
  const monthlyExpenses = transactions.filter((tx) => {
    if (tx.type !== 'expense') return false;
    const txDate = new Date(tx.transaction_date);
    return txDate.getMonth() + 1 === currentMonth && txDate.getFullYear() === currentYear;
  });

  // Calculate earnings per income category for current month
  const monthlyIncomes = transactions.filter((tx) => {
    if (tx.type !== 'income') return false;
    const txDate = new Date(tx.transaction_date);
    return txDate.getMonth() + 1 === currentMonth && txDate.getFullYear() === currentYear;
  });

  const budgetItems = expenseCategories.map((cat) => {
    const budget = budgets.find((b) => b.category_id === cat.id && b.month === currentMonth && b.year === currentYear);
    const spent = monthlyExpenses
      .filter((tx) => tx.category_id === cat.id)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const target = budget ? budget.target_amount : 0;
    const remaining = target - spent;
    const progress = getBudgetProgressInfo(spent, target);

    return {
      cat,
      budget,
      spent,
      target,
      remaining,
      progress,
    };
  });

  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalTarget = budgetItems.reduce((sum, item) => sum + item.target, 0);
  const overallProgress = getBudgetProgressInfo(totalSpent, totalTarget);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

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
            type="button"
            onClick={() => {
              setSelectedCatId(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Atur Limit Anggaran</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Overview Guard Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
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
          type="button"
          onClick={() => setActiveTab('expense')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
            activeTab === 'expense'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Pos Pengeluaran ({expenseCategories.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('income')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Pos Pemasukan ({incomeCategories.length})</span>
        </button>
      </div>

      {/* Cards per Category */}
      {activeTab === 'expense' ? (
        budgetItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>Belum ada pos kategori pengeluaran yang terdaftar.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="text-emerald-600 font-bold hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
            >
              + Tambah Pos Kategori Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetItems.map(({ cat, spent, target, remaining, progress }) => {
              const IconComp = resolveCategoryIcon(cat.icon, cat.name);
              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header: Icon, Category Name, Subtitle, Status Badge, and Actions */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      {/* Left: Category Icon Box & Title */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5"
                          style={{ backgroundColor: cat.color || '#10b981' }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-bold text-sm text-slate-900 dark:text-white leading-snug break-words"
                            title={cat.name}
                          >
                            {cat.name}
                          </h3>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {target > 0 ? 'Batas aktif' : 'Belum ada limit'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Badge & Actions aligned in a clean, unified stack */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            target > 0
                              ? progress.badgeColor
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {target > 0 ? `${progress.percentage}%` : 'Tanpa Limit'}
                        </span>

                        {/* Action Toolbar */}
                        <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCatId(cat.id);
                              setIsModalOpen(true);
                            }}
                            title="Atur Limit Anggaran"
                            aria-label="Atur limit anggaran"
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryToEdit(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            title="Ubah Kategori"
                            aria-label="Ubah kategori"
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus pos kategori "${cat.name}"?`)) {
                                deleteCategory(cat.id);
                              }
                            }}
                            title="Hapus Kategori"
                            aria-label="Hapus kategori"
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 rounded transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${target > 0 ? progress.color : 'bg-slate-200 dark:bg-slate-700'}`}
                        style={{ width: target > 0 ? `${Math.min(progress.percentage, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Metrics Details */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Terpakai:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupiah(spent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Plafon:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {target > 0 ? formatRupiah(target) : 'Tidak dibatasi'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] text-slate-400">Sisa:</span>
                      {target > 0 ? (
                        <span
                          className={`font-black text-xs ${
                            remaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {formatRupiah(remaining)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          Bebas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        incomeCategories.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>Belum ada pos kategori pemasukan yang terdaftar.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="text-emerald-600 font-bold hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
            >
              + Tambah Pos Kategori Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((cat) => {
              const IconComp = resolveCategoryIcon(cat.icon, cat.name);
              const totalEarned = monthlyIncomes
                .filter((tx) => tx.category_id === cat.id)
                .reduce((sum, tx) => sum + tx.amount, 0);

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5"
                          style={{ backgroundColor: cat.color || '#10b981' }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug break-words">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                            Pos Pemasukan
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsCategoryModalOpen(true);
                          }}
                          title="Ubah Kategori"
                          aria-label="Ubah kategori"
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 rounded transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus pos kategori "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          title="Hapus Kategori"
                          aria-label="Hapus kategori"
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 rounded transition focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
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
        )
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
