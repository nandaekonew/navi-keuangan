'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { UserPersona } from '@/types';
import { Wallet, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchPersona, household } = useNaviStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersona] = useState<UserPersona>('suami');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchPersona(persona);
    router.push('/');
  };

  const handleQuickDemo = (selectedPersona: UserPersona) => {
    switchPersona(selectedPersona);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Navi Keuangan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aplikasi Management Keuangan Multi-User Suami & Istri
          </p>
        </div>

        {/* Quick Demo Persona One-Click Access */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 block text-center">
            Akses Cepat Langsung ke HP:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('suami')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <span>👨💼 Masuk sbg Suami</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('istri')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition shadow-sm"
            >
              <span>👩💼 Masuk sbg Istri</span>
            </button>
          </div>
        </div>

        {/* Form Login Supabase */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Peran Anda di HP ini
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setPersona('suami')}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  persona === 'suami' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                👨 Suami
              </button>
              <button
                type="button"
                onClick={() => setPersona('istri')}
                className={`py-1.5 text-xs font-bold rounded-lg transition ${
                  persona === 'istri' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                👩 Istri
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="nama@keluarga.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Kata Sandi / PIN
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Belum punya akun keluarga?{' '}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            Daftar & Hubungkan Pasangan
          </Link>
        </div>
      </div>
    </div>
  );
}
