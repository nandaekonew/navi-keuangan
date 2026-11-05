'use client';

import React, { useState, useMemo } from 'react';
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
  ArrowUpDown,
  Tag,
  Calendar,
  RotateCcw,
  Wallet,
  X,
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Waktu saat ini untuk filter periode
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Filter Transaksi
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Pencarian kata kunci
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === tx.category_id)?.name.toLowerCase() || '';
        const desc = (tx.description || '').toLowerCase();
        const acc = accounts.find((a) => a.id === tx.account_id)?.name.toLowerCase() || '';
        if (!cat.includes(q) && !desc.includes(q) && !acc.includes(q)) {
          return false;
        }
      }

      // Filter Tipe (Pemasukan, Pengeluaran, Transfer)
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Filter Kategori
      if (selectedCategoryId !== 'all' && tx.category_id !== selectedCategoryId) {
        return false;
      }

      // Filter Persona (Suami / Istri)
      if (selectedPersona !== 'all') {
        const user = members.find((m) => m.id === tx.user_id);
        if (user?.persona !== selectedPersona) {
          return false;
        }
      }

      // Filter Rekening Sumber / Tujuan
      if (selectedAccountId !== 'all') {
        if (tx.account_id !== selectedAccountId && tx.destination_account_id !== selectedAccountId) {
          return false;
        }
      }

      // Filter Rentang Waktu (Periode)
      if (selectedPeriod !== 'all') {
        const txDate = new Date(tx.transaction_date);
        if (selectedPeriod === 'this_month') {
          if (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear) {
            return false;
          }
        } else if (selectedPeriod === 'last_month') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (txDate.getMonth() !== lastMonth || txDate.getFullYear() !== lastMonthYear) {
            return false;
          }
        } else if (selectedPeriod === 'this_year') {
          if (txDate.getFullYear() !== currentYear) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedCategoryId,
    selectedPersona,
    selectedAccountId,
    selectedPeriod,
    categories,
    accounts,
    members,
    currentMonth,
    currentYear,
  ]);

  // 2. Sort Transaksi
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();

        case 'oldest':
          return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();

        case 'expense_highest': {
          // Prioritaskan pengeluaran, urutkan dari nominal terbesar
          const isExpA = a.type === 'expense';
          const isExpB = b.type === 'expense';
          if (isExpA && !isExpB) return -1;
          if (!isExpA && isExpB) return 1;
          return b.amount - a.amount;
        }

        case 'expense_lowest': {
          // Prioritaskan pengeluaran, urutkan dari nominal terkecil
          const isExpA = a.type === 'expense';
          const isExpB = b.type === 'expense';
          if (isExpA && !isExpB) return -1;
          if (!isExpA && isExpB) return 1;
          return a.amount - b.amount;
        }

        case 'income_highest': {
          // Prioritaskan pemasukan, urutkan dari nominal terbesar
          const isIncA = a.type === 'income';
          const isIncB = b.type === 'income';
          if (isIncA && !isIncB) return -1;
          if (!isIncA && isIncB) return 1;
          return b.amount - a.amount;
        }

        case 'income_lowest': {
          // Prioritaskan pemasukan, urutkan dari nominal terkecil
          const isIncA = a.type === 'income';
          const isIncB = b.type === 'income';
          if (isIncA && !isIncB) return -1;
          if (!isIncA && isIncB) return 1;
          return a.amount - b.amount;
        }

        case 'amount_highest':
          return b.amount - a.amount;

        case 'amount_lowest':
          return a.amount - b.amount;

        case 'category_asc': {
          const catA = categories.find((c) => c.id === a.category_id)?.name || a.description || '';
          const catB = categories.find((c) => c.id === b.category_id)?.name || b.description || '';
          return catA.localeCompare(catB);
        }

        default:
          return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      }
    });
  }, [filteredTransactions, sortBy, categories]);

  // 3. Ringkasan Kalkulasi Hasil Filter
  const summaryMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expense += tx.amount;
    });
    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense,
    };
  }, [filteredTransactions]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'all' ||
    selectedPersona !== 'all' ||
    selectedAccountId !== 'all' ||
    selectedCategoryId !== 'all' ||
    selectedPeriod !== 'all' ||
    sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedPersona('all');
    setSelectedAccountId('all');
    setSelectedCategoryId('all');
    setSelectedPeriod('all');
    setSortBy('newest');
  };

  const handleExportCSV = () => {
    const enriched = sortedTransactions.map((tx) => {
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
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Riwayat Transaksi Keuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola, filter kategori, dan urutkan arus kas rumah tangga secara akurat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
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

      {/* Filter & Sort Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        {/* Baris 1: Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari transaksi, kategori, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <label htmlFor="sort-select" className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                Urutkan:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="dark:bg-slate-800">Transaksi Terbaru</option>
                <option value="oldest" className="dark:bg-slate-800">Transaksi Terlama</option>
                <option value="expense_highest" className="dark:bg-slate-800">Pengeluaran Tertinggi</option>
                <option value="expense_lowest" className="dark:bg-slate-800">Pengeluaran Terendah</option>
                <option value="income_highest" className="dark:bg-slate-800">Pemasukan Tertinggi</option>
                <option value="income_lowest" className="dark:bg-slate-800">Pemasukan Terendah</option>
                <option value="amount_highest" className="dark:bg-slate-800">Nominal Tertinggi (Semua)</option>
                <option value="amount_lowest" className="dark:bg-slate-800">Nominal Terendah (Semua)</option>
                <option value="category_asc" className="dark:bg-slate-800">Nama Kategori (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Baris 2: Dropdowns Filter (Kategori, Tipe, Persona, Akun, Periode) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {/* Persona Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedPersona('all')}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                selectedPersona === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedPersona('suami')}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                selectedPersona === 'suami'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Suami
            </button>
            <button
              type="button"
              onClick={() => setSelectedPersona('istri')}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                selectedPersona === 'istri'
                  ? 'bg-pink-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Istri
            </button>
          </div>

          {/* Filter Kategori */}
          <div className="relative">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              aria-label="Filter berdasarkan kategori"
              className={`pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                selectedCategoryId !== 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <option value="all">Semua Kategori</option>
              {selectedType !== 'income' && (
                <optgroup label="Pos Pengeluaran">
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </optgroup>
              )}
              {selectedType !== 'expense' && (
                <optgroup label="Pos Pemasukan">
                  {categories
                    .filter((c) => c.type === 'income')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Tipe Transaksi */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              // Reset category jika kategori saat ini tidak cocok dengan tipe baru
              if (selectedCategoryId !== 'all') {
                const currentCat = categories.find((c) => c.id === selectedCategoryId);
                if (currentCat && e.target.value !== 'all' && currentCat.type !== e.target.value) {
                  setSelectedCategoryId('all');
                }
              }
            }}
            aria-label="Filter tipe transaksi"
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
            <option value="transfer">Transfer Antar Rekening</option>
          </select>

          {/* Filter Rekening */}
          <div className="relative">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              aria-label="Filter berdasarkan rekening"
              className="pl-7 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Rekening</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <Wallet className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Periode Waktu */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Filter periode waktu"
              className="pl-7 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="this_month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="this_year">Tahun Ini</option>
            </select>
            <Calendar className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 transition"
              title="Kembalikan semua filter ke awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Baris 3: Strip Ringkasan Hasil Filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Ditemukan:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {summaryMetrics.count} transaksi
            </span>
            {transactions.length !== summaryMetrics.count && (
              <span className="text-[11px] text-slate-400">
                (dari total {transactions.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-semibold text-xs flex-wrap">
            {summaryMetrics.income > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                Pemasukan: +{formatRupiah(summaryMetrics.income)}
              </span>
            )}
            {summaryMetrics.expense > 0 && (
              <span className="text-red-600 dark:text-red-400">
                Pengeluaran: -{formatRupiah(summaryMetrics.expense)}
              </span>
            )}
            <span className="text-slate-600 dark:text-slate-300 font-bold">
              Arus Kas: {formatRupiah(summaryMetrics.net)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tidak ada transaksi yang cocok dengan kriteria pencarian / filter ini.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedTransactions.map((tx) => {
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
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded-xl transition-colors"
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
