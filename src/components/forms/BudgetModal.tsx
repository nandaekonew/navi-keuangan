'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { parseRupiahInput } from '@/lib/utils';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  onOpenCategoryModal?: () => void;
}

export function BudgetModal({
  isOpen,
  onClose,
  initialCategoryId,
  onOpenCategoryModal,
}: BudgetModalProps) {
  const { categories, budgets, setBudget } = useNaviStore();

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [selectedCatId, setSelectedCatId] = useState<string>(
    initialCategoryId || expenseCategories[0]?.id || ''
  );
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [targetStr, setTargetStr] = useState<string>('');

  React.useEffect(() => {
    if (initialCategoryId) {
      setSelectedCatId(initialCategoryId);
      const existing = budgets.find((b) => b.category_id === initialCategoryId);
      if (existing) {
        setTargetAmount(existing.target_amount);
        setTargetStr(existing.target_amount.toLocaleString('id-ID'));
      }
    } else if (expenseCategories.length > 0) {
      setSelectedCatId(expenseCategories[0].id);
      const existing = budgets.find((b) => b.category_id === expenseCategories[0].id);
      if (existing) {
        setTargetAmount(existing.target_amount);
        setTargetStr(existing.target_amount.toLocaleString('id-ID'));
      } else {
        setTargetAmount(0);
        setTargetStr('');
      }
    }
  }, [initialCategoryId, isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setTargetAmount(val);
    setTargetStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setSelectedCatId(catId);
    const existing = budgets.find((b) => b.category_id === catId);
    if (existing) {
      setTargetAmount(existing.target_amount);
      setTargetStr(existing.target_amount.toLocaleString('id-ID'));
    } else {
      setTargetAmount(0);
      setTargetStr('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || targetAmount < 0) return;

    setBudget(selectedCatId, targetAmount);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Limit Pos Anggaran Bulanan"
      subtitle="Tetapkan batas pengeluaran untuk menjaga stabilitas keuangan rumah tangga"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kategori Pengeluaran
            </label>
            {onOpenCategoryModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCategoryModal();
                }}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Tambah Kategori Baru
              </button>
            )}
          </div>
          <select
            value={selectedCatId}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Limit Anggaran Bulanan (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={targetStr}
              onChange={handleAmountChange}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Indikator: Hijau (Aman &lt; 80%), Kuning (Waspada 80-100%), Merah (Overbudget).
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            Simpan Anggaran
          </button>
        </div>
      </form>
    </Modal>
  );
}
