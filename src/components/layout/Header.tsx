'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { UserPersona } from '@/types';
import {
  Wallet,
  Copy,
  Check,
  Plus,
  ArrowLeftRight,
  RefreshCw,
  User,
  Menu,
} from 'lucide-react';

export function Header() {
  const {
    household,
    currentUser,
    switchPersona,
    setQuickInputOpen,
    setTransferOpen,
    setMobileDrawerOpen,
    syncWithSupabase,
  } = useNaviStore();

  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithSupabase();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleCopyCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuami = currentUser?.persona === 'suami';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Household Info + Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Trigger (Access to Full Web View Menu) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Buka Menu Navigasi Lengkap"
              title="Buka Menu Navigasi Lengkap"
              className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm sm:text-base truncate">
                  Navi Keuangan
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                  Multi-User Rumah Tangga
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
                  {household.name}
                </span>
                <span className="hidden sm:inline">•</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Salin kode undangan HP pasangan"
                  title="Klik untuk menyalin kode undangan HP pasangan"
                  className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition whitespace-nowrap shrink-0"
                >
                  <span>{household.invite_code}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons & Persona Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Actions for Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTransferOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                <span>Transfer Antar Rekening</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickInputOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Cepat</span>
              </button>
            </div>

            {/* Manual Sync Cloud Button */}
            <button
              type="button"
              onClick={handleManualSync}
              aria-label="Sinkronkan data dengan Cloud Supabase"
              title="Sinkronkan data dengan Cloud Supabase"
              className="w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`}
              />
            </button>

            {/* Mobile 1-Tap Persona Toggle (Compact for Mobile) */}
            <button
              type="button"
              onClick={() => switchPersona(isSuami ? 'istri' : 'suami')}
              aria-label={`Ganti profil (Sedang aktif: ${isSuami ? 'Suami' : 'Istri'})`}
              title={`Klik untuk beralih ke ${isSuami ? 'Istri' : 'Suami'}`}
              className={`sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                isSuami
                  ? 'bg-blue-600 text-white'
                  : 'bg-pink-600 text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isSuami ? 'Suami' : 'Istri'}</span>
            </button>

            {/* Desktop Dual Persona Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => switchPersona('suami')}
                aria-label="Ganti ke persona Suami"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
                  isSuami
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Suami</span>
              </button>
              <button
                type="button"
                onClick={() => switchPersona('istri')}
                aria-label="Ganti ke persona Istri"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none transition-all ${
                  !isSuami
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Istri</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
