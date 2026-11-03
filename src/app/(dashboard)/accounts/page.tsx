'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import { AccountModal } from '@/components/forms/AccountModal';
import {
  WalletCards,
  Building2,
  Smartphone,
  Banknote,
  PiggyBank,
  TrendingUp,
  ArrowLeftRight,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Account } from '@/types';

const accountIcons: Record<string, any> = {
  bank: Building2,
  ewallet: Smartphone,
  cash: Banknote,
  savings: PiggyBank,
  investment: TrendingUp,
};

const accountTypeLabels: Record<string, string> = {
  bank: 'Rekening Bank',
  ewallet: 'E-Wallet',
  cash: 'Uang Tunai (Cash)',
  savings: 'Pos Dana Darurat',
  investment: 'Pos Tabungan / Investasi',
};

export default function AccountsPage() {
  const { accounts, deleteAccount, setTransferOpen } = useNaviStore();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dompet & Rekening Kas
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pemisahan kas gaji, operasional, e-wallet, dan pos dana darurat keluarga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransferOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-500" />
            <span>Transfer Saldo</span>
          </button>
          <button
            onClick={() => {
              setAccountToEdit(null);
              setIsAccountModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Rekening</span>
          </button>
        </div>
      </div>

      {/* Total Balance Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Kekayaan Likuid Keluarga
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-emerald-400">
              {formatRupiah(totalBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Terdistribusi di {accounts.length} kantong kas & rekening bersama
            </p>
          </div>

          <button
            onClick={() => setTransferOpen(true)}
            className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-sm transition border border-white/10"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Pindahkan Saldo Antar Rekening</span>
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = accountIcons[acc.type] || Building2;
          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition"
            >
              {/* Color Accent Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color || '#10b981' }}
              />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: acc.color || '#10b981' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {acc.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {accountTypeLabels[acc.type] || acc.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    onClick={() => {
                      setAccountToEdit(acc);
                      setIsAccountModalOpen(true);
                    }}
                    title="Ubah Rekening"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus rekening ${acc.name}?`)) {
                          deleteAccount(acc.id);
                        }
                      }}
                      title="Hapus Rekening"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                  Saldo Saat Ini
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatRupiah(acc.balance)}
                </div>
                {acc.account_number && (
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    No: {acc.account_number}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setAccountToEdit(null);
        }}
        accountToEdit={accountToEdit}
      />
    </div>
  );
}
