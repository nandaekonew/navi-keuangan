'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { RecurringBill } from '@/types';
import { parseRupiahInput } from '@/lib/utils';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  billToEdit?: RecurringBill | null;
}

export function BillModal({ isOpen, onClose, billToEdit }: BillModalProps) {
  const { addRecurringBill, updateRecurringBill, accounts, categories, household } = useNaviStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountStr, setAmountStr] = useState('');
  const [dueDay, setDueDay] = useState<number>(10);
  const [preferredAccountId, setPreferredAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.name.includes('Tagihan') || c.type === 'expense')?.id || ''
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (billToEdit) {
      setName(billToEdit.name);
      setAmount(billToEdit.amount);
      setAmountStr(billToEdit.amount > 0 ? billToEdit.amount.toLocaleString('id-ID') : '');
      setDueDay(billToEdit.due_day);
      setPreferredAccountId(billToEdit.preferred_account_id || accounts[0]?.id || '');
      setCategoryId(
        billToEdit.category_id ||
          categories.find((c) => c.name.includes('Tagihan') || c.type === 'expense')?.id ||
          ''
      );
      setNotes(billToEdit.notes || '');
    } else {
      setName('');
      setAmount(0);
      setAmountStr('');
      setDueDay(10);
      setPreferredAccountId(accounts[0]?.id || '');
      setCategoryId(
        categories.find((c) => c.name.includes('Tagihan') || c.type === 'expense')?.id || ''
      );
      setNotes('');
    }
  }, [billToEdit, isOpen, accounts, categories]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setAmount(val);
    setAmountStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0) return;

    if (billToEdit) {
      updateRecurringBill(billToEdit.id, {
        name: name.trim(),
        amount,
        due_day: Number(dueDay),
        preferred_account_id: preferredAccountId || null,
        category_id: categoryId || null,
        notes: notes.trim() || null,
      });
    } else {
      addRecurringBill({
        household_id: household.id,
        name: name.trim(),
        amount,
        due_day: Number(dueDay),
        preferred_account_id: preferredAccountId || undefined,
        category_id: categoryId || undefined,
        notes: notes.trim() || undefined,
        is_paid: false,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={billToEdit ? 'Ubah Tagihan Rutin Bulanan' : 'Tambah Tagihan Rutin Bulanan'}
      subtitle={
        billToEdit
          ? 'Perbarui nominal, tanggal jatuh tempo, rekening, atau catatan'
          : 'Catat kewajiban berkala keluarga (Listrik PLN, WiFi, PDAM, SPP Anak, BPJS)'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nama Tagihan
          </label>
          <input
            type="text"
            placeholder="e.g. Listrik PLN, WiFi Indihome, BPJS Kesehatan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Nominal Estimasi (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amountStr}
              onChange={handleAmountChange}
              required
              className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tanggal Jatuh Tempo (Tgl 1-31)
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => setDueDay(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Rekening Pembayaran
            </label>
            <select
              value={preferredAccountId}
              onChange={(e) => setPreferredAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Kategori Pengeluaran
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Catatan / No. Pelanggan
          </label>
          <input
            type="text"
            placeholder="e.g. ID Pelanggan PLN: 51293847291"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            {billToEdit ? 'Simpan Perubahan Tagihan' : 'Simpan Tagihan Rutin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
