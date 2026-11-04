'use client';

import React, { useState, useEffect } from 'react';
import { useNaviStore } from '@/lib/store/useNaviStore';
import { formatRupiah } from '@/lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  Users,
  TrendingDown,
  TrendingUp,
  Award,
} from 'lucide-react';

const COLORS = [
  '#f97316', '#06b6d4', '#3b82f6', '#6366f1',
  '#ec4899', '#ef4444', '#10b981', '#8b5cf6',
  '#eab308', '#14b8a6', '#f43f5e'
];

export default function AnalyticsPage() {
  const { transactions, categories, members } = useNaviStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Transaksi pengeluaran bulan ini
  const monthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.transaction_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Group by Category for Pie Chart
  const categoryDataMap: Record<string, number> = {};
  monthExpenses.forEach((t) => {
    const cat = categories.find((c) => c.id === t.category_id);
    const catName = cat?.name || 'Lain-lain';
    categoryDataMap[catName] = (categoryDataMap[catName] || 0) + t.amount;
  });

  const categoryChartData = Object.entries(categoryDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Group by Persona: Suami vs Istri
  let suamiExpense = 0;
  let istriExpense = 0;
  let suamiIncome = 0;
  let istriIncome = 0;

  transactions.forEach((t) => {
    const d = new Date(t.transaction_date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const user = members.find((m) => m.id === t.user_id);
      const isSuami = user?.persona === 'suami';
      if (t.type === 'expense') {
        if (isSuami) suamiExpense += t.amount;
        else istriExpense += t.amount;
      } else if (t.type === 'income') {
        if (isSuami) suamiIncome += t.amount;
        else istriIncome += t.amount;
      }
    }
  });

  const personaComparisonData = [
    {
      nama: 'Suami',
      Pengeluaran: suamiExpense,
      Pemasukan: suamiIncome,
    },
    {
      nama: 'Istri',
      Pengeluaran: istriExpense,
      Pemasukan: istriIncome,
    },
  ];

  // Tooltip custom
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">{payload[0]?.name}</p>
          <p className="text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
            {formatRupiah(payload[0]?.value)}
          </p>
          {totalExpense > 0 && (
            <p className="text-slate-400 text-[10px]">
              {((payload[0]?.value / totalExpense) * 100).toFixed(1)}% dari total pengeluaran
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Rekap & Analytics Finansial Keluarga
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Visualisasi mendalam rasio pos belanja, tren pengeluaran, dan kontribusi suami-istri
        </p>
      </div>

      {/* Grid 2 Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rasio Pengeluaran per Kategori (Donut Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Rasio Pengeluaran per Pos Kategori
              </h3>
              <p className="text-[11px] text-slate-500">Persentase porsi belanja bulan berjalan</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {isMounted && categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Belum ada data pengeluaran bulan ini.</div>
            )}
          </div>

          {/* Category Legends */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            {categoryChartData.slice(0, 6).map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate text-slate-600 dark:text-slate-400 font-medium">
                  {item.name}
                </span>
                <span className="ml-auto font-bold text-slate-900 dark:text-white">
                  {totalExpense > 0 ? `${((item.value / totalExpense) * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kontribusi & Pencatatan Suami vs Istri */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Kontribusi Suami & Istri
              </h3>
              <p className="text-[11px] text-slate-500">Perbandingan pemasukan & pengeluaran yang dicatat</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={personaComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="nama" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(0)}jt` : `${val}`)}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Memuat perbandingan...
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Suami</span>
              <div className="mt-1 font-black text-slate-900 dark:text-white">
                Pengeluaran: {formatRupiah(suamiExpense)}
              </div>
              <div className="text-[10px] text-slate-500">Pemasukan: {formatRupiah(suamiIncome)}</div>
            </div>

            <div className="p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
              <span className="text-[11px] font-bold text-pink-800 dark:text-pink-300">Istri</span>
              <div className="mt-1 font-black text-slate-900 dark:text-white">
                Pengeluaran: {formatRupiah(istriExpense)}
              </div>
              <div className="text-[10px] text-slate-500">Pemasukan: {formatRupiah(istriIncome)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
