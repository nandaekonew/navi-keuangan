'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';
import {
  scanReceipt,
  ReceiptScanResult,
  CandidateAmount,
  getQwenVLConfig,
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
    items?: { name: string; qty?: number; price?: number }[];
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
  const [selectedEngine, setSelectedEngine] = useState<'auto' | 'qwen-vl' | 'tesseract'>('auto');

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
        const result = await scanReceipt(
          dataUrl,
          (pct, statusText) => {
            setScanProgress(pct);
            setScanStatus(statusText);
          },
          selectedEngine
        );

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
            items: result.items,
          },
          dataUrl
        );

        if (!result.totalAmount) {
          setErrorMessage('Nominal total tidak terdeteksi otomatis. Silakan periksa atau masukkan nominal manual.');
        }
      } catch (err: any) {
        console.error('OCR / Qwen2-VL Error:', err);
        setIsScanning(false);
        setErrorMessage(
          err?.message || 'Gagal memproses struk otomatis. Silakan masukkan nominal manual.'
        );
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
      {/* Header Bagian Scan dengan Referensi Qwen2-VL */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Scan Nota Otomatis (Vision AI)
          </label>
        </div>

        {/* Link Referensi GitHub Repository QwenLM/Qwen2-VL */}
        <a
          href="https://github.com/QwenLM/Qwen2-VL"
          target="_blank"
          rel="noreferrer"
          title="Buka repositori resmi GitHub QwenLM/Qwen2-VL"
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800"
        >
          <Bot className="w-3 h-3 text-emerald-600" />
          <span>QwenLM/Qwen2-VL</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>
      </div>

      {/* Pilihan Engine AI (Qwen2-VL vs Offline) */}
      <div className="flex items-center justify-between text-[11px] bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl">
        <span className="text-slate-500 font-semibold px-2">Mesin Analisis:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedEngine('auto')}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition text-[11px] ${
              selectedEngine === 'auto'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Qwen2-VL (Smart)
          </button>
          <button
            type="button"
            onClick={() => setSelectedEngine('tesseract')}
            className={`px-2 py-0.5 rounded-lg font-bold transition text-[11px] ${
              selectedEngine === 'tesseract'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tesseract (Offline)
          </button>
        </div>
      </div>

      {/* Jika belum ada foto struk */}
      {!receiptPreview && !isScanning && (
        <div className="grid grid-cols-2 gap-2">
          {/* Tombol Kamera Langsung */}
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

          {/* Tombol Pilih dari Galeri */}
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

          <div className="w-full bg-emerald-100 dark:bg-emerald-900/40 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, scanProgress)}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
            {selectedEngine === 'tesseract'
              ? 'Memproses gambar secara offline dengan OCR Tesseract...'
              : 'Dianalisis menggunakan multimodal vision model Qwen2-VL dari repositori QwenLM/Qwen2-VL...'}
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
                  <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
                    <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Nominal Terdeteksi</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {scanResult.engineUsed === 'qwen-vl' ? 'Qwen2-VL AI' : 'Tesseract OCR'}
                    </span>
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

          {/* Rincian Item dari Qwen2-VL jika ada */}
          {scanResult?.items && scanResult.items.length > 0 && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Item Belanja Terbaca oleh Qwen2-VL ({scanResult.items.length}):
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-xs">
                {scanResult.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="truncate max-w-[180px]">
                      {it.qty ? `${it.qty}x ` : ''}{it.name}
                    </span>
                    {it.price ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatRupiah(it.price)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pilihan Kandidat Nominal Lainnya */}
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
