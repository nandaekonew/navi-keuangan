'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { Category, CategoryType } from '@/types';
import { parseRupiahInput } from '@/lib/utils';
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_ICON_MAP,
} from '@/lib/categoryIcons';
import { Tag } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultType?: CategoryType;
}

export function CategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
  defaultType = 'expense',
}: CategoryModalProps) {
  const { household, addCategory, updateCategory, budgets, setBudget } = useNaviStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(defaultType);
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10b981');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [targetStr, setTargetStr] = useState<string>('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setIcon(categoryToEdit.icon || 'Tag');
      setColor(categoryToEdit.color || '#10b981');

      const existingBudget = budgets.find((b) => b.category_id === categoryToEdit.id);
      if (existingBudget && existingBudget.target_amount > 0) {
        setTargetAmount(existingBudget.target_amount);
        setTargetStr(existingBudget.target_amount.toLocaleString('id-ID'));
      } else {
        setTargetAmount(0);
        setTargetStr('');
      }
    } else {
      setName('');
      setType(defaultType);
      setIcon(defaultType === 'income' ? 'Briefcase' : 'ShoppingBag');
      setColor('#10b981');
      setTargetAmount(0);
      setTargetStr('');
    }
  }, [categoryToEdit, defaultType, isOpen, budgets]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setTargetAmount(val);
    setTargetStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: name.trim(),
        type,
        icon,
        color,
        is_budgeted: type === 'expense' && targetAmount > 0,
      });

      if (type === 'expense' && targetAmount > 0) {
        setBudget(categoryToEdit.id, targetAmount);
      }
    } else {
      addCategory(
        {
          household_id: household.id,
          name: name.trim(),
          type,
          icon,
          color,
          is_budgeted: type === 'expense' && targetAmount > 0,
        },
        type === 'expense' ? targetAmount : undefined
      );
    }

    onClose();
  };

  const SelectedIconComp = CATEGORY_ICON_MAP[icon] || Tag;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Ubah Pos Kategori' : 'Tambah Pos Kategori Baru'}
      subtitle={
        categoryToEdit
          ? 'Perbarui nama, jenis pos, ikon visual, warna, atau limit anggaran'
          : 'Tambahkan pos alokasi baru untuk anggaran belanja rumah tangga atau sumber penghasilan'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 transition"
            style={{ backgroundColor: color }}
          >
            <SelectedIconComp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block">Preview Tampilan Pos</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {name.trim() || 'Nama Pos Kategori'}
            </div>
          </div>
          <span
            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              type === 'expense'
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </span>
        </div>

        {/* Nama Kategori */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nama Pos Kategori <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Tabungan Liburan, Hewan Peliharaan, Skincare, Servis Mobil"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Tipe Kategori */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Jenis Pos
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                type === 'expense'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Pos Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                type === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Pos Pemasukan
            </button>
          </div>
        </div>

        {/* Limit Anggaran (Hanya jika pengeluaran) */}
        {type === 'expense' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Plafon / Batas Anggaran Bulanan (Opsional)
              </label>
              <span className="text-[10px] text-slate-400">Bisa diubah sewaktu-waktu</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0 (Tanpa batas)"
                value={targetStr}
                onChange={handleAmountChange}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Pilih Ikon Visual */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Pilih Ikon Visual
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            {CATEGORY_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  title={item.label}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[9px] truncate w-full text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pilih Warna Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Pilihan Warna Label
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition ${
                  color === c
                    ? 'border-slate-900 dark:border-white scale-110 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            {categoryToEdit ? 'Simpan Perubahan Kategori' : 'Tambahkan Kategori Baru'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
