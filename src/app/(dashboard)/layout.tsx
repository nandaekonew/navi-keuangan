'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { QuickTransactionModal } from '@/components/forms/QuickTransactionModal';
import { TransferModal } from '@/components/forms/TransferModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8 max-w-full overflow-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
      <QuickTransactionModal />
      <TransferModal />
    </div>
  );
}
