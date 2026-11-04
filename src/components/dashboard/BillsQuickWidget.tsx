'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import { BillModal } from '@/components/forms/BillModal';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export function BillsQuickWidget() {
  const { recurringBills, payRecurringBill, toggleBillPaidStatus, accounts } = useNaviStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unpaidCount = recurringBills.filter((b) => !b.is_paid).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Tagihan Rutin Bulan Ini
              </h3>
              {unpaidCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 whitespace-nowrap">
                  {unpaidCount} Belum Bayar
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Centang untuk bayar & otomatis potong saldo
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5 rounded-xl transition shrink-0 ml-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {recurringBills.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          Belum ada tagihan rutin. Klik Tambah untuk mencatat tagihan baru.
        </div>
      ) : (
        <div className="space-y-2.5">
          {recurringBills.slice(0, 4).map((bill) => {
            const account = accounts.find((a) => a.id === bill.preferred_account_id);
            return (
              <div
                key={bill.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                  bill.is_paid
                    ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/60 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!bill.is_paid) {
                        payRecurringBill(bill.id);
                      } else {
                        toggleBillPaidStatus(bill.id);
                      }
                    }}
                    title={bill.is_paid ? 'Tandai belum bayar' : 'Klik untuk bayar sekarang'}
                    className="text-slate-400 hover:text-emerald-600 transition shrink-0"
                  >
                    {bill.is_paid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-bold truncate ${
                        bill.is_paid
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                      title={bill.name}
                    >
                      {bill.name}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 min-w-0">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Tgl {bill.due_day}</span>
                      </span>
                      {account && (
                        <>
                          <span className="shrink-0 text-slate-300 dark:text-slate-600">•</span>
                          <span className="truncate" title={account.name}>
                            {account.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div
                    className={`text-xs font-black tracking-tight ${
                      bill.is_paid ? 'text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatRupiah(bill.amount)}
                  </div>
                  {!bill.is_paid ? (
                    <button
                      type="button"
                      onClick={() => payRecurringBill(bill.id)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg transition mt-0.5"
                    >
                      Bayar
                    </button>
                  ) : (
                    <span className="inline-block text-[10px] text-emerald-600 font-bold mt-0.5">
                      Lunas
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex justify-end">
            <Link
              href="/bills"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <span>Buka Seluruh Checklist Tagihan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}