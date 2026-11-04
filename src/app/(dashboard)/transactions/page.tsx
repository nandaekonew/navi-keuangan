'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatDateIndo, formatRupiah, exportTransactionsToCSV } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { EditTransactionModal } from '@/components/forms/EditTransactionModal';
import { Transaction } from '@/types';
import {
  Download,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Trash2,
  Image,
  Pencil,
} from 'lucide-react';

export default function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
    members,
    deleteTransaction,
    setQuickInputOpen,
  } = useNaviStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cat = categories.find((c) => c.id === tx.category_id)?.name.toLowerCase() || '';
      const desc = (tx.description || '').toLowerCase();
      const acc = accounts.find((a) => a.id === tx.account_id)?.name.toLowerCase() || '';
      if (!cat.includes(q) && !desc.includes(q) && !acc.includes(q)) {
        return false;
      }
    }

    // Type
    if (selectedType !== 'all' && tx.type !== selectedType) {
      return false;
    }

    // Persona
    if (selectedPersona !== 'all') {
      const user = members.find((m) => m.id === tx.user_id);
      if (user?.persona !== selectedPersona) {
        return false;
      }
    }

    // Account
    if (selectedAccountId !== 'all') {
      if (tx.account_id !== selectedAccountId && tx.destination_account_id !== selectedAccountId) {
        return false;
      }
    }

    return true;
  });

  const handleExportCSV = () => {
    const enriched = filteredTransactions.map((tx) => {
      const user = members.find((m) => m.id === tx.user_id);
      const acc = accounts.find((a) => a.id === tx.account_id);
      const dest = tx.destination_account_id
        ? accounts.find((a) => a.id === tx.destination_account_id)
        : null;
      const cat = categories.find((c) => c.id === tx.category_id);

      return {
        ...tx,
        user_name: user?.full_name || 'Anggota',
        user_persona: user?.persona || 'suami',
        account_name: acc?.name,
        destination_account_name: dest?.name,
        category_name: cat?.name,
      };
    });

    exportTransactionsToCSV(enriched);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Riwayat Transaksi Keuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar lengkap arus kas rumah tangga dengan atribusi pencatat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickInputOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari transaksi, kategori, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Dropdowns / Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedPersona('all')}
              className={`px-3 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition ${
                selectedPersona === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedPersona('suami')}
              className={`px-3 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none transition ${
                selectedPersona === 'suami'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Suami
            </button>
            <button
              type="button"
              onClick={() => setSelectedPersona('istri')}
              className={`px-3 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:outline-none transition ${
                selectedPersona === 'istri'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Istri
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
            <option value="transfer">Transfer Antar Rekening</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Rekening</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {(searchQuery || selectedType !== 'all' || selectedPersona !== 'all' || selectedAccountId !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedPersona('all');
                setSelectedAccountId('all');
              }}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-lg"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            Tidak ada transaksi yang cocok dengan kriteria filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const account = accounts.find((a) => a.id === tx.account_id);
              const destAccount = tx.destination_account_id
                ? accounts.find((a) => a.id === tx.destination_account_id)
                : null;
              const category = categories.find((c) => c.id === tx.category_id);
              const user = members.find((m) => m.id === tx.user_id);
              const isSuami = user?.persona === 'suami';

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : tx.type === 'expense'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : tx.type === 'expense' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowLeftRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.type === 'transfer'
                            ? `Transfer ke ${destAccount?.name || 'Rekening'}`
                            : category?.name || tx.description || 'Transaksi'}
                        </span>
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSuami
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                          }`}
                        >
                          {isSuami ? 'Suami' : 'Istri'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 min-w-0">
                        <span className="whitespace-nowrap shrink-0 font-medium">
                          {formatDateIndo(tx.transaction_date)}
                        </span>
                        <span className="shrink-0 text-slate-300 dark:text-slate-600">•</span>
                        <span className="truncate max-w-[120px] sm:max-w-[200px] shrink-0">
                          {account?.name}
                        </span>
                        {tx.description && (
                          <>
                            <span className="shrink-0 text-slate-300 dark:text-slate-600">•</span>
                            <span className="truncate italic text-slate-400 dark:text-slate-500 max-w-xs">
                              {tx.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-black tracking-tight ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatRupiah(tx.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 p-0.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                      {tx.receipt_url && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptUrl(tx.receipt_url!)}
                          title="Lihat Struk"
                          aria-label="Lihat bukti struk"
                          className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 transition"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setTransactionToEdit(tx);
                          setIsEditModalOpen(true);
                        }}
                        title="Ubah Transaksi"
                        aria-label="Ubah transaksi"
                        className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus transaksi ini?')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        title="Hapus Transaksi"
                        aria-label="Hapus transaksi"
                        className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Preview Struk */}
      <Modal
        isOpen={Boolean(selectedReceiptUrl)}
        onClose={() => setSelectedReceiptUrl(null)}
        title="Foto Bukti Struk"
        maxWidth="sm"
      >
        {selectedReceiptUrl && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReceiptUrl}
                alt="Bukti Struk"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <a
              href={selectedReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-2.5 text-center text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
            >
              Buka Gambar Ukuran Penuh ↗
            </a>
          </div>
        )}
      </Modal>

      {/* Modal Edit Transaksi */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTransactionToEdit(null);
        }}
        transaction={transactionToEdit}
      />
    </div>
  );
}
