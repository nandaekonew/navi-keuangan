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
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const {
    household,
    currentUser,
    switchPersona,
    setQuickInputOpen,
    setTransferOpen,
    isSupabaseActive,
  } = useNaviStore();

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuami = currentUser?.persona === 'suami';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Household Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">
                  Navi Keuangan
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Multi-User Rumah Tangga
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {household.name}
                </span>
                <span>•</span>
                <button
                  onClick={handleCopyCode}
                  title="Klik untuk menyalin kode undangan HP pasangan"
                  className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded transition"
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Actions for Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setTransferOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                <span>Transfer Antar Rekening</span>
              </button>
              <button
                onClick={() => setQuickInputOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Cepat</span>
              </button>
            </div>

            {/* Persona Switcher (Suami 👨💼 / Istri 👩💼) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <button
                onClick={() => switchPersona('suami')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSuami
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>👨💼</span>
                <span className="hidden sm:inline">Suami</span>
              </button>
              <button
                onClick={() => switchPersona('istri')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !isSuami
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>👩💼</span>
                <span className="hidden sm:inline">Istri</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
