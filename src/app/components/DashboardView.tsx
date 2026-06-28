'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, AlertTriangle, BarChart3,
  Zap, Package, ArrowUp, ArrowDown, Brain, Clock, RotateCcw, Layers,
} from 'lucide-react';
import { SuperCategory } from '../types';

type Period = 'today' | 'week' | 'month';
type ChartMode = 'revenue' | 'profit';

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
  salesBySuperCat: {
    label: string;
    total: number;
    profit: number;
    segments: { id: string | null; name: string; revenue: number; profit: number }[];
  }[];
  superCategoryRevenue: { id: string | null; name: string; revenue: number; profit: number }[];
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
  superCategories: SuperCategory[];
  onResetStats: (period?: 'today' | 'week' | 'month') => void;
};

const PERIOD_LABELS: Record<Period, string> = { today: 'Today', week: 'This Week', month: 'This Month' };

// Distinct colors for super categories — new ones added later auto-get a color
const SC_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
];

function getScColor(index: number) {
  return SC_COLORS[index % SC_COLORS.length];
}

function fmt(n: number) {
  return `Rs. ${n.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

function urgencyColor(days: number | null) {
  if (days === null) return 'text-slate-400 bg-slate-50';
  if (days <= 7)  return 'text-red-600 bg-red-50';
  if (days <= 14) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
}

export default function DashboardView({ stats, categoryCount, superCategories, onResetStats }: DashboardViewProps) {
  const [period, setPeriod] = useState<Period>('week');
  const [resetting, setResetting] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>('revenue');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const handleReset = async (p?: 'today' | 'week' | 'month') => {
    const label = p ? { today: 'today\'s', week: 'this week\'s', month: 'this month\'s' }[p] : 'all';
    if (!window.confirm(`Reset ${label} sales stats? Orders will NOT be affected.`)) return;
    setResetting(true);
    await onResetStats(p);
    setResetting(false);
  };

  const revenue  = period === 'today' ? stats.revenueToday : period === 'week' ? stats.revenueWeek : stats.revenueMonth;
  const salesQty = period === 'today' ? stats.salesToday   : period === 'week' ? stats.salesWeek   : stats.salesMonth;
  const profit   = period === 'today' ? stats.profitToday  : period === 'week' ? stats.profitWeek  : stats.profitMonth;

  // Build color index map for super categories (stable across renders)
  const scColorMap = new Map<string | null, number>();
  superCategories.forEach((sc, i) => scColorMap.set(sc.id, i));
  scColorMap.set(null, superCategories.length); // 'Ungrouped' always gets next color

  // Stacked chart max value
  const maxBarValue = Math.max(
    ...stats.salesBySuperCat.map((d) => chartMode === 'revenue' ? d.total : d.profit),
    1
  );

  // Fallback max when no super categories
  const maxRev = Math.max(...stats.salesByDay.map((d) => d.revenue), 1);

  const hasSuperCats = superCategories.length > 0;

  // All unique super cat ids appearing in the data (for legend)
  const legendItems: { id: string | null; name: string; color: string }[] = [];
  const seenLegend = new Set<string | null>();
  stats.salesBySuperCat.forEach((day) =>
    day.segments.forEach((seg) => {
      if (!seenLegend.has(seg.id)) {
        seenLegend.add(seg.id);
        const colorIdx = scColorMap.get(seg.id) ?? seenLegend.size - 1;
        legendItems.push({ id: seg.id, name: seg.name, color: getScColor(colorIdx) });
      }
    })
  );

  const maxScRev = Math.max(...stats.superCategoryRevenue.map((s) => s.revenue), 1);
  const maxScProf = Math.max(...stats.superCategoryRevenue.map((s) => s.profit), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* ── Period Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-start">
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <div key={p} className="flex items-center gap-1">
            <button
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                period === p ? 'bg-slate-800 text-white shadow' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
            {period === p && (
              <button
                onClick={() => handleReset(p)}
                disabled={resetting}
                title={`Reset ${PERIOD_LABELS[p]} sales stats`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
              >
                <RotateCcw size={11} className={resetting ? 'animate-spin' : ''} />
                Reset
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => handleReset()}
          disabled={resetting}
          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
        >
          <RotateCcw size={13} className={resetting ? 'animate-spin' : ''} />
          Reset All Stats
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Sales Over Time — stacked by super category */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="text-indigo-500" size={18} />
            <h3 className="font-semibold text-slate-700">Sales Over Time</h3>
            <span className="text-xs text-slate-400">Mon – Sun</span>

            {/* Revenue / Profit toggle */}
            <div className="ml-auto flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setChartMode('revenue')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  chartMode === 'revenue' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartMode('profit')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  chartMode === 'profit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Profit
              </button>
            </div>
          </div>

          {/* Legend */}
          {hasSuperCats && legendItems.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
              {legendItems.map((item) => (
                <div key={String(item.id)} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-500">{item.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stacked bar chart */}
          <div className="h-36 sm:h-48 flex items-end gap-1 sm:gap-2">
            {hasSuperCats
              ? stats.salesBySuperCat.map((day, i) => {
                  const dayValue = chartMode === 'revenue' ? day.total : day.profit;
                  const barPct = maxBarValue > 0 ? (dayValue / maxBarValue) * 100 : 0;
                  const isHovered = hoveredDay === i;

                  return (
                    <div
                      key={i}
                      className="flex-1 h-full flex flex-col items-center gap-1 group cursor-default"
                      onMouseEnter={() => setHoveredDay(i)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div className="relative w-full flex-1 flex items-end justify-center">
                        {/* Tooltip */}
                        {isHovered && dayValue > 0 && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 bg-slate-800 text-white text-xs rounded-xl p-2.5 shadow-xl min-w-[130px] pointer-events-none">
                            <p className="font-semibold mb-1.5 text-slate-200">{day.label}</p>
                            {day.segments.map((seg) => {
                              const colorIdx = scColorMap.get(seg.id) ?? legendItems.findIndex(l => l.id === seg.id);
                              return (
                                <div key={String(seg.id)} className="flex items-center justify-between gap-3 mb-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: getScColor(colorIdx) }} />
                                    <span className="text-slate-300 truncate max-w-[70px]">{seg.name}</span>
                                  </div>
                                  <span className="font-semibold text-white whitespace-nowrap">
                                    {fmt(chartMode === 'revenue' ? seg.revenue : seg.profit)}
                                  </span>
                                </div>
                              );
                            })}
                            <div className="border-t border-slate-600 mt-1.5 pt-1 flex justify-between">
                              <span className="text-slate-400">Total</span>
                              <span className="font-bold">{fmt(dayValue)}</span>
                            </div>
                          </div>
                        )}

                        {/* Bar */}
                        {dayValue > 0 ? (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(barPct, 4)}%` }}
                            transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
                            className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse"
                            style={{ height: `${Math.max(barPct, 4)}%` }}
                          >
                            {day.segments.map((seg) => {
                              const segValue = chartMode === 'revenue' ? seg.revenue : seg.profit;
                              const segPct = dayValue > 0 ? (segValue / dayValue) * 100 : 0;
                              const colorIdx = scColorMap.get(seg.id) ?? legendItems.findIndex(l => l.id === seg.id);
                              return (
                                <div
                                  key={String(seg.id)}
                                  style={{
                                    height: `${segPct}%`,
                                    backgroundColor: getScColor(colorIdx),
                                    minHeight: segValue > 0 ? 2 : 0,
                                  }}
                                  className="w-full flex-shrink-0"
                                />
                              );
                            })}
                          </motion.div>
                        ) : (
                          <div className="w-full rounded-t-lg bg-slate-100" style={{ height: '4%' }} />
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{day.label}</span>
                    </div>
                  );
                })
              : /* Fallback: no super categories — show original single-color bars */
                stats.salesByDay.map((day, i) => {
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
                })
            }
          </div>

          {/* No super categories hint */}
          {!hasSuperCats && (
            <p className="text-xs text-slate-300 text-center mt-3">
              Create super categories to see per-group breakdown
            </p>
          )}
        </motion.div>

        {/* Super Category Revenue / Profit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-5">
            <Layers className="text-violet-500" size={18} />
            <h3 className="font-semibold text-slate-700">Super Category</h3>
          </div>

          {stats.superCategoryRevenue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Layers size={28} className="text-slate-200" />
              <p className="text-sm text-slate-400 text-center">
                {hasSuperCats ? 'No sales data yet' : 'No super categories yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.superCategoryRevenue.map((sc, i) => {
                const colorIdx = scColorMap.get(sc.id) ?? i;
                const color = getScColor(colorIdx);
                const revPct = (sc.revenue / maxScRev) * 100;
                const profPct = (sc.profit / maxScProf) * 100;
                return (
                  <div key={String(sc.id)}>
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-slate-700 truncate">{sc.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{fmt(sc.revenue)}</span>
                    </div>
                    {/* Revenue bar */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${revPct}%` }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    {/* Profit bar (lighter shade) */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${profPct}%` }}
                          transition={{ delay: 0.55 + i * 0.08, duration: 0.5 }}
                          className="h-full rounded-full opacity-50"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <span className="text-xs text-slate-300 ml-2 whitespace-nowrap">+{fmt(sc.profit)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-1 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2 bg-slate-400 rounded-sm" />
                  <span className="text-xs text-slate-400">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 bg-slate-300 rounded-sm opacity-50" />
                  <span className="text-xs text-slate-400">Profit</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Row: Top Products + Low Stock + AI Insights ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

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
            ) : stats.lowStockList.map((p) => (
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
            ) : stats.stockPredictions.filter(p => p.daysRemaining !== null).slice(0, 7).map((p) => (
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
