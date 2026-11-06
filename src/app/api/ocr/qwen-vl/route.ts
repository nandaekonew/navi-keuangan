import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface QwenVLRequest {
  image: string; // base64 data url (data:image/jpeg;base64,...)
  apiKey?: string;
  provider?: 'openrouter' | 'siliconflow' | 'dashscope' | 'huggingface' | 'custom';
  customEndpoint?: string;
  model?: string;
}

const SYSTEM_PROMPT = `Anda adalah asisten AI Vision tercanggih yang ditenagai oleh model Qwen2-VL (repositori GitHub: QwenLM/Qwen2-VL) khusus untuk membaca, mengekstrak, dan menganalisis struk belanja / nota pembayaran di Indonesia.

Tugas Anda adalah membaca gambar struk nota yang diberikan dengan sangat teliti dan mengekstrak data keuangan dalam format JSON valid tanpa teks markdown pembuka/penutup tambahan di luar JSON.

Format JSON yang WAJIB dihasilkan:
{
  "merchant": "Nama toko/merchant (contoh: Indomaret, Alfamart, SPBU Pertamina, Tokopedia, Apotek Kimia Farma, dll)",
  "date": "Tanggal transaksi format YYYY-MM-DD jika ditemukan (contoh: 2026-11-06)",
  "total_amount": 75480,
  "subtotal_amount": 68000,
  "tax_amount": 7480,
  "category": "Salah satu dari: Belanja Dapur & Makan | Operasional Rumah & Utilitas | Transportasi & Bensin | Tagihan Rutin & Internet | Kesehatan & Obat | Kebutuhan Pribadi Suami | Kebutuhan Pribadi Istri | Sedekah & Zakat",
  "items": [
    { "name": "Nama Produk/Barang", "qty": 1, "price": 34500 }
  ],
  "confidence": 95,
  "notes": "Rangkuman singkat nota"
}

Peraturan Penting:
1. "total_amount" HARUS berupa angka murni integer positif tanpa simbol Rp atau titik ribuan (misal: 75480).
2. Bedakan antara TOTAL / GRAND TOTAL / TOTAL BAYAR dengan nominal TUNAI (uang yang dibayarkan) atau KEMBALIAN (change). Utamakan total tagihan sebenarnya.
3. Jika nominal tidak terbaca jelas sama sekali, isi total_amount dengan null.
4. Jangan menambahkan teks pengantar seperti "Berikut adalah hasil analisis...". Berikan HANYA JSON.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QwenVLRequest;
    const { image, provider = 'openrouter', customEndpoint, model } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Gambar nota diperlukan.' },
        { status: 400 }
      );
    }

    // Resolusi API Key & Endpoint
    const apiKey =
      body.apiKey ||
      process.env.QWEN_VL_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.SILICONFLOW_API_KEY ||
      process.env.DASHSCOPE_API_KEY ||
      process.env.HUGGINGFACE_API_KEY;

    let targetUrl = '';
    let selectedModel = model;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider === 'custom' && customEndpoint) {
      targetUrl = customEndpoint.endsWith('/chat/completions')
        ? customEndpoint
        : `${customEndpoint.replace(/\/$/, '')}/chat/completions`;
      selectedModel = model || 'Qwen/Qwen2-VL-7B-Instruct';
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    } else if (provider === 'siliconflow') {
      targetUrl = 'https://api.siliconflow.cn/v1/chat/completions';
      selectedModel = model || 'Qwen/Qwen2-VL-7B-Instruct';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'dashscope') {
      targetUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
      selectedModel = model || 'qwen2-vl-7b-instruct';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      // Default: OpenRouter (Menyediakan akses mudah ke Qwen2-VL)
      targetUrl = 'https://openrouter.ai/api/v1/chat/completions';
      selectedModel = model || 'qwen/qwen-2-vl-7b-instruct';
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = 'https://navi-keuangan.vercel.app';
        headers['X-Title'] = 'Navi Keuangan Qwen2-VL Receipt OCR';
      }
    }

    // Jika tidak ada API key yang terkonfigurasi untuk provider berbayar/autentikasi
    if (!apiKey && provider !== 'custom') {
      return NextResponse.json(
        {
          success: false,
          error: 'CONFIG_REQUIRED',
          message:
            'API Key untuk Qwen2-VL belum diatur. Anda dapat memasukkan API Key di menu Pengaturan (OpenRouter, SiliconFlow, atau DashScope), atau menggunakan Tesseract Offline.',
        },
        { status: 400 }
      );
    }

    // Payload OpenAI Vision Compatible untuk Qwen2-VL
    const payload = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identifikasi nominal total belanja, tanggal, rincian barang, dan nama toko dari foto nota ini:',
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Qwen2-VL API Error Response:', errText);
      return NextResponse.json(
        {
          success: false,
          error: 'UPSTREAM_API_ERROR',
          message: `Gagal memanggil endpoint Qwen2-VL (${response.status}): ${errText.slice(0, 200)}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Bersihkan pembungkus markdown ```json ... ``` jika model mengembalikannya
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    }

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(cleanJson);
    } catch {
      // Coba temukan substring JSON di dalam respons jika ada teks pembuka
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Format balasan Qwen2-VL bukan JSON yang valid');
      }
    }

    // Bangun daftar kandidat nominal
    const candidateAmounts: any[] = [];
    if (parsedResult.total_amount) {
      candidateAmounts.push({
        label: 'Total Belanja (Qwen2-VL)',
        amount: Number(parsedResult.total_amount),
        rawText: `Total: Rp ${Number(parsedResult.total_amount).toLocaleString('id-ID')}`,
        confidenceScore: 99,
      });
    }
    if (parsedResult.subtotal_amount && parsedResult.subtotal_amount !== parsedResult.total_amount) {
      candidateAmounts.push({
        label: 'Subtotal',
        amount: Number(parsedResult.subtotal_amount),
        rawText: `Subtotal: Rp ${Number(parsedResult.subtotal_amount).toLocaleString('id-ID')}`,
        confidenceScore: 85,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'QwenLM/Qwen2-VL',
      model: selectedModel,
      data: {
        totalAmount: parsedResult.total_amount ? Number(parsedResult.total_amount) : null,
        candidateAmounts,
        detectedMerchant: parsedResult.merchant || null,
        detectedDate: parsedResult.date || null,
        suggestedCategoryKeyword: parsedResult.category || null,
        items: parsedResult.items || [],
        notes: parsedResult.notes || null,
        rawText: rawContent,
        confidence: parsedResult.confidence || 95,
      },
    });
  } catch (error: any) {
    console.error('Qwen2-VL OCR Handler Exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: error.message || 'Terjadi kesalahan saat memproses gambar dengan Qwen2-VL.',
      },
      { status: 500 }
    );
  }
}
