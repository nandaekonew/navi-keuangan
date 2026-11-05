'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { usePWA } from '@/components/pwa/PWAProvider';
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  PieChart,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Wallet,
  Copy,
  Check,
  User,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const navItems = [
  { href: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/accounts', label: 'Dompet & Akun', icon: WalletCards },
  { href: '/budgets', label: 'Pos Alokasi', icon: PieChart },
  { href: '/bills', label: 'Tagihan Rutin', icon: CheckSquare },
  { href: '/installments', label: 'Cicilan', icon: CreditCard },
  { href: '/analytics', label: 'Rekap & Grafik', icon: BarChart3 },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps = {}) {
  const pathname = usePathname();
  const {
    household,
    currentUser,
    switchPersona,
    recurringBills,
    installments,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
  } = useNaviStore();
  const { isInstallable, isStandalone, installApp } = usePWA();
  const [copied, setCopied] = React.useState(false);

  const activeIsOpen = isOpen !== undefined ? isOpen : isMobileDrawerOpen;
  const handleClose = () => {
    if (onClose) onClose();
    setMobileDrawerOpen(false);
  };

  if (!activeIsOpen) return null;

  const isSuami = currentUser?.persona === 'suami';
  const unpaidBillsCount = recurringBills.filter((b) => !b.is_paid).length;
  const activeInstallmentsCount = installments.length;

  const handleCopyCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-[300px] sm:max-w-xs bg-white dark:bg-slate-900 shadow-2xl flex flex-col p-4 sm:p-5 z-50 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight block">
                Navi Keuangan
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Menu & Fitur Lengkap
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup Menu"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Household & Persona Card */}
        <div className="my-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                {household.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400">Kode:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                >
                  <span>{household.invite_code}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Persona Switcher Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => switchPersona('suami')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                isSuami
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Suami</span>
            </button>
            <button
              type="button"
              onClick={() => switchPersona('istri')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                !isSuami
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Istri</span>
            </button>
          </div>
        </div>

        {/* 8 Main Navigation Items (Mirroring Desktop Web View Image 3) */}
        <div className="space-y-1 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-3 py-1">
            Daftar Modul Aplikasi
          </span>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            let badge: string | null = null;
            if (item.href === '/bills' && unpaidBillsCount > 0) {
              badge = `${unpaidBillsCount}`;
            } else if (item.href === '/installments' && activeInstallmentsCount > 0) {
              badge = `${activeInstallmentsCount}`;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* PWA Android Install Banner */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
          {!isStandalone ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstallable ? 'Instal Aplikasi di HP' : 'Pasang Aplikasi di HP'}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Aplikasi Terpasang di HP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
