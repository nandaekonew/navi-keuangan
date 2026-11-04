'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { Transaction, TransactionType } from '@/types';
import { formatRupiah, parseRupiahInput } from '@/lib/utils';
import { resolveCategoryIcon } from '@/lib/categoryIcons';
import {
  Camera,
  X,
  Tag,
  CreditCard,
  Calendar,
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

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      title="Ubah Transaksi"
      subtitle="Perbarui data nominal, kategori, rekening, atau catatan transaksi"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              type === 'expense'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Pemasukan</span>
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              type === 'transfer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nominal Transaksi (Rp) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-black text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={inputStr}
              onChange={handleNominalChange}
              required
              className="w-full pl-11 pr-4 py-2.5 text-xl font-black rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[10000, 20000, 50000, 100000, 500000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => addPreset(val)}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                +{val >= 1000 ? `${val / 1000}rb` : val}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setNominal(0);
                setInputStr('');
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Date and Persona */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tanggal Transaksi
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Dicatat Oleh
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.persona === 'suami' ? '[Suami] ' : '[Istri] '}{m.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rekening Sumber & Rekening Tujuan (jika Transfer) */}
        <div className={type === 'transfer' ? 'grid grid-cols-2 gap-2' : ''}>
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
        )}

        {/* Description / Notes */}
        <div>
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

        {/* Receipt Upload / Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Foto Bukti Struk / Struk Belanja
          </label>
          {receiptPreview ? (
            <div className="relative inline-block border rounded-xl overflow-hidden shadow-sm">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="w-28 h-28 object-cover"
              />
              <button
                type="button"
                onClick={() => setReceiptPreview(null)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                title="Hapus foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Upload atau foto struk baru
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </label>
          )}
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
