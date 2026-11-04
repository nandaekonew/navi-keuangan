'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatDateIndo, formatRupiah } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { EditTransactionModal } from '@/components/forms/EditTransactionModal';
import { Transaction } from '@/types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Receipt,
  Trash2,
  Image,
  ArrowRight,
  Pencil,
} from 'lucide-react';

export function RecentTransactions() {
  const { transactions, accounts, categories, members, deleteTransaction } = useNaviStore();
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Transaksi Terkini Keluarga
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Input real-time dari HP Suami & Istri
            </p>
          </div>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <span>Semua ({transactions.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          Belum ada transaksi yang dicatat. Tekan tombol Catat untuk memulai!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {transactions.slice(0, 6).map((tx) => {
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
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Transaction Type Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : tx.type === 'expense'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'expense' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowLeftRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {tx.type === 'transfer'
                          ? `Transfer ke ${destAccount?.name || 'Rekening'}`
                          : category?.name || tx.description || 'Transaksi'}
                      </span>
                      {/* Persona Badge: Suami / Istri */}
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isSuami
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                        }`}
                      >
                        {isSuami ? 'Suami' : 'Istri'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{formatDateIndo(tx.transaction_date)}</span>
                      <span>•</span>
                      <span className="truncate">{account?.name || 'Rekening'}</span>
                      {tx.description && (
                        <>
                          <span>•</span>
                          <span className="truncate italic max-w-[120px] sm:max-w-xs">
                            {tx.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {tx.receipt_url && (
                    <button
                      type="button"
                      onClick={() => setSelectedReceiptUrl(tx.receipt_url!)}
                      title="Lihat Bukti Struk"
                      aria-label="Lihat bukti struk"
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                  )}

                  <div className="text-right">
                    <div
                      className={`text-xs font-black tracking-tight ${
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

                  <button
                    type="button"
                    onClick={() => {
                      setTransactionToEdit(tx);
                      setIsEditModalOpen(true);
                    }}
                    title="Ubah Transaksi"
                    aria-label="Ubah transaksi"
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hapus transaksi ini?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    title="Hapus Transaksi"
                    aria-label="Hapus transaksi"
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-red-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                className="max-h-[60vh] w-auto object-contain"
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
