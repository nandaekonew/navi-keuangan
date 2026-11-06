'use client';

import React, { useState, useEffect } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { UserPersona } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  getQwenVLConfig,
  saveQwenVLConfig,
  QwenVLConfig,
} from '@/lib/receiptScanner';
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
  Bot,
  Sparkles,
  ExternalLink,
  Key,
  Server,
  Loader2,
  CheckCircle2,
  AlertCircle,
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

  // Qwen2-VL Configuration State
  const [qwenForm, setQwenForm] = useState<QwenVLConfig>({
    provider: 'openrouter',
    apiKey: '',
    customEndpoint: '',
    model: 'qwen/qwen-2-vl-7b-instruct',
    enabled: true,
  });
  const [isTestingQwen, setIsTestingQwen] = useState(false);
  const [qwenTestMessage, setQwenTestMessage] = useState<string | null>(null);
  const [qwenTestSuccess, setQwenTestSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const cfg = getQwenVLConfig();
    setQwenForm(cfg);
  }, []);

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

  const handleSaveQwenConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveQwenVLConfig(qwenForm);
    alert('Pengaturan Qwen2-VL berhasil disimpan!');
  };

  const handleTestQwen = async () => {
    setIsTestingQwen(true);
    setQwenTestMessage(null);
    setQwenTestSuccess(null);

    try {
      // 1x1 test image
      const test1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAElFTkSuQmCC';
      const res = await fetch('/api/ocr/qwen-vl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: test1x1,
          apiKey: qwenForm.apiKey,
          provider: qwenForm.provider,
          customEndpoint: qwenForm.customEndpoint,
          model: qwenForm.model,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQwenTestSuccess(true);
        setQwenTestMessage('Koneksi endpoint Qwen2-VL berhasil terverifikasi!');
      } else {
        setQwenTestSuccess(false);
        setQwenTestMessage(data.message || 'Gagal memverifikasi endpoint Qwen2-VL.');
      }
    } catch (err: any) {
      setQwenTestSuccess(false);
      setQwenTestMessage(`Gagal menghubungi server: ${err.message}`);
    } finally {
      setIsTestingQwen(false);
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
          Kelola sinkronisasi multi-device HP Suami & Istri, model OCR Qwen2-VL, dan koneksi Supabase
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

        <form onSubmit={handleSaveHouseholdName} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            Simpan Nama
          </button>
        </form>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              Kode Undangan Pasangan (Multi-User HP)
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
              {household.invite_code}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Buka aplikasi ini di HP pasangan Anda, pilih &quot;Gabung Rumah Tangga&quot; di pengaturan, lalu masukkan kode ini untuk sinkronisasi otomatis.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Kode Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Kode Undangan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profil Persona Aktif & Ganti Peran */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Peran Aktif di HP Ini
            </h2>
            <p className="text-[11px] text-slate-500">
              Pilih identitas Anda agar setiap transaksi otomatis diatribusikan ke Suami atau Istri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => switchPersona('suami')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
              currentUser.persona === 'suami'
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
                S
              </div>
              <div>
                <span className="text-xs font-bold block">Profil Suami (Admin)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {members.find((m) => m.persona === 'suami')?.full_name || 'Nanda Eko Widianto'}
                </span>
              </div>
            </div>
            {currentUser.persona === 'suami' && (
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => switchPersona('istri')}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
              currentUser.persona === 'istri'
                ? 'border-pink-500 bg-pink-50/60 dark:bg-pink-950/40 text-pink-900 dark:text-pink-100 ring-2 ring-pink-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center text-sm font-black shadow-sm">
                I
              </div>
              <div>
                <span className="text-xs font-bold block">Profil Istri (Member)</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {members.find((m) => m.persona === 'istri')?.full_name || 'Devi Asmarani'}
                </span>
              </div>
            </div>
            {currentUser.persona === 'istri' && (
              <Check className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            )}
          </button>
        </div>
      </div>

      {/* ===================== INTEGRASI QWEN2-VL VISION AI ===================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Integrasi Vision AI: Qwen2-VL (Alibaba Cloud)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Multimodal OCR
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Identifikasi teks struk belanja otomatis berbasis model open-source Qwen2-VL
              </p>
            </div>
          </div>

          <a
            href="https://github.com/QwenLM/Qwen2-VL"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
          >
            <span>GitHub QwenLM/Qwen2-VL</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-white">
            Tentang Qwen2-VL (<a href="https://github.com/QwenLM/Qwen2-VL" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">QwenLM/Qwen2-VL</a>):
          </p>
          <p className="text-[11px]">
            Qwen2-VL adalah model Vision-Language unggulan dari Alibaba Cloud yang memiliki kemampuan membaca nota dan dokumen visual dengan akurasi sangat tinggi. Model ini mampu mengenali nominal total, subtotal, tanggal, rincian barang, dan nama toko bahkan pada struk thermal yang kusut atau pudar.
          </p>
        </div>

        <form onSubmit={handleSaveQwenConfig} className="space-y-3.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Provider Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Penyedia / Endpoint Provider
              </label>
              <select
                value={qwenForm.provider}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setQwenForm({
                    ...qwenForm,
                    provider: p,
                    model:
                      p === 'openrouter'
                        ? 'qwen/qwen-2-vl-7b-instruct'
                        : p === 'siliconflow'
                        ? 'Qwen/Qwen2-VL-7B-Instruct'
                        : p === 'dashscope'
                        ? 'qwen2-vl-7b-instruct'
                        : qwenForm.model,
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="openrouter">OpenRouter (qwen-2-vl-7b / 72b)</option>
                <option value="siliconflow">SiliconFlow (Qwen2-VL-7B-Instruct)</option>
                <option value="dashscope">Alibaba Cloud DashScope (Official)</option>
                <option value="custom">Server Lokal Sendiri (vLLM / Ollama)</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Model Tag
              </label>
              <input
                type="text"
                value={qwenForm.model || ''}
                onChange={(e) => setQwenForm({ ...qwenForm, model: e.target.value })}
                placeholder="qwen/qwen-2-vl-7b-instruct"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Custom Endpoint URL (Jika memilih custom server) */}
          {qwenForm.provider === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                URL Endpoint Server Lokal / vLLM
              </label>
              <input
                type="text"
                value={qwenForm.customEndpoint || ''}
                onChange={(e) => setQwenForm({ ...qwenForm, customEndpoint: e.target.value })}
                placeholder="http://localhost:8000/v1"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Petunjuk: Jalankan dari repo QwenLM/Qwen2-VL menggunakan vLLM: <code>python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-VL-7B-Instruct</code>
              </span>
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              API Key ({qwenForm.provider})
            </label>
            <div className="relative">
              <input
                type="password"
                value={qwenForm.apiKey || ''}
                onChange={(e) => setQwenForm({ ...qwenForm, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Disimpan aman di penyimpanan lokal peramban Anda untuk melakukan OCR nota via Qwen2-VL.
            </span>
          </div>

          {/* Status Hasil Tes Koneksi */}
          {qwenTestMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                qwenTestSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
              }`}
            >
              {qwenTestSuccess ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{qwenTestMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            >
              Simpan Pengaturan Qwen2-VL
            </button>

            <button
              type="button"
              onClick={handleTestQwen}
              disabled={isTestingQwen}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              {isTestingQwen ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menguji Koneksi...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5" />
                  <span>Uji Koneksi Endpoint</span>
                </>
              )}
            </button>
          </div>
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
