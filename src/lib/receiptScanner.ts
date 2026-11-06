/**
 * receiptScanner.ts
 * Utilitas OCR & parser cerdas untuk identifikasi nominal, tanggal, dan nama merchant pada nota / struk belanja.
 * Menggunakan Tesseract.js dengan prapemrosesan gambar HTML5 Canvas untuk akurasi optimal.
 */

export interface CandidateAmount {
  label: string;
  amount: number;
  rawText: string;
  confidenceScore: number;
}

export interface ReceiptScanResult {
  totalAmount: number | null;
  candidateAmounts: CandidateAmount[];
  detectedMerchant: string | null;
  detectedDate: string | null;
  suggestedCategoryKeyword: string | null;
  rawText: string;
  confidence: number;
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
          // Grayscale luminansi
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Contrast adjust
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
 * Contoh input: "TOTAL Rp 85.500,00", "75.000", "Rp.120,000", "5O.OOO" (huruf O)
 */
export function extractCleanNominal(str: string): number | null {
  if (!str) return null;

  // Ganti huruf O atau o yang sering salah dibaca OCR sebagai angka 0 jika diapit angka/titik
  let normalized = str
    .replace(/(?<=\d)[Oo](?=\d)/g, '0')
    .replace(/(?<=\d)[Oo]$/g, '0')
    .replace(/(?<=[.,])[Oo]/g, '0')
    .replace(/[Oo](?=[.,]\d)/g, '0');

  // Bersihkan karakter selain digit, titik, dan koma
  // Hapus "Rp", "RP", "IDR", dll.
  normalized = normalized.replace(/rp|idr|total|bayar|harga|subtotal|tunai|cash|kembali/gi, '');

  // Cari kelompok angka dengan pola ribuan Indonesia: e.g. 15.000, 1.250.000, 15000, 15,000
  const match = normalized.match(/(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,9}(?:[.,]\d{2})?|\d{3,9})/);
  if (!match) return null;

  let raw = match[1];

  // Jika ada desimal sen belakang (,00 atau .00) di akhir, buang desimal sen
  if (/(?:[.,]00)$/.test(raw)) {
    raw = raw.replace(/[.,]00$/, '');
  }

  // Jika ada titik pemisah ribuan (e.g. 50.000 atau 1.500.000)
  if (/\d+\.\d{3}/.test(raw)) {
    raw = raw.replace(/\./g, '').replace(/,/g, '');
  } else if (/\d+,\d{3}/.test(raw)) {
    raw = raw.replace(/,/g, '').replace(/\./g, '');
  } else {
    raw = raw.replace(/[.,]/g, '');
  }

  const num = parseInt(raw, 10);
  // Rentang nominal transaksi masuk akal: Rp 1.000 s/d Rp 1.000.000.000
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

  // 1. Pola Keyword Total
  const totalRegex = /\b(grand\s*total|total\s*bayar|total\s*belanja|total\s*harga|total\s*akhir|total\s*tagihan|tot\s*bayar|jml\s*bayar)\b/i;
  const generalTotalRegex = /\b(total|tagihan|jumlah)\b/i;
  const subtotalRegex = /\b(subtotal|sub\s*total)\b/i;
  const paymentRegex = /\b(tunai|cash|debit|qris|bca|mandiri|gopay|ovo|shopeepay)\b/i;
  const excludedKeywords = /\b(item|qty|barang|kembali|change|discount|diskon|potongan)\b/i;

  // Analisis per baris
  lines.forEach((line, index) => {
    // Lewati baris diskon / kembalian untuk nominal utama
    if (excludedKeywords.test(line)) return;

    const nominal = extractCleanNominal(line);
    if (!nominal) return;

    // Tingkat prioritas
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
      // Jika angka berada di 40% bagian bawah nota, kemungkinan besar itu total/pembayaran
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

  // Urutkan kandidat berdasarkan confidenceScore tertinggi, lalu nominal terbesar
  candidates.sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    return b.amount - a.amount;
  });

  // Hapus duplikasi nominal pada kandidat
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

  // 2. Deteksi Merchant / Nama Toko
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

  // Jika belum ada merchant chain, coba ambil 2 baris teratas yang bukan angka murni
  if (!detectedMerchant && lines.length > 0) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const candidate = lines[i].trim();
      if (candidate.length > 3 && !/^\d+$/.test(candidate) && !/tanggal|struk|nota|selamat/i.test(candidate)) {
        detectedMerchant = candidate.slice(0, 30);
        break;
      }
    }
  }

  // 3. Deteksi Tanggal Transaksi (DD/MM/YYYY atau DD-MM-YYYY atau YYYY-MM-DD)
  let detectedDate: string | null = null;
  const dateMatch = rawText.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (dateMatch) {
    let day = parseInt(dateMatch[1], 10);
    let month = parseInt(dateMatch[2], 10);
    let year = parseInt(dateMatch[3], 10);

    if (year < 100) year += 2000;

    // Jika day > 12 dan month <= 12, aman format DD/MM/YYYY
    // Jika terbalik (misal format MM/DD), kita batasi rentang valid
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
  };
}

/**
 * Fungsi utama scan nota:
 * Menerima file atau DataURL gambar -> Prapemrosesan Canvas -> Eksekusi Tesseract OCR -> Parsing Cerdas
 */
export async function scanReceipt(
  imageDataUrl: string,
  onProgress?: (progressPct: number, statusText: string) => void
): Promise<ReceiptScanResult> {
  // 1. Prapemrosesan
  onProgress?.(10, 'Mengoptimalkan kualitas gambar nota...');
  const optimizedDataUrl = await preprocessReceiptImage(imageDataUrl);

  // 2. Inisialisasi Tesseract.js secara dinamis
  onProgress?.(25, 'Memuat modul OCR cerdas...');
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
