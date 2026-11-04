export type UserPersona = 'suami' | 'istri' | 'lainnya';
export type UserRole = 'admin' | 'member';

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  household_id: string;
  full_name: string;
  role: UserRole;
  persona: UserPersona;
  avatar_url?: string;
  created_at?: string;
}

export type AccountType = 'bank' | 'ewallet' | 'cash' | 'investment' | 'savings';

export interface Account {
  id: string;
  household_id: string;
  name: string;
  type: AccountType;
  account_number?: string;
  balance: number;
  color?: string;
  created_at?: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  household_id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  is_budgeted?: boolean;
  created_at?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  household_id: string;
  account_id: string;
  destination_account_id?: string | null;
  category_id?: string | null;
  user_id?: string | null;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  description?: string;
  receipt_url?: string;
  created_at?: string;
  // Computed / Joined properties
  account_name?: string;
  destination_account_name?: string;
  category_name?: string;
  user_name?: string;
  user_persona?: UserPersona;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id: string;
  target_amount: number;
  month: number;
  year: number;
  created_at?: string;
  // Computed
  spent_amount?: number;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface RecurringBill {
  id: string;
  household_id: string;
  category_id?: string | null;
  preferred_account_id?: string | null;
  name: string;
  amount: number;
  due_day: number;
  is_paid: boolean;
  last_paid_at?: string | null;
  notes?: string | null;
  created_at?: string;
}

export type InstallmentStatus = 'ACTIVE' | 'LUNAS';

export interface Installment {
  id: string;
  household_id: string;
  nama_cicilan: string;
  nominal_per_bulan: number;
  tanggal_mulai: string; // YYYY-MM-DD atau MM/YYYY
  tenor_bulan: number;
  status_pembayaran_bulan_ini: boolean;
  last_paid_period?: string | null; // e.g. "2026-11"
  preferred_account_id?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface CalculatedInstallment extends Installment {
  bulan_yang_dibayar: number;
  sisa_tenor: number;
  sisa_tagihan: number;
  total_sudah_dibayar: number;
  persentase_selesai: number;
  status: InstallmentStatus;
  tampilkan_di_dashboard: boolean;
  tanggal_estimasi_lunas: string;
}
