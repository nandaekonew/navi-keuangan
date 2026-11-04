'use client';

import React from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { StatCards } from '@/components/dashboard/StatCards';
import { CashflowChart } from '@/components/dashboard/CashflowChart';
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList';
import { BillsQuickWidget } from '@/components/dashboard/BillsQuickWidget';
import { InstallmentsQuickWidget } from '@/components/dashboard/InstallmentsQuickWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Plus, ArrowLeftRight, Sparkles, Smartphone } from 'lucide-react';

export default function DashboardOverviewPage() {
  const {
    currentUser,
    household,
    setQuickInputOpen,
    setTransferOpen,
    switchPersona,
  } = useNaviStore();

  const isSuami = currentUser?.persona === 'suami';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mobile Persona Quick Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-emerald-600/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
              {household.name}
            </span>
            <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded-full">
              Kode: {household.invite_code}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Selamat Datang, {currentUser?.full_name}! {isSuami ? '👨💼' : '👩💼'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-50 mt-1 max-w-xl">
            Aplikasi keuangan multi-user bersama pasangan. Setiap transaksi yang Anda catat akan langsung tersinkron ke HP pasangan.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setTransferOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => setQuickInputOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 shadow-md transition"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <StatCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <CashflowChart />
          <RecentTransactions />
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          <BudgetProgressList />
          <BillsQuickWidget />
          <InstallmentsQuickWidget />
        </div>
      </div>
    </div>
  );
}
