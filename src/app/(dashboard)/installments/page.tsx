'use client';

import React, { useState, useMemo } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import {
  calculateInstallment,
  formatInstallmentJSON,
  formatInstallmentStructuredText,
} from '@/lib/installmentUtils';
import { InstallmentModal } from '@/components/forms/InstallmentModal';
import { Modal } from '@/components/ui/Modal';
import { Installment, CalculatedInstallment } from '@/types';
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Pencil,
  Copy,
  Check,
  Building2,
  Archive,
  Layers,
  Code2,
} from 'lucide-react';

export default function InstallmentsPage() {
  const {
    installments,
    accounts,
    deleteInstallment,
    toggleInstallmentPaidStatus,
    payInstallment,
  } = useNaviStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installmentToEdit, setInstallmentToEdit] = useState<Installment | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'paid_off' | 'all'>('active');
  const [payingInstId, setPayingInstId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [jsonViewItem, setJsonViewItem] = useState<CalculatedInstallment | null>(null);

  // Kalkulasi semua cicilan secara dinamis berdasarkan tanggal sekarang
  const calculatedList = useMemo(() => {
    return installments.map((inst) => calculateInstallment(inst, new Date()));
  }, [installments]);

  // Pisahkan aktif (ACTIVE) dan riwayat selesai (LUNAS - auto-hide dari aktif)
  const activeInstallments = calculatedList.filter((item) => item.status === 'ACTIVE');
  const paidOffInstallments = calculatedList.filter((item) => item.status === 'LUNAS');

  const displayedList = useMemo(() => {
    if (activeTab === 'active') return activeInstallments;
    if (activeTab === 'paid_off') return paidOffInstallments;
    return calculatedList;
  }, [activeTab, activeInstallments, paidOffInstallments, calculatedList]);

  // Statistik Ringkasan
  const totalSisaHutang = activeInstallments.reduce((sum, item) => sum + item.sisa_tagihan, 0);
  const bebanCicilanBulanIni = activeInstallments
    .filter((item) => !item.status_pembayaran_bulan_ini)
    .reduce((sum, item) => sum + item.nominal_per_bulan, 0);
  const totalSudahDibayar = calculatedList.reduce((sum, item) => sum + item.total_sudah_dibayar, 0);

  const instToPay = calculatedList.find((i) => i.id === payingInstId);

  const handleConfirmPay = () => {
    if (payingInstId) {
      payInstallment(payingInstId, selectedAccountId);
      setPayingInstId(null);
    }
  };

  const handleCopySummary = (item: CalculatedInstallment) => {
    const text = formatInstallmentStructuredText(item);
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Kalkulator & Manajemen Cicilan</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Menerima input cicilan, menghitung sisa tenor & hutang dinamis per bulan hingga lunas
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setInstallmentToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Cicilan</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total Sisa Hutang Keluarga</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalSisaHutang)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dari {activeInstallments.length} pos cicilan aktif berjalan
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Beban Bulan Ini (Belum Bayar)</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {formatRupiah(bebanCicilanBulanIni)}
          </div>
          <span className="text-[11px] text-rose-700/80 font-medium mt-1 block">
            {activeInstallments.filter((i) => !i.status_pembayaran_bulan_ini).length} cicilan menunggu bayar bulan ini
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Akumulasi Terbayar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatRupiah(totalSudahDibayar)}
          </div>
          <span className="text-[11px] text-emerald-700/80 font-medium mt-1 block">
            {paidOffInstallments.length} cicilan telah lunas sepenuhnya
          </span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Cicilan Aktif ({activeInstallments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paid_off')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
            activeTab === 'paid_off'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Riwayat Lunas ({paidOffInstallments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
            activeTab === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua ({calculatedList.length})</span>
        </button>
      </div>

      {/* Installment List Cards */}
      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>
              {activeTab === 'active'
                ? 'Tidak ada cicilan aktif saat ini. Semua cicilan lunas atau belum ditambahkan.'
                : activeTab === 'paid_off'
                ? 'Belum ada riwayat cicilan yang lunas.'
                : 'Belum ada data cicilan yang terdaftar.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setInstallmentToEdit(null);
                setIsModalOpen(true);
              }}
              className="text-emerald-600 font-bold hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
            >
              + Tambah Cicilan Baru
            </button>
          </div>
        ) : (
          displayedList.map((item) => {
            const account = accounts.find((a) => a.id === item.preferred_account_id);
            const isLunas = item.status === 'LUNAS';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLunas
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-85'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {/* Top Row: Name, Status Badge, and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isLunas
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isLunas ? '✓' : `${item.bulan_yang_dibayar}/${item.tenor_bulan}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.nama_cicilan}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isLunas
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.status_pembayaran_bulan_ini && !isLunas && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                            Lunas Bulan Ini ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Mulai: {item.tanggal_mulai}
                        </span>
                        <span>•</span>
                        <span>Estimasi Lunas: {item.tanggal_estimasi_lunas}</span>
                        {account && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {account.name}
                            </span>
                          </>
                        )}
                        {item.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-400">{item.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopySummary(item)}
                      title="Salin Ringkasan Terstruktur"
                      aria-label="Salin ringkasan terstruktur"
                      className="min-w-[44px] min-h-[44px] px-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-xs flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-[10px] font-semibold hidden md:inline">Salin Format</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setJsonViewItem(item)}
                      title="Lihat Format JSON"
                      aria-label="Lihat format JSON"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
                    >
                      <Code2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInstallmentToEdit(item);
                        setIsModalOpen(true);
                      }}
                      title="Ubah Cicilan"
                      aria-label="Ubah cicilan"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus data cicilan "${item.nama_cicilan}"?`)) {
                          deleteInstallment(item.id);
                        }
                      }}
                      title="Hapus Cicilan"
                      aria-label="Hapus cicilan"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cicilan Ke-</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.bulan_yang_dibayar} dari {item.tenor_bulan}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Nominal Bulanan</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatRupiah(item.nominal_per_bulan)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Sisa Tenor</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {item.sisa_tenor} bulan lagi
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Sisa Hutang</span>
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                      {formatRupiah(item.sisa_tagihan)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Repayment Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Progres Pelunasan: {item.persentase_selesai}%</span>
                      <span>Terbayar: {formatRupiah(item.total_sudah_dibayar)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLunas
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${item.persentase_selesai}%` }}
                      />
                    </div>
                  </div>

                  {/* Payment Action Toggle */}
                  {!isLunas && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!item.status_pembayaran_bulan_ini ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPayingInstId(item.id);
                            setSelectedAccountId(item.preferred_account_id || accounts[0]?.id || '');
                          }}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Bayar Bulan Ini ({formatRupiah(item.nominal_per_bulan)})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleInstallmentPaidStatus(item.id)}
                          className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
                        >
                          Batal Bayar Bulan Ini
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pay Confirmation Modal */}
      <Modal
        isOpen={Boolean(payingInstId)}
        onClose={() => setPayingInstId(null)}
        title="Konfirmasi Pembayaran Cicilan"
        subtitle="Otomatis mencatat pengeluaran transaksi dan memotong saldo rekening"
        maxWidth="sm"
      >
        {instToPay && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Nama Cicilan:</span>
                <span className="font-bold text-slate-900 dark:text-white">{instToPay.nama_cicilan}</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-500">Cicilan Ke-:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {instToPay.bulan_yang_dibayar + 1} dari {instToPay.tenor_bulan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {formatRupiah(instToPay.nominal_per_bulan)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Pilih Rekening Pemotong Saldo
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Sisa: {formatRupiah(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmPay}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
              >
                Bayar & Potong Saldo ({formatRupiah(instToPay.nominal_per_bulan)})
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* JSON Inspector Modal */}
      <Modal
        isOpen={Boolean(jsonViewItem)}
        onClose={() => setJsonViewItem(null)}
        title="Format Output JSON / Ringkasan Terstruktur"
        subtitle="Hasil kalkulasi sistem sesuai format tugas utama"
        maxWidth="md"
      >
        {jsonViewItem && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Ringkasan Terstruktur:
              </span>
              <pre className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 text-xs font-mono whitespace-pre-wrap">
                {formatInstallmentStructuredText(jsonViewItem)}
              </pre>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Format JSON:
              </span>
              <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto">
                {JSON.stringify(formatInstallmentJSON(jsonViewItem), null, 2)}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(formatInstallmentJSON(jsonViewItem), null, 2)
                );
                alert('JSON berhasil disalin ke clipboard!');
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
            >
              Salin JSON ke Clipboard
            </button>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <InstallmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInstallmentToEdit(null);
        }}
        installmentToEdit={installmentToEdit}
      />
    </div>
  );
}
