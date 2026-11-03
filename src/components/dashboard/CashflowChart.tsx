'use client';

import React, { useState, useEffect } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export function CashflowChart() {
  const { transactions } = useNaviStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ambil 6 bulan terakhir
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const now = new Date();
  
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIndex = d.getMonth();
    const y = d.getFullYear();
    const mName = `${months[mIndex]}`;

    // Filter transaksi di bulan ini
    const monthlyTx = transactions.filter((t) => {
      const txDate = new Date(t.transaction_date);
      return txDate.getMonth() === mIndex && txDate.getFullYear() === y;
    });

    const income = monthlyTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    chartData.push({
      bulan: mName,
      Pemasukan: income,
      Pengeluaran: expense,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Pemasukan: {formatRupiah(payload[0]?.value)}
          </p>
          <p className="text-red-600 dark:text-red-400 font-semibold">
            Pengeluaran: {formatRupiah(payload[1]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Tren Arus Kas (Pemasukan vs Pengeluaran)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluasi keuangan keluarga 6 bulan terakhir
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(0)}jt` : `${val}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Memuat grafik arus kas...
          </div>
        )}
      </div>
    </div>
  );
}
