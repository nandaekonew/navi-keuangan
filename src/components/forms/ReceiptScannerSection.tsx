'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Tag,
  Calendar,
} from 'lucide-react';
import {
  scanReceipt,
  ReceiptScanResult,
  CandidateAmount,
} from '@/lib/receiptScanner';
import { formatRupiah } from '@/lib/utils';

interface ReceiptScannerSectionProps {
  receiptPreview: string | null;
  onScanSuccess: (data: {
    amount: number | null;
    merchant: string | null;
    date: string | null;
    categoryKeyword: string | null;
    candidateAmounts: CandidateAmount[];
  }, imageDataUrl: string) => void;
  onImageClear: () => void;
  onSelectCandidateAmount?: (amount: number) => void;
}

export function ReceiptScannerSection({
  receiptPreview,
  onScanSuccess,
  onImageClear,
  onSelectCandidateAmount,
}: ReceiptScannerSectionProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    setErrorMessage(null);
    setIsScanning(true);
    setScanProgress(5);
    setScanStatus('Mempersiapkan gambar...');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      try {
        const result = await scanReceipt(dataUrl, (pct, statusText) => {
          setScanProgress(pct);
          setScanStatus(statusText);
        });

        setScanResult(result);
        setIsScanning(false);

        // Berikan data ke parent modal
        onScanSuccess(
          {
            amount: result.totalAmount,
            merchant: result.detectedMerchant,
            date: result.detectedDate,
            categoryKeyword: result.suggestedCategoryKeyword,
            candidateAmounts: result.candidateAmounts,
          },
          dataUrl
        );

        if (!result.totalAmount) {
          setErrorMessage('Nominal total tidak terdeteksi otomatis. Silakan periksa atau masukkan nominal manual.');
        }
      } catch (err) {
        console.error('OCR Error:', err);
        setIsScanning(false);
        setErrorMessage('Gagal memproses struk otomatis. Silakan masukkan nominal manual.');
        // Tetap simpan foto struk sebagai lampiran bukti
        onScanSuccess(
          {
            amount: null,
            merchant: null,
            date: null,
            categoryKeyword: null,
            candidateAmounts: [],
          },
          dataUrl
        );
      }
    };

    reader.onerror = () => {
      setIsScanning(false);
      setErrorMessage('Gagal membaca berkas gambar.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset target value agar bisa trigger jika file yang sama dipilih lagi
    e.target.value = '';
  };

  const handleClear = () => {
    setScanResult(null);
    setErrorMessage(null);
    setIsScanning(false);
    onImageClear();
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Scan Nota / Struk Otomatis (OCR)</span>
        </label>
        <span className="text-[11px] text-slate-400">
          Deteksi nominal otomatis
        </span>
      </div>

      {/* Jika belum ada foto struk */}
      {!receiptPreview && !isScanning && (
        <div className="grid grid-cols-2 gap-2">
          {/* Tombol Buka Kamera Langsung (Khusus HP / Device berkamera) */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Ambil Foto Nota</span>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Tombol Pilih dari Galeri / File Manager */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 shrink-0 text-slate-500" />
            <span className="truncate">Pilih dari Galeri</span>
          </button>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Indikator Loading Saat Scan Berjalan */}
      {isScanning && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{scanStatus}</span>
            </div>
            <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
              {scanProgress}%
            </span>
          </div>

          {/* Progress Bar Animasi */}
          <div className="w-full bg-emerald-100 dark:bg-emerald-900/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, scanProgress)}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
            Algoritma sedang membaca angka, kata kunci total, tanggal & nama toko pada nota Anda...
          </p>
        </div>
      )}

      {/* Tampilan Ketika Gambar Sudah Ada */}
      {receiptPreview && !isScanning && (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-start gap-3">
            {/* Thumbnail Nota */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptPreview}
                alt="Foto Struk Nota"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClear}
                title="Hapus foto struk"
                aria-label="Hapus foto struk"
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Status dan Informasi Hasil Scan */}
            <div className="flex-1 min-w-0">
              {scanResult?.totalAmount ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Nominal Berhasil Terdeteksi!</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {formatRupiah(scanResult.totalAmount)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    {scanResult.detectedMerchant && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Tag className="w-3 h-3 text-emerald-500" />
                        <span>{scanResult.detectedMerchant}</span>
                      </span>
                    )}
                    {scanResult.detectedDate && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{scanResult.detectedDate}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Foto Tersimpan</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {errorMessage || 'Nominal tidak terdeteksi otomatis. Silakan isi angka nominal manual pada kolom di atas.'}
                  </p>
                </div>
              )}

              {/* Tombol Ambil Ulang / Scan Ulang */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Foto Ulang</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Upload className="w-3 h-3" />
                  <span>Ganti File</span>
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Jika Ada Pilihan Kandidat Nominal Lainnya dari Nota */}
          {scanResult && scanResult.candidateAmounts.length > 1 && onSelectCandidateAmount && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Kandidat Nominal Terbaca (Klik jika ingin mengubah):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scanResult.candidateAmounts.map((cand, idx) => (
                  <button
                    key={`${cand.amount}-${idx}`}
                    type="button"
                    onClick={() => onSelectCandidateAmount(cand.amount)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 transition active:scale-95 shadow-2xs"
                  >
                    <span>{formatRupiah(cand.amount)}</span>
                    <span className="text-[10px] font-normal text-slate-400">({cand.label})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
