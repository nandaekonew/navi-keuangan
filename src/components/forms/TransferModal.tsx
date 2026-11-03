'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, parseRupiahInput } from '@/lib/utils';
import { ArrowDown, Info } from 'lucide-react';

export function TransferModal() {
  const {
    isTransferOpen,
    setTransferOpen,
    accounts,
    transferFunds,
    currentUser,
  } = useNaviStore();

  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [nominal, setNominal] = useState<number>(0);
  const [inputStr, setInputStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const sourceAccount = accounts.find((a) => a.id === fromAccountId);
  const targetAccount = accounts.find((a) => a.id === toAccountId);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setNominal(val);
    setInputStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominal <= 0 || !fromAccountId || !toAccountId || fromAccountId === toAccountId) return;

    transferFunds(
      fromAccountId,
      toAccountId,
      nominal,
      notes.trim() || `Transfer dari ${sourceAccount?.name} ke ${targetAccount?.name}`
    );

    setNominal(0);
    setInputStr('');
    setNotes('');
    setTransferOpen(false);
  };

  const isInvalid =
    nominal <= 0 ||
    !fromAccountId ||
    !toAccountId ||
    fromAccountId === toAccountId ||
    (sourceAccount && sourceAccount.balance < nominal);

  return (
    <Modal
      isOpen={isTransferOpen}
      onClose={() => setTransferOpen(false)}
      title="Transfer Antar Rekening"
      subtitle="Pindahkan dana antar rekening/dompet tanpa dihitung pengeluaran ganda"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notice Info */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Saldo rekening asal akan terpotong dan rekening tujuan akan bertambah. Arus kas bersih keluarga Anda tetap seimbang.
          </p>
        </div>

        {/* Source Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Dari Rekening (Asal)
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — Sisa: {formatRupiah(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        {/* Transfer Divider Icon */}
        <div className="flex justify-center -my-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Destination Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Ke Rekening (Tujuan)
          </label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                {acc.name} — Saldo: {formatRupiah(acc.balance)} {acc.id === fromAccountId ? '(Sama)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Nominal Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nominal Transfer
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
              className="w-full pl-12 pr-4 py-2.5 text-xl font-black rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {sourceAccount && sourceAccount.balance < nominal && (
            <p className="text-[11px] text-red-500 font-medium mt-1">
              Saldo tidak mencukupi! Maksimal {formatRupiah(sourceAccount.balance)}
            </p>
          )}
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Catatan Transfer (Opsional)
          </label>
          <input
            type="text"
            placeholder="e.g. Alokasi pos dana darurat, topup GoPay istri"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={Boolean(isInvalid)}
            className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md ${
              !isInvalid
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            Transfer Sekarang
          </button>
        </div>
      </form>
    </Modal>
  );
}
