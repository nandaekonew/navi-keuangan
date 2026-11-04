'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import { calculateInstallment } from '@/lib/installmentUtils';
import { InstallmentModal } from '@/components/forms/InstallmentModal';
import {
  CreditCard,
  Plus,
  ArrowRight,
} from 'lucide-react';

export function InstallmentsQuickWidget() {
  const { installments } = useNaviStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Kalkulasi dinamis
  const calculatedList = useMemo(() => {
    return installments.map((inst) => calculateInstallment(inst, new Date()));
  }, [installments]);

  // Hanya tampilkan yang aktif (Auto-Hide yang sudah LUNAS)
  const activeInstallments = calculatedList.filter((item) => item.status === 'ACTIVE');
  const unpaidThisMonthCount = activeInstallments.filter((i) => !i.status_pembayaran_bulan_ini).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cicilan & Pinjaman Aktif
              </h3>
              {unpaidThisMonthCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {unpaidThisMonthCount} Belum Bayar
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pantau sisa tenor & pelunasan hutang
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1.5 rounded-xl focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {activeInstallments.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 space-y-1">
          <p>Semua cicilan lunas atau belum ada cicilan aktif.</p>
          <Link href="/installments" className="text-emerald-600 font-bold hover:underline block">
            Kelola Menu Cicilan →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {activeInstallments.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.nama_cicilan}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Cicilan Ke-{item.bulan_yang_dibayar} dari {item.tenor_bulan} bln • Sisa: {item.sisa_tenor} bln lagi
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-black text-xs text-slate-900 dark:text-white">
                    {formatRupiah(item.nominal_per_bulan)}
                    <span className="text-[10px] font-normal text-slate-400">/bln</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.status_pembayaran_bulan_ini
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.status_pembayaran_bulan_ini ? 'Lunas Bulan Ini' : 'Menunggu Bayar'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${item.persentase_selesai}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Progress: {item.persentase_selesai}%</span>
                <span>Sisa Hutang: <strong className="text-slate-700 dark:text-slate-200">{formatRupiah(item.sisa_tagihan)}</strong></span>
              </div>
            </div>
          ))}

          <Link
            href="/installments"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-dashed border-slate-200 dark:border-slate-800 mt-2"
          >
            <span>Buka Halaman Cicilan Lengkap ({activeInstallments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <InstallmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
