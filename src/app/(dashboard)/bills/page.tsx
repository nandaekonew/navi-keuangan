'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { BillModal } from '@/components/forms/BillModal';
import { Modal } from '@/components/ui/Modal';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  AlertCircle,
  Trash2,
  Building2,
} from 'lucide-react';

export default function BillsPage() {
  const {
    recurringBills,
    accounts,
    categories,
    payRecurringBill,
    toggleBillPaidStatus,
    deleteRecurringBill,
  } = useNaviStore();

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

  const filteredBills = recurringBills.filter((b) => {
    if (filterStatus === 'unpaid') return !b.is_paid;
    if (filterStatus === 'paid') return b.is_paid;
    return true;
  });

  const totalBillAmount = recurringBills.reduce((sum, b) => sum + b.amount, 0);
  const unpaidTotal = recurringBills
    .filter((b) => !b.is_paid)
    .reduce((sum, b) => sum + b.amount, 0);

  const billToPay = recurringBills.find((b) => b.id === payingBillId);

  const handleConfirmPay = () => {
    if (payingBillId && selectedAccountId) {
      payRecurringBill(payingBillId, selectedAccountId);
      setPayingBillId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Checklist Tagihan Rutin Bulanan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kewajiban bulanan keluarga (Listrik PLN, WiFi, PDAM, SPP Sekolah, BPJS)
          </p>
        </div>

        <button
          onClick={() => setIsBillModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Tagihan</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Total Kewajiban Bulanan
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalBillAmount)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {recurringBills.length} pos tagihan terdaftar
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Belum Terbayar
          </span>
          <div className="text-2xl font-black text-amber-600">
            {formatRupiah(unpaidTotal)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            {recurringBills.filter((b) => !b.is_paid).length} tagihan menunggu pembayaran
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Sudah Lunas
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatRupiah(totalBillAmount - unpaidTotal)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {recurringBills.filter((b) => b.is_paid).length} tagihan telah diselesaikan
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterStatus === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Semua ({recurringBills.length})
        </button>
        <button
          onClick={() => setFilterStatus('unpaid')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterStatus === 'unpaid'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Belum Bayar ({recurringBills.filter((b) => !b.is_paid).length})
        </button>
        <button
          onClick={() => setFilterStatus('paid')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterStatus === 'paid'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500'
          }`}
        >
          Sudah Lunas ({recurringBills.filter((b) => b.is_paid).length})
        </button>
      </div>

      {/* Bills Cards List */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>Belum ada tagihan rutin yang terdaftar pada filter ini.</p>
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="text-emerald-600 font-bold hover:underline"
            >
              + Tambah Tagihan Baru
            </button>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const account = accounts.find((a) => a.id === bill.preferred_account_id);
            const category = categories.find((c) => c.id === bill.category_id);

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  bill.is_paid
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!bill.is_paid) {
                        setPayingBillId(bill.id);
                        setSelectedAccountId(bill.preferred_account_id || accounts[0]?.id || '');
                      } else {
                        toggleBillPaidStatus(bill.id);
                      }
                    }}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                  >
                    {bill.is_paid ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-bold text-sm ${
                          bill.is_paid
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {bill.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          bill.is_paid
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bill.is_paid ? 'Lunas' : 'Menunggu Bayar'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Jatuh tempo tgl {bill.due_day} setiap bulan
                      </span>
                      {account && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            Rek: {account.name}
                          </span>
                        </>
                      )}
                      {bill.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-400">{bill.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Quick Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-slate-400">Nominal Tagihan</div>
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {formatRupiah(bill.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!bill.is_paid ? (
                      <button
                        onClick={() => {
                          setPayingBillId(bill.id);
                          setSelectedAccountId(bill.preferred_account_id || accounts[0]?.id || '');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition"
                      >
                        Bayar Sekarang
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleBillPaidStatus(bill.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                      >
                        Batal Lunas
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Hapus tagihan rutin "${bill.name}"?`)) {
                          deleteRecurringBill(bill.id);
                        }
                      }}
                      title="Hapus Tagihan"
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pay Confirmation Modal */}
      <Modal
        isOpen={Boolean(payingBillId)}
        onClose={() => setPayingBillId(null)}
        title="Konfirmasi Pembayaran Tagihan"
        subtitle={`Pembayaran akan otomatis mencatat pengeluaran dan memotong saldo rekening`}
        maxWidth="sm"
      >
        {billToPay && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Nama Tagihan:</span>
                <span className="font-bold text-slate-900 dark:text-white">{billToPay.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal:</span>
                <span className="font-bold text-emerald-600 text-sm">{formatRupiah(billToPay.amount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Pilih Rekening Pemotong Saldo
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Sisa: {formatRupiah(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPay}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
              >
                Bayar & Potong Saldo ({formatRupiah(billToPay.amount)})
              </button>
            </div>
          </div>
        )}
      </Modal>

      <BillModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} />
    </div>
  );
}
