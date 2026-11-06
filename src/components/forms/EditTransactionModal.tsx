'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { Transaction, TransactionType } from '@/types';
import { formatRupiah, parseRupiahInput } from '@/lib/utils';
import { resolveCategoryIcon } from '@/lib/categoryIcons';
import { ReceiptScannerSection } from '@/components/forms/ReceiptScannerSection';
import { CandidateAmount } from '@/lib/receiptScanner';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  User,
  Trash2,
} from 'lucide-react';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
}: EditTransactionModalProps) {
  const {
    accounts,
    categories,
    members,
    updateTransaction,
  } = useNaviStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [nominal, setNominal] = useState<number>(0);
  const [inputStr, setInputStr] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedDestinationAccountId, setSelectedDestinationAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setNominal(transaction.amount);
      setInputStr(transaction.amount > 0 ? transaction.amount.toLocaleString('id-ID') : '');
      setSelectedAccountId(transaction.account_id);
      setSelectedDestinationAccountId(transaction.destination_account_id || '');
      setSelectedCategoryId(transaction.category_id || '');
      setSelectedUserId(transaction.user_id || members[0]?.id || '');
      setDate(transaction.transaction_date);
      setDescription(transaction.description || '');
      setReceiptPreview(transaction.receipt_url || null);
    }
  }, [transaction, isOpen, members]);

  const availableCategories = categories.filter((c) => c.type === type);

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

    if (data.amount && data.amount > 0) {
      setNominal(data.amount);
      setInputStr(data.amount.toLocaleString('id-ID'));
    }

    if (data.merchant && !description) {
      setDescription(`Belanja di ${data.merchant}`);
    }

    if (data.date) {
      setDate(data.date);
    }

    if (data.categoryKeyword) {
      const matched = categories.find((c) =>
        c.name.toLowerCase().includes(data.categoryKeyword!.toLowerCase())
      );
      if (matched) {
        setSelectedCategoryId(matched.id);
        if (matched.type !== type && type !== 'transfer') {
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
    if (!transaction) return;
    if (nominal <= 0 || !selectedAccountId) return;
    if (type === 'transfer' && !selectedDestinationAccountId) return;

    updateTransaction(transaction.id, {
      account_id: selectedAccountId,
      destination_account_id: type === 'transfer' ? selectedDestinationAccountId : null,
      category_id: type !== 'transfer' ? selectedCategoryId || null : null,
      user_id: selectedUserId,
      type,
      amount: nominal,
      transaction_date: date,
      description: description.trim(),
      receipt_url: receiptPreview || undefined,
    });

    onClose();
  };

  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Rincian Transaksi"
      subtitle="Perbarui nominal, kategori, akun, atau foto struk transaksi"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipe Transaksi */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
              type === 'expense'
                ? 'bg-red-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Pemasukan</span>
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
              type === 'transfer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Scan Nota Otomatis */}
        <ReceiptScannerSection
          receiptPreview={receiptPreview}
          onScanSuccess={handleScanSuccess}
          onImageClear={() => setReceiptPreview(null)}
          onSelectCandidateAmount={handleSelectCandidateAmount}
        />

        {/* Nominal Input */}
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
              className="w-full pl-12 pr-4 py-2.5 text-xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5">
          {[10000, 25000, 50000, 100000, 200000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => addPreset(amt)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            >
              +{amt >= 1000 ? `${amt / 1000}rb` : amt}
            </button>
          ))}
        </div>

        {/* User / Persona Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Dicatat Oleh (Persona)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => {
              const isSelected = selectedUserId === m.id;
              const isSuami = m.persona === 'suami';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedUserId(m.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                    isSelected
                      ? isSuami
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200'
                        : 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 text-pink-900 dark:text-pink-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      isSuami ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                    }`}
                  >
                    {isSuami ? 'S' : 'I'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{m.full_name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{m.persona}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rekening Sumber & Rekening Tujuan (Jika Transfer) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {type === 'transfer' ? 'Rekening Sumber' : 'Rekening / Dompet'}
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatRupiah(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Rekening Tujuan
              </label>
              <select
                value={selectedDestinationAccountId}
                onChange={(e) => setSelectedDestinationAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Pilih Tujuan...</option>
                {accounts
                  .filter((a) => a.id !== selectedAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatRupiah(acc.balance)})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Categories (If not transfer) */}
        {type !== 'transfer' && (
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
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
        )}

        {/* Catatan Singkat & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              placeholder="e.g. Belanja sayur di pasar, Bayar tagihan wifi"
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
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            Simpan Perubahan Transaksi
          </button>
        </div>
      </form>
    </Modal>
  );
}
