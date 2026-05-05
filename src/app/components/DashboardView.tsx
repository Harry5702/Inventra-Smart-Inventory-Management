'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, AlertTriangle, BarChart3,
  Zap, Package, ArrowUp, ArrowDown, Brain, Clock,
} from 'lucide-react';

type Period = 'today' | 'week' | 'month';

type StatsType = {
  totalProducts: number;
  lowStock: number;
  lowStockList: { id: string; name: string; stock: number; category: string }[];
  totalStock: number;
  revenue: number;
  profit: number;
  revenueToday: number; revenueWeek: number; revenueMonth: number;
  salesToday: number;   salesWeek: number;   salesMonth: number;
  profitToday: number;  profitWeek: number;  profitMonth: number;
  salesByDay: { label: string; revenue: number; qty: number }[];
  topSelling:   { name: string; qty: number; revenue: number; category: string }[];
  leastSelling: { name: string; qty: number; revenue: number; category: string }[];
  categoryPerformance: { name: string; revenue: number }[];
  stockPredictions: {
    id: string; name: string; category: string;
    stock: number; avgDailySales: number; daysRemaining: number | null;
  }[];
};

type DashboardViewProps = {
  stats: StatsType;
  categoryCount: number;
};

const PERIOD_LABELS: Record<Period, string> = { today: 'Today', week: 'This Week', month: 'This Month' };
const CHART_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

function fmt(n: number) {
  return `Rs. ${n.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

function urgencyColor(days: number | null) {
  if (days === null) return 'text-slate-400 bg-slate-50';
  if (days <= 7)  return 'text-red-600 bg-red-50';
  if (days <= 14) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
}

export default function DashboardView({ stats, categoryCount }: DashboardViewProps) {
  const [period, setPeriod] = useState<Period>('week');

  const revenue = period === 'today' ? stats.revenueToday : period === 'week' ? stats.revenueWeek : stats.revenueMonth;
  const salesQty = period === 'today' ? stats.salesToday  : period === 'week' ? stats.salesWeek  : stats.salesMonth;
  const profit   = period === 'today' ? stats.profitToday  : period === 'week' ? stats.profitWeek  : stats.profitMonth;

  const maxRev = Math.max(...stats.salesByDay.map((d) => d.revenue), 1);
  const maxCatRev = Math.max(...stats.categoryPerformance.map((c) => c.revenue), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* ── Period Tabs ── */}
      <div className="flex items-center gap-2">
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              period === p ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Sales', value: salesQty, sub: `units sold ${PERIOD_LABELS[period].toLowerCase()}`, icon: TrendingUp, color: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 text-indigo-600' },
          { label: 'Revenue',     value: fmt(revenue),   sub: PERIOD_LABELS[period], icon: DollarSign,  color: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600' },
          { label: 'Profit', value: fmt(profit), sub: 'Actual profit', icon: Zap, color: 'from-violet-500 to-violet-600', light: 'bg-violet-50 text-violet-600' },
          { label: 'Low Stock',   value: stats.lowStock,  sub: 'products need restock', icon: AlertTriangle, color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-600' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.light}`}>
                <card.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Sales Over Time */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="text-indigo-500" size={18} />
            <h3 className="font-semibold text-slate-700">Sales Over Time</h3>
            <span className="ml-auto text-xs text-slate-400">Mon - Sun</span>
          </div>
          <div className="h-48 flex items-end gap-2">
            {stats.salesByDay.map((day, i) => {
              const pct = maxRev > 0 ? (day.revenue / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex-1 h-full flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex-1 flex items-end justify-center">
                    {day.revenue > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {fmt(day.revenue)}
                      </div>
                    )}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 2)}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-indigo-300"
                    />
                  </div>
                  <span className="text-xs text-slate-400">{day.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="text-emerald-500" size={18} />
            <h3 className="font-semibold text-slate-700">Category Revenue</h3>
          </div>
          <div className="space-y-3">
            {stats.categoryPerformance.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No sales data yet</p>
            ) : (
              stats.categoryPerformance.slice(0, 6).map((cat, i) => {
                const pct = (cat.revenue / maxCatRev) * 100;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                      <span className="text-slate-400">{fmt(cat.revenue)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Top Products + Low Stock + AI Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top & Least Selling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-indigo-500" size={18} />
            <h3 className="font-semibold text-slate-700">Demand Insights</h3>
          </div>

          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ArrowUp size={12} /> Most Sold
          </p>
          <div className="space-y-2 mb-4">
            {stats.topSelling.length === 0 ? (
              <p className="text-xs text-slate-400">No data</p>
            ) : stats.topSelling.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                  <span className="text-sm text-slate-700 truncate max-w-[130px]">{p.name}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{p.qty} pcs</span>
              </div>
            ))}
          </div>

          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ArrowDown size={12} /> Least Sold
          </p>
          <div className="space-y-2">
            {stats.leastSelling.length === 0 ? (
              <p className="text-xs text-slate-400">No data</p>
            ) : stats.leastSelling.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                  <span className="text-sm text-slate-700 truncate max-w-[130px]">{p.name}</span>
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{p.qty} pcs</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-amber-500" size={18} />
            <h3 className="font-semibold text-slate-700">Low Stock Alert</h3>
            {stats.lowStock > 0 && (
              <span className="ml-auto text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{stats.lowStock}</span>
            )}
          </div>
          <div className="space-y-2.5">
            {stats.lowStockList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-sm text-slate-400">All products well-stocked</p>
              </div>
            ) : stats.lowStockList.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.category}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  p.stock === 0 ? 'text-red-700 bg-red-100' : p.stock < 5 ? 'text-orange-700 bg-orange-100' : 'text-amber-700 bg-amber-100'
                }`}>
                  {p.stock === 0 ? 'Out' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Stock Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="text-violet-500" size={18} />
            <h3 className="font-semibold text-slate-700">Stock Predictions</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Days until stockout based on avg daily sales</p>
          <div className="space-y-2.5">
            {stats.stockPredictions.filter(p => p.daysRemaining !== null).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Not enough sales data yet</p>
            ) : stats.stockPredictions.filter(p => p.daysRemaining !== null).slice(0, 7).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.avgDailySales}/day avg</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${urgencyColor(p.daysRemaining)}`}>
                  <Clock size={10} />
                  {p.daysRemaining}d
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}