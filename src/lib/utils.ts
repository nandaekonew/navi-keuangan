import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah
 * e.g. 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return 'Rp 0';
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Clean numeric string to number
 */
export function parseRupiahInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Format date to Indonesian standard
 */
export function formatDateIndo(dateStr: string | Date): string {
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

/**
 * Generate 6-8 digit random invite code
 */
export function generateInviteCode(): string {
  const prefix = 'NAVI';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

/**
 * Calculate budget status & color
 */
export function getBudgetProgressInfo(spent: number, target: number) {
  if (target <= 0) {
    return {
      percentage: 0,
      status: 'unlimited',
      color: 'bg-slate-200 dark:bg-slate-700',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      textColor: 'text-slate-600 dark:text-slate-400',
      label: 'Tanpa Limit',
    };
  }

  const percentage = Math.round((spent / target) * 100);

  if (percentage >= 100) {
    return {
      percentage,
      status: 'overbudget',
      color: 'bg-red-500',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      textColor: 'text-red-600',
      label: 'Overbudget',
    };
  } else if (percentage >= 80) {
    return {
      percentage,
      status: 'warning',
      color: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      textColor: 'text-amber-600',
      label: 'Waspada (80%+)',
    };
  } else {
    return {
      percentage,
      status: 'safe',
      color: 'bg-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      textColor: 'text-emerald-600',
      label: 'Aman',
    };
  }
}

/**
 * Export transactions to CSV (Excel UTF-8 compatible)
 */
export function exportTransactionsToCSV(transactions: Transaction[], filename = 'rekap_transaksi_navi.csv') {
  const headers = [
    'Tanggal',
    'Tipe',
    'Nominal (Rp)',
    'Kategori',
    'Rekening',
    'Rekening Tujuan',
    'Dibuat Oleh',
    'Peran',
    'Catatan / Keterangan',
  ];

  const rows = transactions.map((t) => [
    t.transaction_date,
    t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer Antar Rekening',
    t.amount,
    t.category_name || '-',
    t.account_name || '-',
    t.destination_account_name || '-',
    t.user_name || '-',
    t.user_persona === 'suami' ? 'Suami' : t.user_persona === 'istri' ? 'Istri' : 'Member',
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
