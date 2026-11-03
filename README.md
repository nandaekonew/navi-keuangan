# 📱 Aplikasi Management Keuangan Navi (Navi Keuangan)

Aplikasi manajemen keuangan keluarga modern dengan pendekatan **Multi-Tenant Household**, dirancang khusus untuk sinkronisasi real-time multi-user antara **HP Suami** dan **HP Istri**.

---

## 🚀 Arsitektur & Tech Stack

| Layer | Teknologi | Peran & Alasan |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router)** | Server-side rendering cepat, SEO & PWA ready, routing bersih |
| **Styling & UI** | **Tailwind CSS + Shadcn UI** | Modular, support Dark Mode, desain clean & profesional |
| **Typography** | **Inter** | Kejelasan tinggi untuk angka finansial (Rupiah) & tabel data |
| **Backend & Database** | **Supabase (PostgreSQL)** | Auth bawaan, database relasional kuat, real-time sync, Row Level Security (RLS) |
| **State & Data Fetching** | **Zustand + React Query** | Caching data transaksi & manajemen state lokal yang presisi serta offline fallback |
| **Chart / Analytics** | **Recharts** | Visualisasi arus kas, rasio pengeluaran per kategori, dan tren bulanan |

---

## 🌟 Modul & Fitur Utama

1. **Workspace Bersama (Multi-User Household Sync)**
   - Setiap rumah tangga memiliki workspace terisolasi dengan **Kode Undangan (Invite Code)** unik.
   - Suami & Istri dapat mengakses dari HP masing-masing.
   - Setiap transaksi mencantumkan atribusi pembuat (`Dibuat oleh: Nanda (Suami) 👨💼` atau `Dina (Istri) 👩💼`).

2. **Management Akun & Dompet (Accounts)**
   - Pemisahan kas: Rekening Utama (Gaji BCA/Mandiri), E-Wallet (GoPay, OVO), Kas Dompet Tunai, Pos Dana Darurat, dan Pos Tabungan Anak.
   - **Fitur Transfer Antar-Rekening**: Memindahkan dana antar-akun tanpa dihitung sebagai pengeluaran atau pemasukan baru (saldo tetap seimbang).

3. **Pencatatan Cepat (Quick-Entry Transaction < 5 Detik)**
   - Input nominal serba cepat dengan format Rupiah otomatis & tombol preset (+10rb, +20rb, +50rb, +100rb, +500rb).
   - Pemilihan instan rekening sumber & kategori pengeluaran/pemasukan.
   - Dukungan foto bukti struk / receipt transfer.

4. **Pos Alokasi & Budget Guard**
   - Penetapan limit anggaran bulanan per kategori.
   - Indikator progres visual:
     - 🟢 **Hijau**: Aman (< 80%)
     - 🟡 **Kuning**: Waspada (80% - 100%)
     - 🔴 **Merah**: Overbudget (> 100%)

5. **Checklist Tagihan Rutin (Recurring Bills)**
   - Daftar kewajiban bulanan (Listrik PLN, WiFi Biznet/Indihome, BPJS Kesehatan, Air PDAM, SPP Sekolah).
   - Fitur 1-klik **Bayar Sekarang**: otomatis memotong saldo rekening yang dipilih dan mencatat transaksi pengeluaran.

6. **Rekap, Analytics & Export Excel**
   - Grafik interaktif Donut Rasio Pengeluaran per Kategori.
   - Grafik perbandingan kontribusi Suami vs Istri.
   - Grafik tren Arus Kas bulanan.
   - **Export data transaksi ke format CSV / Excel** yang kompatibel dengan Microsoft Excel.

---

## ⚙️ Petunjuk Setup & Menjalankan Aplikasi

### 1. Jalankan di Lingkungan Lokal

```bash
# Pastikan dependensi sudah terpasang
npm install

# Jalankan server development Next.js
npm run dev
```

Buka browser Anda di `http://localhost:3000`.

### 2. Konfigurasi Database Supabase (Opsional)

Aplikasi sudah dilengkapi dengan mode offline / local storage bawaan sehingga langsung dapat digunakan dan didemokan tanpa Supabase sekalipun. Namun untuk sinkronisasi cloud real-time antar perangkat HP yang berbeda, lakukan langkah berikut:

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** pada dashboard Supabase Anda.
3. Buka file `supabase/schema.sql` pada repository ini, salin seluruh isinya, dan jalankan (Run) di SQL Editor Supabase.
4. Buka **Project Settings** > **API**, salin `URL` dan `anon / public` key.
5. Buat file `.env.local` di folder root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

6. Restart server development: `npm run dev`.

---

## 📱 Cara Menggunakan di HP Suami & Istri

1. Buka aplikasi di HP pertama (misal: HP Suami).
2. Lihat **Kode Undangan** pada bagian atas layar atau menu Pengaturan (contoh: `NAVI-7821`).
3. Buka browser di HP kedua (HP Istri), pilih **Gabung HP Pasangan**, masukkan kode `NAVI-7821` dan pilih peran **Istri 👩💼**.
4. Selesai! Seluruh data rekening, transaksi, pos anggaran, dan tagihan rutin akan langsung terhubung satu sama lain.
