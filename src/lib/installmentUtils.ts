import { Installment, CalculatedInstallment, InstallmentStatus } from '@/types';
import { formatRupiah } from './utils';

/**
 * Menghitung sisa tenor, sisa tagihan, dan status cicilan secara dinamis
 * berdasarkan tanggal/bulan berjalan.
 */
export function calculateInstallment(
  inst: Installment,
  refDate: Date = new Date()
): CalculatedInstallment {
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-indexed (0 = Jan, 10 = Nov)
  const currentPeriod = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Parse tanggal_mulai (mendukung YYYY-MM-DD, YYYY-MM, atau MM/YYYY)
  let startYear = currentYear;
  let startMonth = currentMonth;

  if (inst.tanggal_mulai) {
    if (inst.tanggal_mulai.includes('/')) {
      const parts = inst.tanggal_mulai.split('/');
      if (parts.length === 2) {
        startMonth = parseInt(parts[0], 10) - 1;
        startYear = parseInt(parts[1], 10);
      }
    } else {
      const parts = inst.tanggal_mulai.split('-');
      if (parts.length >= 2) {
        startYear = parseInt(parts[0], 10);
        startMonth = parseInt(parts[1], 10) - 1;
      }
    }
  }

  // 1. Bulan Terlampaui (Elapsed Months)
  // Hitung selisih bulan antara tanggal_mulai dan tanggal_sekarang (sebelum bulan berjalan ini)
  const diffMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  const elapsedMonths = Math.max(0, diffMonths);

  // Status pembayaran bulan ini:
  // bernilai true jika flag aktif ATAU last_paid_period cocok dengan periode bulan berjalan
  const isPaidThisMonth = Boolean(
    inst.status_pembayaran_bulan_ini || (inst.last_paid_period === currentPeriod)
  );

  // Bulan yang sudah dibayar:
  // - elapsedMonths
  // - Jika status_pembayaran_bulan_ini = true, tambahkan 1 ke hitungan bulan yang sudah dibayar.
  // Dibatasi maksimal sejumlah tenor_bulan
  const bulan_yang_dibayar = Math.min(
    inst.tenor_bulan,
    Math.max(0, elapsedMonths + (isPaidThisMonth ? 1 : 0))
  );

  // 2. Sisa Tenor & Sisa Tagihan
  // Sisa Tenor = tenor_bulan - bulan_yang_sudah_dibayar
  const sisa_tenor = Math.max(0, inst.tenor_bulan - bulan_yang_dibayar);

  // Sisa Tagihan = Sisa Tenor * nominal_per_bulan
  const sisa_tagihan = sisa_tenor * inst.nominal_per_bulan;

  // Total yang sudah dibayar
  const total_sudah_dibayar = bulan_yang_dibayar * inst.nominal_per_bulan;

  // Persentase kelunasan
  const persentase_selesai = inst.tenor_bulan > 0
    ? Math.min(100, Math.round((bulan_yang_dibayar / inst.tenor_bulan) * 100))
    : 100;

  // 3. Status & Visibilitas (Auto-Hide)
  // Jika Sisa Tenor <= 0 ATAU Sisa Tagihan <= 0: "LUNAS", sebaliknya "ACTIVE"
  const isPaidOff = sisa_tenor <= 0 || sisa_tagihan <= 0;
  const status: InstallmentStatus = isPaidOff ? 'LUNAS' : 'ACTIVE';

  // Tampilkan di dashboard utama jika status ACTIVE
  const tampilkan_di_dashboard = status === 'ACTIVE';

  // Tanggal estimasi lunas
  const finishDate = new Date(startYear, startMonth + inst.tenor_bulan - 1, 1);
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const tanggal_estimasi_lunas = `${monthNames[finishDate.getMonth()]} ${finishDate.getFullYear()}`;

  return {
    ...inst,
    status_pembayaran_bulan_ini: isPaidThisMonth,
    bulan_yang_dibayar,
    sisa_tenor,
    sisa_tagihan,
    total_sudah_dibayar,
    persentase_selesai,
    status,
    tampilkan_di_dashboard,
    tanggal_estimasi_lunas,
  };
}

/**
 * Format output dalam format JSON terstruktur sesuai spesifikasi
 */
export function formatInstallmentJSON(calc: CalculatedInstallment) {
  return {
    nama_cicilan: calc.nama_cicilan,
    cicilan_ke: `${calc.bulan_yang_dibayar} dari ${calc.tenor_bulan}`,
    nominal_bulanan: calc.nominal_per_bulan,
    sisa_tenor: `${calc.sisa_tenor} bulan lagi`,
    total_sisa_hutang: calc.sisa_tagihan,
    status: calc.status,
    tampilkan_di_dashboard_utama: calc.tampilkan_di_dashboard,
  };
}

/**
 * Format output dalam ringkasan teks terstruktur
 */
export function formatInstallmentStructuredText(calc: CalculatedInstallment): string {
  return [
    `- Nama Cicilan: ${calc.nama_cicilan}`,
    `- Cicilan Ke-: ${calc.bulan_yang_dibayar} dari ${calc.tenor_bulan}`,
    `- Nominal Bulanan: ${formatRupiah(calc.nominal_per_bulan)}`,
    `- Sisa Tenor: ${calc.sisa_tenor} bulan lagi`,
    `- Total Sisa Hutang: ${formatRupiah(calc.sisa_tagihan)}`,
    `- Status: ${calc.status}`,
    `- Tampilkan di Dashboard Utama: ${calc.tampilkan_di_dashboard ? 'true' : 'false'}`,
  ].join('\n');
}
