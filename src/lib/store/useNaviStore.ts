'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Account,
  Budget,
  Category,
  Household,
  RecurringBill,
  Installment,
  Transaction,
  UserProfile,
  UserPersona,
} from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Initial realistic default data for Keluarga Nanda
const initialHousehold: Household = {
  id: 'hh-navi-001',
  name: 'Rumah Tangga Nanda & Dina',
  invite_code: 'NAVI-7821',
  created_at: new Date().toISOString(),
};

const initialMembers: UserProfile[] = [
  {
    id: 'user-suami-01',
    household_id: 'hh-navi-001',
    full_name: 'Nanda (Suami)',
    role: 'admin',
    persona: 'suami',
    avatar_url: '',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-istri-02',
    household_id: 'hh-navi-001',
    full_name: 'Dina (Istri)',
    role: 'member',
    persona: 'istri',
    avatar_url: '',
    created_at: new Date().toISOString(),
  },
];

const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    household_id: 'hh-navi-001',
    name: 'BCA Rekening Utama (Gaji)',
    type: 'bank',
    account_number: '8820194821',
    balance: 18500000,
    color: '#2563eb',
  },
  {
    id: 'acc-2',
    household_id: 'hh-navi-001',
    name: 'Mandiri Operasional',
    type: 'bank',
    account_number: '13700192831',
    balance: 4250000,
    color: '#0284c7',
  },
  {
    id: 'acc-3',
    household_id: 'hh-navi-001',
    name: 'GoPay & OVO',
    type: 'ewallet',
    account_number: '081298765432',
    balance: 750000,
    color: '#059669',
  },
  {
    id: 'acc-4',
    household_id: 'hh-navi-001',
    name: 'Dompet Kas Tunai',
    type: 'cash',
    balance: 600000,
    color: '#d97706',
  },
  {
    id: 'acc-5',
    household_id: 'hh-navi-001',
    name: 'Pos Dana Darurat (Deposito)',
    type: 'savings',
    balance: 35000000,
    color: '#7c3aed',
  },
  {
    id: 'acc-6',
    household_id: 'hh-navi-001',
    name: 'Pos Tabungan & Sekolah Anak',
    type: 'investment',
    balance: 15000000,
    color: '#db2777',
  },
];

const initialCategories: Category[] = [
  // Pengeluaran
  { id: 'cat-exp-1', household_id: 'hh-navi-001', name: 'Belanja Dapur & Makan', type: 'expense', icon: 'Utensils', color: '#f97316', is_budgeted: true },
  { id: 'cat-exp-2', household_id: 'hh-navi-001', name: 'Operasional Rumah & Utilitas', type: 'expense', icon: 'Home', color: '#06b6d4', is_budgeted: true },
  { id: 'cat-exp-3', household_id: 'hh-navi-001', name: 'Transportasi & Bensin', type: 'expense', icon: 'Car', color: '#3b82f6', is_budgeted: true },
  { id: 'cat-exp-4', household_id: 'hh-navi-001', name: 'Tagihan Rutin & Internet', type: 'expense', icon: 'Wifi', color: '#6366f1', is_budgeted: true },
  { id: 'cat-exp-5', household_id: 'hh-navi-001', name: 'Pendidikan & Kursus Anak', type: 'expense', icon: 'GraduationCap', color: '#ec4899', is_budgeted: true },
  { id: 'cat-exp-6', household_id: 'hh-navi-001', name: 'Kesehatan & Obat', type: 'expense', icon: 'HeartPulse', color: '#ef4444', is_budgeted: true },
  { id: 'cat-exp-7', household_id: 'hh-navi-001', name: 'Kebutuhan Pribadi Suami', type: 'expense', icon: 'User', color: '#2563eb', is_budgeted: true },
  { id: 'cat-exp-8', household_id: 'hh-navi-001', name: 'Kebutuhan Pribadi Istri', type: 'expense', icon: 'Sparkles', color: '#d946ef', is_budgeted: true },
  { id: 'cat-exp-9', household_id: 'hh-navi-001', name: 'Sedekah & Zakat', type: 'expense', icon: 'HandHeart', color: '#10b981', is_budgeted: false },
  // Pemasukan
  { id: 'cat-inc-1', household_id: 'hh-navi-001', name: 'Gaji Pokok Suami', type: 'income', icon: 'Briefcase', color: '#10b981', is_budgeted: false },
  { id: 'cat-inc-2', household_id: 'hh-navi-001', name: 'Penghasilan / Bisnis Istri', type: 'income', icon: 'ShoppingBag', color: '#84cc16', is_budgeted: false },
  { id: 'cat-inc-3', household_id: 'hh-navi-001', name: 'Bonus & Insentif', type: 'income', icon: 'Coins', color: '#eab308', is_budgeted: false },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const initialBudgets: Budget[] = [
  { id: 'b-1', household_id: 'hh-navi-001', category_id: 'cat-exp-1', target_amount: 4500000, month: currentMonth, year: currentYear },
  { id: 'b-2', household_id: 'hh-navi-001', category_id: 'cat-exp-2', target_amount: 1800000, month: currentMonth, year: currentYear },
  { id: 'b-3', household_id: 'hh-navi-001', category_id: 'cat-exp-3', target_amount: 1500000, month: currentMonth, year: currentYear },
  { id: 'b-4', household_id: 'hh-navi-001', category_id: 'cat-exp-4', target_amount: 1200000, month: currentMonth, year: currentYear },
  { id: 'b-5', household_id: 'hh-navi-001', category_id: 'cat-exp-5', target_amount: 2500000, month: currentMonth, year: currentYear },
  { id: 'b-6', household_id: 'hh-navi-001', category_id: 'cat-exp-7', target_amount: 1000000, month: currentMonth, year: currentYear },
  { id: 'b-7', household_id: 'hh-navi-001', category_id: 'cat-exp-8', target_amount: 1000000, month: currentMonth, year: currentYear },
];

const todayISO = new Date().toISOString().split('T')[0];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    household_id: 'hh-navi-001',
    account_id: 'acc-1',
    category_id: 'cat-inc-1',
    user_id: 'user-suami-01',
    type: 'income',
    amount: 18000000,
    transaction_date: todayISO,
    description: 'Transfer Gaji Bulanan Nanda',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    household_id: 'hh-navi-001',
    account_id: 'acc-2',
    category_id: 'cat-inc-2',
    user_id: 'user-istri-02',
    type: 'income',
    amount: 5500000,
    transaction_date: todayISO,
    description: 'Hasil Penjualan Toko Online Dina',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    household_id: 'hh-navi-001',
    account_id: 'acc-1',
    category_id: 'cat-exp-1',
    user_id: 'user-istri-02',
    type: 'expense',
    amount: 650000,
    transaction_date: todayISO,
    description: 'Belanja Sayur, Daging & Buah Mingguan (Superindo)',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    household_id: 'hh-navi-001',
    account_id: 'acc-3',
    category_id: 'cat-exp-3',
    user_id: 'user-suami-01',
    type: 'expense',
    amount: 200000,
    transaction_date: todayISO,
    description: 'Isi Bensin Pertamax Mobil',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    household_id: 'hh-navi-001',
    account_id: 'acc-1',
    destination_account_id: 'acc-5',
    category_id: null,
    user_id: 'user-suami-01',
    type: 'transfer',
    amount: 2500000,
    transaction_date: todayISO,
    description: 'Alokasi Bulanan ke Dana Darurat',
    created_at: new Date().toISOString(),
  },
];

const initialBills: RecurringBill[] = [
  {
    id: 'bill-1',
    household_id: 'hh-navi-001',
    name: 'Listrik PLN Pasca/Token',
    category_id: 'cat-exp-2',
    preferred_account_id: 'acc-1',
    amount: 650000,
    due_day: 10,
    is_paid: false,
    notes: 'ID Pelanggan: 51293847291',
  },
  {
    id: 'bill-2',
    household_id: 'hh-navi-001',
    name: 'Internet & WiFi Biznet',
    category_id: 'cat-exp-4',
    preferred_account_id: 'acc-2',
    amount: 375000,
    due_day: 15,
    is_paid: false,
    notes: 'Kecepatan 100 Mbps',
  },
  {
    id: 'bill-3',
    household_id: 'hh-navi-001',
    name: 'BPJS Kesehatan Keluarga',
    category_id: 'cat-exp-6',
    preferred_account_id: 'acc-1',
    amount: 300000,
    due_day: 10,
    is_paid: true,
    last_paid_at: new Date().toISOString(),
    notes: 'Kelas 1 (3 Jiwa)',
  },
  {
    id: 'bill-4',
    household_id: 'hh-navi-001',
    name: 'SPP Sekolah Anak',
    category_id: 'cat-exp-5',
    preferred_account_id: 'acc-1',
    amount: 1250000,
    due_day: 5,
    is_paid: false,
    notes: 'Bulan berjalan',
  },
];

const initialInstallments: Installment[] = [
  {
    id: 'inst-1',
    household_id: 'hh-navi-001',
    nama_cicilan: 'KPR Rumah Tipe 45',
    nominal_per_bulan: 3500000,
    tanggal_mulai: '2024-01-01',
    tenor_bulan: 120,
    status_pembayaran_bulan_ini: false,
    last_paid_period: null,
    preferred_account_id: 'acc-1',
    notes: 'KPR Bank BTN Syariah',
  },
  {
    id: 'inst-2',
    household_id: 'hh-navi-001',
    nama_cicilan: 'HP Samsung S24 Ultra',
    nominal_per_bulan: 1250000,
    tanggal_mulai: '2024-03-01',
    tenor_bulan: 12,
    status_pembayaran_bulan_ini: true,
    last_paid_period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    preferred_account_id: 'acc-2',
    notes: 'Cicilan 0% Gadget',
  },
];

interface NaviStoreState {
  household: Household;
  currentUser: UserProfile;
  members: UserProfile[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  installments: Installment[];
  
  // UI States
  isQuickInputOpen: boolean;
  isTransferOpen: boolean;
  isSupabaseActive: boolean;

  // Actions
  setQuickInputOpen: (open: boolean) => void;
  setTransferOpen: (open: boolean) => void;
  switchPersona: (persona: UserPersona) => void;
  setCurrentUser: (user: UserProfile) => void;
  setHouseholdName: (name: string) => void;
  updateMemberName: (id: string, newName: string) => void;
  deleteMember: (id: string) => void;
  joinHouseholdByCode: (code: string, newMemberName: string, persona: UserPersona) => boolean;

  // CRUD Transaksi
  addTransaction: (data: Omit<Transaction, 'id' | 'created_at'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // CRUD Akun
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferFunds: (sourceAccountId: string, targetAccountId: string, amount: number, notes?: string) => void;

  // CRUD Kategori
  addCategory: (category: Omit<Category, 'id' | 'created_at'>, initialTargetAmount?: number) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // CRUD Budgets
  setBudget: (categoryId: string, targetAmount: number, month?: number, year?: number) => void;

  // Tagihan Rutin
  addRecurringBill: (bill: Omit<RecurringBill, 'id' | 'created_at'>) => void;
  updateRecurringBill: (id: string, data: Partial<RecurringBill>) => void;
  payRecurringBill: (billId: string, accountId?: string) => void;
  toggleBillPaidStatus: (billId: string) => void;
  deleteRecurringBill: (billId: string) => void;

  // Cicilan (Installments)
  addInstallment: (installment: Omit<Installment, 'id' | 'created_at'>) => void;
  updateInstallment: (id: string, data: Partial<Installment>) => void;
  deleteInstallment: (id: string) => void;
  toggleInstallmentPaidStatus: (id: string) => void;
  payInstallment: (id: string, accountId?: string) => void;

  // Sync with Supabase
  syncWithSupabase: () => Promise<void>;
}

export const useNaviStore = create<NaviStoreState>()(
  persist(
    (set, get) => ({
      household: initialHousehold,
      currentUser: initialMembers[0], // Nanda (Suami)
      members: initialMembers,
      accounts: initialAccounts,
      categories: initialCategories,
      transactions: initialTransactions,
      budgets: initialBudgets,
      recurringBills: initialBills,
      installments: initialInstallments,
      isQuickInputOpen: false,
      isTransferOpen: false,
      isSupabaseActive: isSupabaseConfigured(),

      setQuickInputOpen: (open) => set({ isQuickInputOpen: open }),
      setTransferOpen: (open) => set({ isTransferOpen: open }),

      switchPersona: (persona: UserPersona) => {
        const { members, currentUser } = get();
        const existing = members.find((m) => m.persona === persona);
        if (existing) {
          set({ currentUser: existing });
        } else {
          // Buat user persona baru jika belum ada
          const newUser: UserProfile = {
            id: `user-${persona}-${Date.now().toString().slice(-4)}`,
            household_id: get().household.id,
            full_name: persona === 'istri' ? 'Istri' : persona === 'suami' ? 'Suami' : 'Anggota',
            role: 'member',
            persona,
            created_at: new Date().toISOString(),
          };
          set({
            members: [...members, newUser],
            currentUser: newUser,
          });
        }
      },

      setCurrentUser: (user) => set({ currentUser: user }),
      setHouseholdName: (name) => {
        set((s) => ({ household: { ...s.household, name } }));
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('households').update({ name }).eq('id', get().household.id).then();
        }
      },

      updateMemberName: (id: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        set((state) => {
          const updatedMembers = state.members.map((m) =>
            m.id === id ? { ...m, full_name: trimmed } : m
          );
          const updatedCurrentUser =
            state.currentUser.id === id
              ? { ...state.currentUser, full_name: trimmed }
              : state.currentUser;
          return {
            members: updatedMembers,
            currentUser: updatedCurrentUser,
          };
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('users').update({ full_name: trimmed }).eq('id', id).then();
        }
      },

      deleteMember: (id: string) => {
        const state = get();
        if (state.members.length <= 1) {
          alert('Tidak dapat menghapus. Rumah tangga minimal harus memiliki 1 anggota.');
          return;
        }

        const remainingMembers = state.members.filter((m) => m.id !== id);
        const newCurrentUser =
          state.currentUser.id === id ? remainingMembers[0] : state.currentUser;

        set({
          members: remainingMembers,
          currentUser: newCurrentUser,
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('users').delete().eq('id', id).then();
        }
      },

      joinHouseholdByCode: (code, newMemberName, persona) => {
        const cleanCode = code.trim().toUpperCase();
        // Sederhana: jika kode cocok atau valid format
        if (cleanCode.length >= 4) {
          const newUserId = `user-${persona}-${Date.now().toString().slice(-4)}`;
          const newProfile: UserProfile = {
            id: newUserId,
            household_id: get().household.id,
            full_name: newMemberName || (persona === 'istri' ? 'Istri' : 'Suami'),
            role: 'member',
            persona,
            created_at: new Date().toISOString(),
          };
          set((state) => ({
            members: [...state.members.filter((m) => m.id !== newUserId), newProfile],
            currentUser: newProfile,
          }));

          if (isSupabaseConfigured()) {
            const supabase = createClient();
            supabase.from('users').upsert([newProfile]).then();
          }
          return true;
        }
        return false;
      },

      addTransaction: (data) => {
        const state = get();
        const txId = `tx-${Date.now()}`;
        const newTx: Transaction = {
          ...data,
          id: txId,
          household_id: state.household.id,
          user_id: state.currentUser.id,
          created_at: new Date().toISOString(),
        };

        // Update saldo akun terkait secara atomik
        const updatedAccounts = state.accounts.map((acc) => {
          if (data.type === 'income' && acc.id === data.account_id) {
            return { ...acc, balance: acc.balance + data.amount };
          }
          if (data.type === 'expense' && acc.id === data.account_id) {
            return { ...acc, balance: acc.balance - data.amount };
          }
          if (data.type === 'transfer') {
            if (acc.id === data.account_id) {
              return { ...acc, balance: acc.balance - data.amount };
            }
            if (acc.id === data.destination_account_id) {
              return { ...acc, balance: acc.balance + data.amount };
            }
          }
          return acc;
        });

        set({
          transactions: [newTx, ...state.transactions],
          accounts: updatedAccounts,
        });

        // Sync ke Supabase jika aktif
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('transactions').insert([
            {
              id: newTx.id,
              household_id: newTx.household_id,
              account_id: newTx.account_id,
              destination_account_id: newTx.destination_account_id,
              category_id: newTx.category_id,
              user_id: newTx.user_id,
              type: newTx.type,
              amount: newTx.amount,
              transaction_date: newTx.transaction_date,
              description: newTx.description,
              receipt_url: newTx.receipt_url,
            },
          ]).then();

          const updatedSource = updatedAccounts.find((a) => a.id === data.account_id);
          if (updatedSource) {
            supabase.from('accounts').update({ balance: updatedSource.balance }).eq('id', updatedSource.id).then();
          }
          if (data.type === 'transfer' && data.destination_account_id) {
            const updatedDest = updatedAccounts.find((a) => a.id === data.destination_account_id);
            if (updatedDest) {
              supabase.from('accounts').update({ balance: updatedDest.balance }).eq('id', updatedDest.id).then();
            }
          }
        }
      },

      updateTransaction: (id, updatedData) => {
        const state = get();
        const oldTx = state.transactions.find((t) => t.id === id);
        if (!oldTx) return;

        const newTx: Transaction = {
          ...oldTx,
          ...updatedData,
        };

        // 1. Rollback efek saldo transaksi lama
        let currentAccounts = state.accounts.map((acc) => {
          let bal = acc.balance;
          if (oldTx.type === 'income' && acc.id === oldTx.account_id) {
            bal -= oldTx.amount;
          } else if (oldTx.type === 'expense' && acc.id === oldTx.account_id) {
            bal += oldTx.amount;
          } else if (oldTx.type === 'transfer') {
            if (acc.id === oldTx.account_id) bal += oldTx.amount;
            if (acc.id === oldTx.destination_account_id) bal -= oldTx.amount;
          }
          return { ...acc, balance: bal };
        });

        // 2. Terapkan efek saldo transaksi baru
        currentAccounts = currentAccounts.map((acc) => {
          let bal = acc.balance;
          if (newTx.type === 'income' && acc.id === newTx.account_id) {
            bal += newTx.amount;
          } else if (newTx.type === 'expense' && acc.id === newTx.account_id) {
            bal -= newTx.amount;
          } else if (newTx.type === 'transfer') {
            if (acc.id === newTx.account_id) bal -= newTx.amount;
            if (acc.id === newTx.destination_account_id) bal += newTx.amount;
          }
          return { ...acc, balance: bal };
        });

        // 3. Simpan perubahan ke state
        set({
          transactions: state.transactions.map((t) => (t.id === id ? newTx : t)),
          accounts: currentAccounts,
        });

        // 4. Sinkronisasi ke Supabase
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('transactions')
            .update({
              account_id: newTx.account_id,
              destination_account_id: newTx.destination_account_id || null,
              category_id: newTx.category_id || null,
              user_id: newTx.user_id,
              type: newTx.type,
              amount: newTx.amount,
              transaction_date: newTx.transaction_date,
              description: newTx.description || null,
              receipt_url: newTx.receipt_url || null,
            })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Error updating transaction in Supabase:', error);
            });

          const affectedAccountIds = new Set<string>();
          if (oldTx.account_id) affectedAccountIds.add(oldTx.account_id);
          if (oldTx.destination_account_id) affectedAccountIds.add(oldTx.destination_account_id);
          if (newTx.account_id) affectedAccountIds.add(newTx.account_id);
          if (newTx.destination_account_id) affectedAccountIds.add(newTx.destination_account_id);

          affectedAccountIds.forEach((accId) => {
            const acc = currentAccounts.find((a) => a.id === accId);
            if (acc) {
              supabase.from('accounts').update({ balance: acc.balance }).eq('id', acc.id).then();
            }
          });
        }
      },

      deleteTransaction: (id) => {
        const state = get();
        const tx = state.transactions.find((t) => t.id === id);
        if (!tx) return;

        // Rollback saldo akun
        const updatedAccounts = state.accounts.map((acc) => {
          if (tx.type === 'income' && acc.id === tx.account_id) {
            return { ...acc, balance: acc.balance - tx.amount };
          }
          if (tx.type === 'expense' && acc.id === tx.account_id) {
            return { ...acc, balance: acc.balance + tx.amount };
          }
          if (tx.type === 'transfer') {
            if (acc.id === tx.account_id) {
              return { ...acc, balance: acc.balance + tx.amount };
            }
            if (acc.id === tx.destination_account_id) {
              return { ...acc, balance: acc.balance - tx.amount };
            }
          }
          return acc;
        });

        set({
          transactions: state.transactions.filter((t) => t.id !== id),
          accounts: updatedAccounts,
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('transactions').delete().eq('id', id).then();
          const updatedSource = updatedAccounts.find((a) => a.id === tx.account_id);
          if (updatedSource) {
            supabase.from('accounts').update({ balance: updatedSource.balance }).eq('id', updatedSource.id).then();
          }
          if (tx.type === 'transfer' && tx.destination_account_id) {
            const updatedDest = updatedAccounts.find((a) => a.id === tx.destination_account_id);
            if (updatedDest) {
              supabase.from('accounts').update({ balance: updatedDest.balance }).eq('id', updatedDest.id).then();
            }
          }
        }
      },

      addAccount: (accountData) => {
        const newAcc: Account = {
          ...accountData,
          id: `acc-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ accounts: [...s.accounts, newAcc] }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('accounts').insert([newAcc]).then();
        }
      },

      updateAccount: (id, data) => {
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('accounts').update(data).eq('id', id).then();
        }
      },

      deleteAccount: (id) => {
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('accounts').delete().eq('id', id).then();
        }
      },

      transferFunds: (sourceAccountId, targetAccountId, amount, notes) => {
        const state = get();
        const sourceAcc = state.accounts.find((a) => a.id === sourceAccountId);
        const targetAcc = state.accounts.find((a) => a.id === targetAccountId);
        if (!sourceAcc || !targetAcc || amount <= 0) return;

        state.addTransaction({
          household_id: state.household.id,
          account_id: sourceAccountId,
          destination_account_id: targetAccountId,
          category_id: null,
          user_id: state.currentUser.id,
          type: 'transfer',
          amount,
          transaction_date: new Date().toISOString().split('T')[0],
          description: notes || `Transfer dari ${sourceAcc.name} ke ${targetAcc.name}`,
        });
      },

      addCategory: (categoryData, initialTargetAmount) => {
        const newCat: Category = {
          ...categoryData,
          id: `cat-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          categories: [...state.categories, newCat],
        }));

        if (initialTargetAmount && initialTargetAmount > 0) {
          get().setBudget(newCat.id, initialTargetAmount);
        }

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('categories').insert([newCat]).then(({ error }) => {
            if (error) console.error('Error inserting category into Supabase:', error);
          });
        }
      },

      updateCategory: (id, data) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('categories').update(data).eq('id', id).then(({ error }) => {
            if (error) console.error('Error updating category in Supabase:', error);
          });
        }
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          budgets: state.budgets.filter((b) => b.category_id !== id),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase.from('categories').delete().eq('id', id).then(({ error }) => {
            if (error) console.error('Error deleting category from Supabase:', error);
          });
          supabase.from('budgets').delete().eq('category_id', id).then(({ error }) => {
            if (error) console.error('Error deleting category budgets from Supabase:', error);
          });
        }
      },

      setBudget: (categoryId, targetAmount, month = currentMonth, year = currentYear) => {
        let savedBudget: Budget | undefined;
        set((state) => {
          const existingIndex = state.budgets.findIndex(
            (b) => b.category_id === categoryId && b.month === month && b.year === year
          );

          if (existingIndex >= 0) {
            const updated = [...state.budgets];
            savedBudget = {
              ...updated[existingIndex],
              target_amount: targetAmount,
            };
            updated[existingIndex] = savedBudget;
            return { budgets: updated };
          } else {
            savedBudget = {
              id: `b-${Date.now()}`,
              household_id: state.household.id,
              category_id: categoryId,
              target_amount: targetAmount,
              month,
              year,
            };
            return { budgets: [...state.budgets, savedBudget] };
          }
        });

        if (isSupabaseConfigured() && savedBudget) {
          const supabase = createClient();
          supabase.from('budgets').upsert([savedBudget]).then(({ error }) => {
            if (error) console.error('Error saving budget to Supabase:', error);
          });
        }
      },

      addRecurringBill: (billData) => {
        const newBill: RecurringBill = {
          ...billData,
          id: `bill-${Date.now()}`,
          is_paid: false,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ recurringBills: [...s.recurringBills, newBill] }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('recurring_bills')
            .insert([
              {
                id: newBill.id,
                household_id: newBill.household_id,
                name: newBill.name,
                amount: newBill.amount,
                due_day: newBill.due_day,
                is_paid: newBill.is_paid,
                preferred_account_id: newBill.preferred_account_id || null,
                category_id: newBill.category_id || null,
                notes: newBill.notes || null,
              },
            ])
            .then(({ error }) => {
              if (error) console.error('Error adding recurring bill to Supabase:', error);
            });
        }
      },

      updateRecurringBill: (id, data) => {
        set((s) => ({
          recurringBills: s.recurringBills.map((b) => (b.id === id ? { ...b, ...data } : b)),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('recurring_bills')
            .update(data)
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Error updating recurring bill in Supabase:', error);
            });
        }
      },

      payRecurringBill: (billId, accountId) => {
        const state = get();
        const bill = state.recurringBills.find((b) => b.id === billId);
        if (!bill) return;

        const payingAccountId = accountId || bill.preferred_account_id || state.accounts[0]?.id;
        if (!payingAccountId) return;

        // Buat transaksi pengeluaran otomatis
        state.addTransaction({
          household_id: state.household.id,
          account_id: payingAccountId,
          category_id: bill.category_id || null,
          user_id: state.currentUser.id,
          type: 'expense',
          amount: bill.amount,
          transaction_date: new Date().toISOString().split('T')[0],
          description: `Pembayaran Tagihan Rutin: ${bill.name}`,
        });

        const paidAt = new Date().toISOString();
        // Tandai sudah dibayar
        set({
          recurringBills: state.recurringBills.map((b) =>
            b.id === billId
              ? { ...b, is_paid: true, last_paid_at: paidAt }
              : b
          ),
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('recurring_bills')
            .update({ is_paid: true, last_paid_at: paidAt })
            .eq('id', billId)
            .then(({ error }) => {
              if (error) console.error('Error updating paid bill in Supabase:', error);
            });
        }
      },

      toggleBillPaidStatus: (billId) => {
        let updatedPaidStatus = false;
        let paidAt: string | null = null;
        set((state) => {
          const updated = state.recurringBills.map((b) => {
            if (b.id === billId) {
              updatedPaidStatus = !b.is_paid;
              paidAt = !b.is_paid ? new Date().toISOString() : null;
              return { ...b, is_paid: updatedPaidStatus, last_paid_at: paidAt };
            }
            return b;
          });
          return { recurringBills: updated };
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('recurring_bills')
            .update({
              is_paid: updatedPaidStatus,
              last_paid_at: paidAt,
            })
            .eq('id', billId)
            .then(({ error }) => {
              if (error) console.error('Error updating bill paid status in Supabase:', error);
            });
        }
      },

      deleteRecurringBill: (billId) => {
        set((s) => ({
          recurringBills: s.recurringBills.filter((b) => b.id !== billId),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('recurring_bills')
            .delete()
            .eq('id', billId)
            .then(({ error }) => {
              if (error) console.error('Error deleting recurring bill from Supabase:', error);
            });
        }
      },

      addInstallment: (installmentData) => {
        const newInst: Installment = {
          ...installmentData,
          id: `inst-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          installments: [...state.installments, newInst],
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('installments')
            .insert([newInst])
            .then(({ error }) => {
              if (error) console.error('Error inserting installment into Supabase:', error);
            });
        }
      },

      updateInstallment: (id, data) => {
        set((state) => ({
          installments: state.installments.map((i) => (i.id === id ? { ...i, ...data } : i)),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('installments')
            .update(data)
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Error updating installment in Supabase:', error);
            });
        }
      },

      deleteInstallment: (id) => {
        set((state) => ({
          installments: state.installments.filter((i) => i.id !== id),
        }));

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('installments')
            .delete()
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Error deleting installment from Supabase:', error);
            });
        }
      },

      toggleInstallmentPaidStatus: (id) => {
        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let updatedPaidStatus = false;
        let lastPeriod: string | null = null;

        set((state) => {
          const updated = state.installments.map((i) => {
            if (i.id === id) {
              updatedPaidStatus = !i.status_pembayaran_bulan_ini;
              lastPeriod = updatedPaidStatus ? currentPeriod : null;
              return {
                ...i,
                status_pembayaran_bulan_ini: updatedPaidStatus,
                last_paid_period: lastPeriod,
              };
            }
            return i;
          });
          return { installments: updated };
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('installments')
            .update({
              status_pembayaran_bulan_ini: updatedPaidStatus,
              last_paid_period: lastPeriod,
            })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Error updating installment paid status in Supabase:', error);
            });
        }
      },

      payInstallment: (id, accountId) => {
        const state = get();
        const inst = state.installments.find((i) => i.id === id);
        if (!inst) return;

        const payingAccountId = accountId || inst.preferred_account_id || state.accounts[0]?.id;
        if (!payingAccountId) return;

        const now = new Date();
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const cicilanCat = state.categories.find(
          (c) => c.name.toLowerCase().includes('cicilan') || c.name.toLowerCase().includes('tagihan')
        );

        state.addTransaction({
          household_id: state.household.id,
          account_id: payingAccountId,
          category_id: cicilanCat?.id || null,
          user_id: state.currentUser.id,
          type: 'expense',
          amount: inst.nominal_per_bulan,
          transaction_date: now.toISOString().split('T')[0],
          description: `Pembayaran Cicilan: ${inst.nama_cicilan}`,
        });

        set({
          installments: state.installments.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status_pembayaran_bulan_ini: true,
                  last_paid_period: currentPeriod,
                }
              : i
          ),
        });

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          supabase
            .from('installments')
            .update({
              status_pembayaran_bulan_ini: true,
              last_paid_period: currentPeriod,
            })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Error updating paid installment in Supabase:', error);
            });
        }
      },

      syncWithSupabase: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const supabase = createClient();
          const state = get();

          // 1. Cek apakah database Supabase masih kosong
          const { data: existingHh } = await supabase
            .from('households')
            .select('id')
            .limit(1);

          if (!existingHh || existingHh.length === 0) {
            // Inisialisasi awal ke Supabase agar perangkat lain bisa membaca data ini
            await supabase.from('households').upsert([state.household]);
            await supabase.from('users').upsert(state.members);
            await supabase.from('accounts').upsert(state.accounts);
            await supabase.from('categories').upsert(state.categories);
            await supabase.from('budgets').upsert(state.budgets);
            await supabase.from('recurring_bills').upsert(state.recurringBills);
            await supabase.from('transactions').upsert(state.transactions);
            return;
          }

          // 2. Ambil data terbaru dari cloud
          const { data: households } = await supabase.from('households').select('*');
          const { data: members } = await supabase.from('users').select('*');
          const { data: accounts } = await supabase.from('accounts').select('*');
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .order('transaction_date', { ascending: false });
          const { data: categories } = await supabase.from('categories').select('*');
          const { data: budgets } = await supabase.from('budgets').select('*');
          const { data: bills } = await supabase.from('recurring_bills').select('*');
          const { data: insts } = await supabase.from('installments').select('*');

          if (households && households[0]) set({ household: households[0] });
          if (members && members.length > 0) {
            set((s) => ({
              members,
              currentUser: members.find((m) => m.id === s.currentUser.id) || members[0] || s.currentUser,
            }));
          }
          if (accounts && accounts.length > 0) set({ accounts });
          if (transactions) set({ transactions });
          if (categories && categories.length > 0) set({ categories });
          if (budgets) set({ budgets });
          if (bills) set({ recurringBills: bills });
          if (insts) set({ installments: insts });
        } catch (e) {
          console.error('Error syncing with Supabase:', e);
        }
      },
    }),
    {
      name: 'navi-keuangan-storage',
      partialize: (state) => ({
        household: state.household,
        currentUser: state.currentUser,
        members: state.members,
        accounts: state.accounts,
        categories: state.categories,
        transactions: state.transactions,
        budgets: state.budgets,
        recurringBills: state.recurringBills,
        installments: state.installments,
      }),
    }
  )
);
