'use client';

import React, { useState } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { UserPersona } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Settings,
  Users,
  Copy,
  Check,
  Smartphone,
  Database,
  Shield,
  RefreshCw,
  Share2,
  Pencil,
  Trash2,
  User,
  UserCheck,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    household,
    setHouseholdName,
    currentUser,
    members,
    switchPersona,
    joinHouseholdByCode,
    updateMemberName,
    deleteMember,
  } = useNaviStore();

  const [nameInput, setNameInput] = useState(household.name);
  const [copied, setCopied] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [joinPersona, setJoinPersona] = useState<UserPersona>('istri');
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveHouseholdName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setHouseholdName(nameInput.trim());
      alert('Nama rumah tangga berhasil diperbarui!');
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    const ok = joinHouseholdByCode(inviteInput, newMemberName, joinPersona);
    if (ok) {
      setJoinSuccess(`Berhasil bergabung ke Rumah Tangga dengan kode ${inviteInput}!`);
      setInviteInput('');
      setNewMemberName('');
    } else {
      alert('Kode undangan tidak valid.');
    }
  };

  const hasSupabase = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Pengaturan Rumah Tangga & Multi-User
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola sinkronisasi multi-device HP Suami & Istri dan koneksi Supabase
        </p>
      </div>

      {/* Household Profile & Share Code */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Identitas Rumah Tangga (Workspace Bersama)
            </h2>
            <p className="text-[11px] text-slate-500">
              Workspace terisolasi untuk Anda dan pasangan
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveHouseholdName} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Nama Rumah Tangga / Keluarga
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>

        {/* Invite Code Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block">
              Kode Undangan Pasangan (Invite Code)
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Bagikan kode ini kepada Suami atau Istri untuk menghubungkan HP ke akun ini.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              {household.invite_code}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
              title="Salin Kode Undangan"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Daftar Anggota Rumah Tangga ({members.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Anggota keluarga yang terhubung dalam workspace ini
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((member) => {
            const isCurrent = member.id === currentUser.id;
            const isSuami = member.persona === 'suami';
            const initials = member.full_name
              ? member.full_name
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : isSuami ? 'S' : 'I';

            return (
              <div key={member.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border select-none transition-all ${
                      isSuami
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/60'
                        : 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200/80 dark:border-pink-900/60'
                    }`}
                  >
                    <span className="tracking-wider">{initials}</span>
                  </div>

                  <div className="min-w-0">
                    {editingMemberId === member.id ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <input
                          type="text"
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ring-1 ring-emerald-500"
                          autoFocus
                          placeholder="Masukkan nama..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingNameValue.trim()) {
                              updateMemberName(member.id, editingNameValue.trim());
                            }
                            setEditingMemberId(null);
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMemberId(null)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {member.full_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMemberId(member.id);
                            setEditingNameValue(member.full_name);
                          }}
                          title="Ubah Nama"
                          aria-label="Ubah nama anggota"
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Sedang Aktif di HP ini
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className={`font-semibold ${isSuami ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'}`}>
                        Peran: {isSuami ? 'Suami' : 'Istri'}
                      </span>
                      <span>•</span>
                      <span>Akses: {member.role === 'admin' ? 'Admin' : 'Member'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => switchPersona(member.persona)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ganti ke Profil Ini</span>
                      <span className="sm:hidden">Ganti Profil</span>
                    </button>
                  )}

                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus anggota "${member.full_name}" dari rumah tangga?`)) {
                          deleteMember(member.id);
                        }
                      }}
                      title="Hapus Anggota"
                      aria-label="Hapus anggota"
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join Another Household Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Gabung ke Rumah Tangga Lain (Pairing HP Pasangan)
            </h2>
            <p className="text-[11px] text-slate-500">
              Masukkan kode undangan dari aplikasi pasangan Anda
            </p>
          </div>
        </div>

        {joinSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
            {joinSuccess}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Kode Undangan
              </label>
              <input
                type="text"
                placeholder="e.g. NAVI-7821"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Nama Anda di HP ini
              </label>
              <input
                type="text"
                placeholder="e.g. Dina (Istri)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Peran
              </label>
              <select
                value={joinPersona}
                onChange={(e) => setJoinPersona(e.target.value as UserPersona)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="istri">Istri</option>
                <option value="suami">Suami</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
          >
            Hubungkan Workspace Rumah Tangga
          </button>
        </form>
      </div>

      {/* Supabase Status & Instructions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Status Backend Supabase & PostgreSQL
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hasSupabase
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {hasSupabase ? 'Cloud Realtime Terkoneksi' : 'Mode Offline / Local Storage Aktif'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {hasSupabase
                ? 'Sinkronisasi cloud PostgreSQL aktif secara real-time.'
                : 'Aplikasi berjalan lancar dengan penyimpanan lokal. Hubungkan Supabase untuk sync antar perangkat cloud.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p className="font-bold text-slate-900 dark:text-white">
            Cara Menghubungkan ke Supabase Sendiri:
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>
              Buat project baru di <span className="font-mono text-emerald-600">supabase.com</span>
            </li>
            <li>
              Buka menu <strong>SQL Editor</strong> di Supabase, lalu jalankan file skrip{' '}
              <span className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border">
                supabase/schema.sql
              </span>
            </li>
            <li>
              Salin <strong>Project URL</strong> dan <strong>Anon Public Key</strong> dari Settings &gt; API
            </li>
            <li>
              Tempel ke file <span className="font-mono">.env.local</span>:{' '}
              <code className="text-emerald-700 dark:text-emerald-400">
                NEXT_PUBLIC_SUPABASE_URL=...
              </code>{' '}
              dan{' '}
              <code className="text-emerald-700 dark:text-emerald-400">
                NEXT_PUBLIC_SUPABASE_ANON_KEY=...
              </code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}