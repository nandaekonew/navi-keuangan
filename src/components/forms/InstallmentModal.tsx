'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { Installment } from '@/types';
import { formatRupiah, parseRupiahInput } from '@/lib/utils';
import { calculateInstallment } from '@/lib/installmentUtils';
import {
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Calculator,
} from 'lucide-react';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installmentToEdit?: Installment | null;
}

export function InstallmentModal({
  isOpen,
  onClose,
  installmentToEdit,
}: InstallmentModalProps) {
  const { household, accounts, addInstallment, updateInstallment } = useNaviStore();

  const [namaCicilan, setNamaCicilan] = useState('');
  const [nominal, setNominal] = useState<number>(0);
  const [nominalStr, setNominalStr] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tenorBulan, setTenorBulan] = useState<number>(12);
  const [statusBayarBulanIni, setStatusBayarBulanIni] = useState<boolean>(false);
  const [preferredAccountId, setPreferredAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (installmentToEdit) {
      setNamaCicilan(installmentToEdit.nama_cicilan);
      setNominal(installmentToEdit.nominal_per_bulan);
      setNominalStr(
        installmentToEdit.nominal_per_bulan > 0
          ? installmentToEdit.nominal_per_bulan.toLocaleString('id-ID')
          : ''
      );
      setTanggalMulai(installmentToEdit.tanggal_mulai);
      setTenorBulan(installmentToEdit.tenor_bulan);
      setStatusBayarBulanIni(installmentToEdit.status_pembayaran_bulan_ini);
      setPreferredAccountId(installmentToEdit.preferred_account_id || accounts[0]?.id || '');
      setNotes(installmentToEdit.notes || '');
    } else {
      setNamaCicilan('');
      setNominal(0);
      setNominalStr('');
      const today = new Date();
      const defaultStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      setTanggalMulai(defaultStart);
      setTenorBulan(12);
      setStatusBayarBulanIni(false);
      setPreferredAccountId(accounts[0]?.id || '');
      setNotes('');
    }
  }, [installmentToEdit, isOpen, accounts]);

  // Kalkulasi Live Preview
  const liveCalc = useMemo(() => {
    return calculateInstallment({
      id: 'preview',
      household_id: household.id,
      nama_cicilan: namaCicilan || 'Nama Cicilan',
      nominal_per_bulan: nominal,
      tanggal_mulai: tanggalMulai || new Date().toISOString().split('T')[0],
      tenor_bulan: Number(tenorBulan) || 1,
      status_pembayaran_bulan_ini: statusBayarBulanIni,
    });
  }, [namaCicilan, nominal, tanggalMulai, tenorBulan, statusBayarBulanIni, household.id]);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseRupiahInput(e.target.value);
    setNominal(val);
    setNominalStr(val > 0 ? val.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaCicilan.trim() || nominal <= 0 || tenorBulan <= 0 || !tanggalMulai) return;

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (installmentToEdit) {
      updateInstallment(installmentToEdit.id, {
        nama_cicilan: namaCicilan.trim(),
        nominal_per_bulan: nominal,
        tanggal_mulai: tanggalMulai,
        tenor_bulan: Number(tenorBulan),
        status_pembayaran_bulan_ini: statusBayarBulanIni,
        last_paid_period: statusBayarBulanIni ? currentPeriod : installmentToEdit.last_paid_period,
        preferred_account_id: preferredAccountId || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addInstallment({
        household_id: household.id,
        nama_cicilan: namaCicilan.trim(),
        nominal_per_bulan: nominal,
        tanggal_mulai: tanggalMulai,
        tenor_bulan: Number(tenorBulan),
        status_pembayaran_bulan_ini: statusBayarBulanIni,
        last_paid_period: statusBayarBulanIni ? currentPeriod : undefined,
        preferred_account_id: preferredAccountId || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={installmentToEdit ? 'Edit Rincian Cicilan' : 'Tambah Cicilan Baru'}
      subtitle="Input tagihan cicilan berjalan dengan kalkulasi otomatis"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Calculation Preview Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Live Preview Kalkulasi Sistem
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                liveCalc.status === 'LUNAS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {liveCalc.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
            <div>
              <span className="text-slate-400 text-[10px] block">Cicilan Ke-:</span>
              <span className="font-bold text-white">
                {liveCalc.bulan_yang_dibayar} dari {liveCalc.tenor_bulan} bln
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Sisa Tenor:</span>
              <span className="font-black text-amber-400">
                {liveCalc.sisa_tenor} bulan lagi
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block">Total Sisa Hutang:</span>
              <span className="font-black text-emerald-400">
                {formatRupiah(liveCalc.sisa_tagihan)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${liveCalc.persentase_selesai}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Progress: {liveCalc.persentase_selesai}% Lunas</span>
            <span>Target Lunas: {liveCalc.tanggal_estimasi_lunas}</span>
          </div>
        </div>

        {/* Nama Cicilan */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nama Cicilan / Hutang <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. KPR Rumah BTN, HP Samsung S24, Motor Vario"
            value={namaCicilan}
            onChange={(e) => setNamaCicilan(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Nominal per Bulan */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Nominal per Bulan (Rp) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={nominalStr}
              onChange={handleNominalChange}
              required
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tanggal Mulai & Total Tenor */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tanggal / Bulan Mulai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                required
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Total Tenor (Bulan) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min={1}
                max={360}
                placeholder="12"
                value={tenorBulan}
                onChange={(e) => setTenorBulan(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
                className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Status Pembayaran Bulan Ini */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Status Pembayaran Bulan Ini
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Apakah tagihan cicilan untuk bulan ini sudah dibayar?
              </span>
            </div>
            <input
              type="checkbox"
              checked={statusBayarBulanIni}
              onChange={(e) => setStatusBayarBulanIni(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
          </label>
        </div>

        {/* Rekening Pembayar */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Rekening / Sumber Dana Utama
          </label>
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={preferredAccountId}
              onChange={(e) => setPreferredAccountId(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Sisa: {formatRupiah(acc.balance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            placeholder="e.g. No. Kontrak, Autodebet tgl 10, Bunga 0%"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{installmentToEdit ? 'Simpan Perubahan Cicilan' : 'Simpan Data Cicilan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
