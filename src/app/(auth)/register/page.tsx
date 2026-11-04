'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { UserPersona } from '@/types';
import { Wallet, ArrowRight, Home, Link2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setHouseholdName, joinHouseholdByCode, switchPersona } = useNaviStore();

  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [householdName, setLocalHouseholdName] = useState('Keluarga Kami');
  const [inviteCode, setInviteCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [persona, setPersona] = useState<UserPersona>('suami');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      if (householdName.trim()) {
        setHouseholdName(householdName.trim());
      }
      switchPersona(persona);
    } else {
      if (inviteCode.trim()) {
        joinHouseholdByCode(inviteCode.trim(), fullName, persona);
      }
    }

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
            Daftar Akun Navi
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Buat rumah tangga baru atau hubungkan ke HP pasangan
          </p>
        </div>

        {/* Tab Switch: Buat Baru vs Gabung Pasangan */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'create'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Rumah Tangga Baru</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'join'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Gabung HP Pasangan</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nama Rumah Tangga / Keluarga
              </label>
              <input
                type="text"
                placeholder="e.g. Rumah Tangga Nanda & Dina"
                value={householdName}
                onChange={(e) => setLocalHouseholdName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Kode Undangan Pasangan (Invite Code)
              </label>
              <input
                type="text"
                placeholder="e.g. NAVI-7821"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minta kode 8-digit ini dari aplikasi di HP pasangan Anda.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nama Lengkap / Panggilan
              </label>
              <input
                type="text"
                placeholder="e.g. Nanda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Peran di HP Ini
              </label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as UserPersona)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="suami">Suami</option>
                <option value="istri">Istri</option>
              </select>
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
            <span>{mode === 'create' ? 'Buat Rumah Tangga & Masuk' : 'Gabung & Sinkronkan HP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  );
}