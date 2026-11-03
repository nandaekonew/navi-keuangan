'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { AccountType } from '@/types';
import { parseRupiahInput } from '@/lib/utils';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { addAccount, household } = useNaviStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [balanceStr, setBalanceStr] = useState('');
  const [color, setColor] = useState('#2563eb');

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setBalance(val);
    setBalanceStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAccount({
      household_id: household.id,
      name: name.trim(),
      type,
      account_number: accountNumber.trim() || undefined,
      balance,
      color,
    });

    setName('');
    setAccountNumber('');
    setBalance(0);
    setBalanceStr('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Rekening / Dompet Baru"
      subtitle="Kelola rekening bank, e-wallet, uang kas fisik, atau pos tabungan keluarga"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nama Rekening / Dompet
          </label>
          <input
            type="text"
            placeholder="e.g. BCA Utama, Mandiri, ShopeePay, Tabungan Haji"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tipe Akun
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="bank">Rekening Bank</option>
              <option value="ewallet">E-Wallet (GoPay, OVO, Dana)</option>
              <option value="cash">Kas Tunai (Dompet)</option>
              <option value="savings">Pos Dana Darurat / Deposito</option>
              <option value="investment">Investasi / Tabungan Anak</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Nomor Rekening / No. HP
            </label>
            <input
              type="text"
              placeholder="e.g. 5210192831"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Saldo Awal (Rp)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={balanceStr}
            onChange={handleBalanceChange}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Warna Kartu
          </label>
          <div className="flex items-center gap-2">
            {['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0284c7', '#4b5563'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition ${
                  color === c ? 'border-slate-900 dark:border-white scale-110 shadow' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            Simpan Rekening
          </button>
        </div>
      </form>
    </Modal>
  );
}
