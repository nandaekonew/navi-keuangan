'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, parseRupiahInput } from '@/lib/utils';
import { resolveCategoryIcon } from '@/lib/categoryIcons';
import { TransactionType } from '@/types';
import { ReceiptScannerSection } from '@/components/forms/ReceiptScannerSection';
import { CandidateAmount } from '@/lib/receiptScanner';
import {
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export function QuickTransactionModal() {
  const {
    isQuickInputOpen,
    setQuickInputOpen,
    accounts,
    categories,
    currentUser,
    addTransaction,
  } = useNaviStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [nominal, setNominal] = useState<number>(0);
  const [inputStr, setInputStr] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Filter categories by type (income / expense)
  const availableCategories = categories.filter((c) => c.type === type);

  // Set default category when type changes
  React.useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.find((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, selectedCategoryId]);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setNominal(val);
    setInputStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const addPreset = (amount: number) => {
    const newTotal = nominal + amount;
    setNominal(newTotal);
    setInputStr(newTotal.toLocaleString('id-ID'));
  };

  const clearNominal = () => {
    setNominal(0);
    setInputStr('');
  };

  // Handler hasil scan nota otomatis (OCR)
  const handleScanSuccess = (
    data: {
      amount: number | null;
      merchant: string | null;
      date: string | null;
      categoryKeyword: string | null;
      candidateAmounts: CandidateAmount[];
    },
    imageDataUrl: string
  ) => {
    setReceiptPreview(imageDataUrl);

    // 1. Auto-fill nominal jika ditemukan
    if (data.amount && data.amount > 0) {
      setNominal(data.amount);
      setInputStr(data.amount.toLocaleString('id-ID'));
    }

    // 2. Auto-fill deskripsi jika ada nama toko dan keterangan masih kosong
    if (data.merchant && !description) {
      setDescription(`Belanja di ${data.merchant}`);
    }

    // 3. Auto-fill tanggal jika terdeteksi dari nota
    if (data.date) {
      setDate(data.date);
    }

    // 4. Auto-select kategori jika ada kata kunci yang cocok
    if (data.categoryKeyword) {
      const matched = categories.find((c) =>
        c.name.toLowerCase().includes(data.categoryKeyword!.toLowerCase())
      );
      if (matched) {
        setSelectedCategoryId(matched.id);
        if (matched.type !== type) {
          setType(matched.type);
        }
      }
    }
  };

  const handleSelectCandidateAmount = (amount: number) => {
    setNominal(amount);
    setInputStr(amount.toLocaleString('id-ID'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0 || !selectedAccountId) return;

    addTransaction({
      household_id: currentUser.household_id,
      account_id: selectedAccountId,
      category_id: selectedCategoryId || null,
      user_id: currentUser.id,
      type,
      amount: nominal,
      transaction_date: date,
      description: description.trim(),
      receipt_url: receiptPreview || undefined,
    });

    // Reset and close
    clearNominal();
    setDescription('');
    setReceiptPreview(null);
    setQuickInputOpen(false);
  };

  return (
    <Modal
      isOpen={isQuickInputOpen}
      onClose={() => setQuickInputOpen(false)}
      title="Catat Transaksi Cepat"
      subtitle={`Pencatatan cepat oleh ${currentUser?.full_name} (${currentUser?.persona === 'suami' ? 'Suami' : 'Istri'})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition ${
              type === 'expense'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>
        </div>

        {/* Fitur OCR Scan Nota / Ambil Gambar Nota Otomatis */}
        <ReceiptScannerSection
          receiptPreview={receiptPreview}
          onScanSuccess={handleScanSuccess}
          onImageClear={() => setReceiptPreview(null)}
          onSelectCandidateAmount={handleSelectCandidateAmount}
        />

        {/* Big Nominal Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nominal Transaksi (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={inputStr}
              onChange={handleNominalChange}
              autoFocus={!receiptPreview}
              className="w-full pl-12 pr-4 py-3 text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex flex-wrap gap-1.5">
          {[10000, 20000, 50000, 100000, 500000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => addPreset(amt)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
            >
              +{amt >= 1000 ? `${amt / 1000}rb` : amt}
            </button>
          ))}
          {nominal > 0 && (
            <button
              type="button"
              onClick={clearNominal}
              className="px-2 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Rekening & Kas Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Sumber Rekening / Dompet
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {accounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold truncate w-full">{acc.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatRupiah(acc.balance)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kategori Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Kategori
          </label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const IconComp = resolveCategoryIcon(cat.icon, cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-200'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan Singkat & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Catatan Singkat (Opsional)
            </label>
            <input
              type="text"
              placeholder="e.g. Belanja sayur di pasar, bensin pertamax"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={nominal <= 0 || !selectedAccountId}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
              nominal > 0 && selectedAccountId
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-emerald-500/30'
                : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            Simpan Transaksi ({formatRupiah(nominal)})
          </button>
        </div>
      </form>
    </Modal>
  );
}
