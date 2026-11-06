/**
 * receiptScanner.ts
 * Utilitas OCR & Vision AI untuk identifikasi nominal, tanggal, dan nama merchant pada nota / struk belanja.
 * Mendukung dual-engine:
 * 1. Qwen2-VL Vision AI (Alibaba Cloud / github.com/QwenLM/Qwen2-VL) untuk akurasi multimodal tertinggi
 * 2. Tesseract.js (Client-side offline fallback) dengan prapemrosesan HTML5 Canvas
 */

export interface CandidateAmount {
  label: string;
  amount: number;
  rawText: string;
  confidenceScore: number;
}

export interface ReceiptItem {
  name: string;
  qty?: number;
  price?: number;
}

export interface ReceiptScanResult {
  totalAmount: number | null;
  candidateAmounts: CandidateAmount[];
  detectedMerchant: string | null;
  detectedDate: string | null;
  suggestedCategoryKeyword: string | null;
  items?: ReceiptItem[];
  notes?: string | null;
  rawText: string;
  confidence: number;
  engineUsed: 'qwen-vl' | 'tesseract';
}

export interface QwenVLConfig {
  apiKey?: string;
  provider: 'openrouter' | 'siliconflow' | 'dashscope' | 'huggingface' | 'custom';
  customEndpoint?: string;
  model?: string;
  enabled: boolean;
}

const STORAGE_KEY_QWEN = 'navi_qwen_vl_config';

export function getQwenVLConfig(): QwenVLConfig {
  if (typeof window === 'undefined') {
    return {
      provider: 'openrouter',
      model: 'qwen/qwen-2-vl-7b-instruct',
      enabled: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_QWEN);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read Qwen2-VL config:', e);
  }

  return {
    provider: 'openrouter',
    model: 'qwen/qwen-2-vl-7b-instruct',
    enabled: true,
  };
}

export function saveQwenVLConfig(config: QwenVLConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_QWEN, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Qwen2-VL config:', e);
  }
}

/**
 * Prapemrosesan gambar menggunakan Canvas (client-side):
 * - Memperkecil resolusi jika terlalu masif (maks 1500px) untuk kecepatan scan tinggi
 * - Mengubah ke grayscale & meningkatkan kontras agar tulisan struk thermal yang pudar terbaca tajam
 */
export async function preprocessReceiptImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 1500;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve(dataUrl);
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Tingkatkan kontras grayscale untuk kertas struk belanja
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const contrast = 1.25; // Tingkatkan kontras 25%
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const adjusted = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }
        ctx.putImageData(imageData, 0, 0);
      } catch {
        // Fallback jika getImageData dibatasi
      }

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Membersihkan string angka nominal khas struk Indonesia
 */
export function extractCleanNominal(str: string): number | null {
  if (!str) return null;

  let normalized = str
    .replace(/(?<=\d)[Oo](?=\d)/g, '0')
    .replace(/(?<=\d)[Oo]$/g, '0')
    .replace(/(?<=[.,])[Oo]/g, '0')
    .replace(/[Oo](?=[.,]\d)/g, '0');

  normalized = normalized.replace(/rp|idr|total|bayar|harga|subtotal|tunai|cash|kembali/gi, '');

  const match = normalized.match(/(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,9}(?:[.,]\d{2})?|\d{3,9})/);
  if (!match) return null;

  let raw = match[1];

  if (/(?:[.,]00)$/.test(raw)) {
    raw = raw.replace(/[.,]00$/, '');
  }

  if (/\d+\.\d{3}/.test(raw)) {
    raw = raw.replace(/\./g, '').replace(/,/g, '');
  } else if (/\d+,\d{3}/.test(raw)) {
    raw = raw.replace(/,/g, '').replace(/\./g, '');
  } else {
    raw = raw.replace(/[.,]/g, '');
  }

  const num = parseInt(raw, 10);
  if (!isNaN(num) && num >= 500 && num <= 1000000000) {
    return num;
  }

  return null;
}

/**
 * Parsing teks hasil OCR untuk mengekstrak Nominal Utama, Kandidat Nominal, Tanggal, dan Merchant
 */
export function parseReceiptText(rawText: string, ocrConfidence = 80): ReceiptScanResult {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates: CandidateAmount[] = [];

  const totalRegex = /\b(grand\s*total|total\s*bayar|total\s*belanja|total\s*harga|total\s*akhir|total\s*tagihan|tot\s*bayar|jml\s*bayar)\b/i;
  const generalTotalRegex = /\b(total|tagihan|jumlah)\b/i;
  const subtotalRegex = /\b(subtotal|sub\s*total)\b/i;
  const paymentRegex = /\b(tunai|cash|debit|qris|bca|mandiri|gopay|ovo|shopeepay)\b/i;
  const excludedKeywords = /\b(item|qty|barang|kembali|change|discount|diskon|potongan)\b/i;

  lines.forEach((line, index) => {
    if (excludedKeywords.test(line)) return;

    const nominal = extractCleanNominal(line);
    if (!nominal) return;

    if (totalRegex.test(line)) {
      candidates.push({
        label: 'Total Belanja',
        amount: nominal,
        rawText: line,
        confidenceScore: 95,
      });
    } else if (generalTotalRegex.test(line)) {
      candidates.push({
        label: 'Total',
        amount: nominal,
        rawText: line,
        confidenceScore: 85,
      });
    } else if (subtotalRegex.test(line)) {
      candidates.push({
        label: 'Subtotal',
        amount: nominal,
        rawText: line,
        confidenceScore: 75,
      });
    } else if (paymentRegex.test(line)) {
      candidates.push({
        label: 'Pembayaran',
        amount: nominal,
        rawText: line,
        confidenceScore: 70,
      });
    } else {
      const isBottomHalf = index >= Math.floor(lines.length * 0.5);
      if (isBottomHalf && nominal >= 2000) {
        candidates.push({
          label: 'Nominal Struk',
          amount: nominal,
          rawText: line,
          confidenceScore: 50,
        });
      }
    }
  });

  candidates.sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    return b.amount - a.amount;
  });

  const uniqueCandidates: CandidateAmount[] = [];
  const seenAmounts = new Set<number>();
  for (const c of candidates) {
    if (!seenAmounts.has(c.amount)) {
      seenAmounts.add(c.amount);
      uniqueCandidates.push(c);
    }
  }

  const bestCandidate = uniqueCandidates[0] || null;
  const totalAmount = bestCandidate ? bestCandidate.amount : null;

  let detectedMerchant: string | null = null;
  let suggestedCategoryKeyword: string | null = null;

  const merchantRules: { pattern: RegExp; name: string; category: string }[] = [
    { pattern: /\b(indomaret|indomart)\b/i, name: 'Indomaret', category: 'Belanja Dapur & Makan' },
    { pattern: /\b(alfamart|alfamidi|alfa)\b/i, name: 'Alfamart', category: 'Belanja Dapur & Makan' },
    { pattern: /\b(superindo|super\s*indo)\b/i, name: 'Super Indo', category: 'Belanja Dapur & Makan' },
    { pattern: /\b(hypermart|transmart|lotte|hero)\b/i, name: 'Supermarket', category: 'Belanja Dapur & Makan' },
    { pattern: /\b(spbu|pertamina|shell|bp-akr)\b/i, name: 'SPBU Pertamina', category: 'Transportasi & Bensin' },
    { pattern: /\b(starbucks|kopi\s*kenangan|janji\s*jiwa|point\s*coffee|fore\s*coffee)\b/i, name: 'Coffee Shop', category: 'Belanja Dapur & Makan' },
    { pattern: /\b(mcdonald|mcd|kfc|hokben|a&w|burger\s*king|pizza\s*hut|solaria|richeese)\b/i, name: 'Restoran / Fast Food', category: 'Belanja Dapur & Makan' },
    { pattern: /\b(apotek|kimia\s*farma|century|guardian|watsons|k-24)\b/i, name: 'Apotek', category: 'Kesehatan & Obat' },
    { pattern: /\b(pln|token\s*listrik)\b/i, name: 'PLN Listrik', category: 'Operasional Rumah & Utilitas' },
    { pattern: /\b(indihome|telkom|myrepublic|biznet|first\s*media)\b/i, name: 'Internet Rumah', category: 'Tagihan Rutin & Internet' },
    { pattern: /\b(shopee|tokopedia|lazada|tiktok\s*shop)\b/i, name: 'Marketplace Online', category: 'Belanja Dapur & Makan' },
  ];

  for (const rule of merchantRules) {
    if (rule.pattern.test(rawText)) {
      detectedMerchant = rule.name;
      suggestedCategoryKeyword = rule.category;
      break;
    }
  }

  if (!detectedMerchant && lines.length > 0) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const candidate = lines[i].trim();
      if (candidate.length > 3 && !/^\d+$/.test(candidate) && !/tanggal|struk|nota|selamat/i.test(candidate)) {
        detectedMerchant = candidate.slice(0, 30);
        break;
      }
    }
  }

  let detectedDate: string | null = null;
  const dateMatch = rawText.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (dateMatch) {
    let day = parseInt(dateMatch[1], 10);
    let month = parseInt(dateMatch[2], 10);
    let year = parseInt(dateMatch[3], 10);

    if (year < 100) year += 2000;

    if (day <= 31 && month <= 12 && year >= 2020 && year <= 2030) {
      detectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return {
    totalAmount,
    candidateAmounts: uniqueCandidates.slice(0, 4),
    detectedMerchant,
    detectedDate,
    suggestedCategoryKeyword,
    rawText,
    confidence: ocrConfidence,
    engineUsed: 'tesseract',
  };
}

/**
 * 1. SCAN DENGAN Qwen2-VL Vision AI (Alibaba Cloud / QwenLM/Qwen2-VL)
 * Mengirim gambar ke endpoint API internal yang terhubung ke model Qwen2-VL
 */
export async function scanReceiptWithQwenVL(
  imageDataUrl: string,
  config?: Partial<QwenVLConfig>,
  onProgress?: (progressPct: number, statusText: string) => void
): Promise<ReceiptScanResult> {
  onProgress?.(15, 'Mempersiapkan gambar untuk Qwen2-VL...');
  const optimizedDataUrl = await preprocessReceiptImage(imageDataUrl);

  onProgress?.(35, 'Menghubungkan ke Vision AI Qwen2-VL (QwenLM)...');

  const resolvedConfig = { ...getQwenVLConfig(), ...config };

  const res = await fetch('/api/ocr/qwen-vl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: optimizedDataUrl,
      apiKey: resolvedConfig.apiKey,
      provider: resolvedConfig.provider,
      customEndpoint: resolvedConfig.customEndpoint,
      model: resolvedConfig.model,
    }),
  });

  onProgress?.(70, 'Qwen2-VL sedang membaca teks & struktur nota...');

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const msg = errorJson.message || `Gagal memanggil Qwen2-VL (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message || 'Gagal mengekstrak data struk dengan Qwen2-VL');
  }

  onProgress?.(100, 'Analisis Qwen2-VL selesai!');

  return {
    totalAmount: json.data.totalAmount,
    candidateAmounts: json.data.candidateAmounts || [],
    detectedMerchant: json.data.detectedMerchant,
    detectedDate: json.data.detectedDate,
    suggestedCategoryKeyword: json.data.suggestedCategoryKeyword,
    items: json.data.items || [],
    notes: json.data.notes || null,
    rawText: json.data.rawText || '',
    confidence: json.data.confidence || 98,
    engineUsed: 'qwen-vl',
  };
}

/**
 * 2. SCAN DENGAN Tesseract.js (Offline Fallback Engine)
 */
export async function scanReceiptWithTesseract(
  imageDataUrl: string,
  onProgress?: (progressPct: number, statusText: string) => void
): Promise<ReceiptScanResult> {
  onProgress?.(10, 'Mengoptimalkan kualitas gambar nota...');
  const optimizedDataUrl = await preprocessReceiptImage(imageDataUrl);

  onProgress?.(25, 'Memuat modul OCR Tesseract...');
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = Math.round(30 + (m.progress || 0) * 55);
        onProgress?.(pct, `Membaca teks nota (${Math.round((m.progress || 0) * 100)}%)...`);
      }
    },
  });

  try {
    onProgress?.(60, 'Mendeteksi tulisan dan rincian harga...');
    const result = await worker.recognize(optimizedDataUrl);
    const rawText = result.data.text || '';
    const confidence = Math.round(result.data.confidence || 75);

    onProgress?.(90, 'Menganalisis nominal total belanja...');
    const parsed = parseReceiptText(rawText, confidence);

    onProgress?.(100, 'Selesai!');
    return parsed;
  } finally {
    await worker.terminate();
  }
}

/**
 * 3. HYBRID SCANNER
 * Mencoba Qwen2-VL terlebih dahulu untuk kualitas analisis tertinggi.
 * Jika tidak ada API key atau terjadi kegagalan jaringan, otomatis fallback ke Tesseract offline!
 */
export async function scanReceipt(
  imageDataUrl: string,
  onProgress?: (progressPct: number, statusText: string) => void,
  preferredEngine: 'auto' | 'qwen-vl' | 'tesseract' = 'auto',
  config?: Partial<QwenVLConfig>
): Promise<ReceiptScanResult> {
  const currentConfig = { ...getQwenVLConfig(), ...config };

  // Jika user memilih spesifik Tesseract
  if (preferredEngine === 'tesseract') {
    return scanReceiptWithTesseract(imageDataUrl, onProgress);
  }

  // Jika user memilih Qwen2-VL atau Auto
  try {
    onProgress?.(10, 'Menganalisis nota dengan Qwen2-VL Vision AI...');
    return await scanReceiptWithQwenVL(imageDataUrl, currentConfig, onProgress);
  } catch (err: any) {
    console.warn('Qwen2-VL tidak tersedia atau terjadi error, beralih ke Tesseract offline:', err?.message);

    if (preferredEngine === 'qwen-vl') {
      // Jika user secara eksplisit memilih Qwen2-VL, lemparkan error agar user tahu
      throw err;
    }

    // Auto-fallback ke Tesseract
    onProgress?.(20, 'Beralih ke pemindaian lokal Tesseract OCR...');
    return await scanReceiptWithTesseract(imageDataUrl, onProgress);
  }
}
