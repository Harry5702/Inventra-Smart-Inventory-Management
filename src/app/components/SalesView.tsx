'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Pencil, Trash2, Check, X, TrendingUp, Store, Download, Calendar } from 'lucide-react';
import DailySalesReportPDF, { DailyReportItem } from './DailySalesReportPDF';
import { ShopOrder } from '../types';

type Transaction = {
  id: number;
  displayId: string;
  product: string;
  productId: number;
  qty: number;
  unitPrice: number;
  costPrice: number;
  total: number;
  profit: number;
  date: string;
  rawDate: string;
};

type SalesViewProps = {
  transactions: Transaction[];
  orders?: ShopOrder[]; // Orders added to show combined view
  onEditSale: (saleId: number, newQuantity: number) => void;
  onDeleteSale: (saleId: number) => void;
};

// Unified item type for displaying in the list
type UnifiedTransaction = {
  isOrder: boolean;
  id: string; // string so it can handle string or number
  displayId: string;
  detail: string;
  qty: number;
  unitPrice?: number;
  total: number;
  profit: number;
  dateStr: string; // localized string YYYY-MM-DD
  rawDate: string; // original timestamp for sorting
  originalTrx?: Transaction;
};

const getLocalDateStr = (d: string | Date) => {
  const dateObj = new Date(d);
  const offset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - offset).toISOString().split('T')[0];
};

export default function SalesView({ transactions, orders = [], onEditSale, onDeleteSale }: SalesViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // PDF Report Date
  const [reportDate, setReportDate] = useState(getLocalDateStr(new Date()));

  const startEdit = (trx: Transaction) => { setEditingId(trx.id); setEditQty(String(trx.qty)); };
  const cancelEdit = () => { setEditingId(null); setEditQty(''); };
  const saveEdit = (id: number) => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty <= 0) { alert('Please enter a valid quantity'); return; }
    onEditSale(id, qty);
    setEditingId(null); setEditQty('');
  };

  const activeOrders = orders.filter(o => !o.isArchived);

  // Combine and sort all items
  const unifiedItems = useMemo<UnifiedTransaction[]>(() => {
    const retail: UnifiedTransaction[] = transactions.map(t => ({
      isOrder: false,
      id: String(t.id),
      displayId: t.displayId,
      detail: t.product,
      qty: t.qty,
      unitPrice: t.unitPrice,
      total: t.total,
      profit: t.profit,
      dateStr: getLocalDateStr(t.rawDate),
      rawDate: t.rawDate,
      originalTrx: t
    }));

    const shopOrders: UnifiedTransaction[] = activeOrders.map(o => ({
      isOrder: true,
      id: String(o.id),
      displayId: `#ORD-${String(o.id).padStart(3, '0')}`,
      detail: `Shop: ${o.shopName}`,
      qty: o.items.reduce((sum, item) => sum + item.quantity, 0),
      total: o.totalPrice,
      profit: o.totalProfit,
      dateStr: getLocalDateStr(o.createdAt),
      rawDate: o.createdAt
    }));

    return [...retail, ...shopOrders].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
  }, [transactions, activeOrders]);

  const totalRevenue = unifiedItems.reduce((s, t) => s + t.total, 0);
  const totalProfit  = unifiedItems.reduce((s, t) => s + t.profit, 0);

  // Filter for Daily PDF Report
  const dailyReportItems = useMemo<DailyReportItem[]>(() => {
    const filtered = unifiedItems.filter(u => u.dateStr === reportDate);
    return filtered.map(u => ({
      id: u.id,
      type: u.isOrder ? 'Shop Order' : 'Retail',
      detail: u.detail,
      qty: u.qty,
      total: u.total,
      profit: u.profit
    }));
  }, [unifiedItems, reportDate]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const doc = <DailySalesReportPDF date={reportDate} items={dailyReportItems} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Daily_Sales_Report_${reportDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales & Orders</h2>
          <p className="text-sm text-slate-500">Track your retail transactions and wholesale orders</p>
        </div>
        
        {unifiedItems.length > 0 && (
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-slate-400">Total Revenue</span>
              <span className="ml-2 font-bold text-slate-800">Rs. {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-emerald-600">Total Profit</span>
              <span className="ml-2 font-bold text-emerald-800">Rs. {totalProfit.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Report Section */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-indigo-600 shadow-sm">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Daily Sales Report</h3>
            <p className="text-xs text-slate-500">Download a PDF summary of all sales and orders for a specific day</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="date" 
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1 md:flex-none"
          />
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm flex-1 md:flex-none whitespace-nowrap ${
              isGeneratingPDF 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {unifiedItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No sales or orders yet</div>
          ) : (
            unifiedItems.map((trx, i) => (
              <motion.div
                key={`${trx.isOrder ? 'order' : 'retail'}-${trx.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                {/* Left: icon + product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${trx.isOrder ? 'bg-violet-50' : 'bg-blue-50'}`}>
                    {trx.isOrder ? <Store className="text-violet-500" size={18} /> : <ShoppingCart className="text-blue-500" size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{trx.detail}</p>
                    <p className="text-xs text-slate-400">{trx.displayId} · {new Date(trx.rawDate).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Right: amounts + actions */}
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  {!trx.isOrder && editingId === Number(trx.id) && trx.originalTrx ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-500">Qty:</label>
                          <input
                            type="number" min={1} value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                            autoFocus
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Total: Rs. {(trx.originalTrx.unitPrice * parseInt(editQty || '0')).toLocaleString()}
                        </p>
                      </div>
                      <button onClick={() => saveEdit(Number(trx.id))} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save">
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Profit badge */}
                      <div className="text-right hidden sm:block">
                        <div className={`flex items-center gap-1 text-xs font-semibold justify-end ${trx.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          <TrendingUp size={12} />
                          {trx.profit >= 0 ? '+' : ''}Rs. {trx.profit.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400">profit</p>
                      </div>
                      {/* Revenue */}
                      <div className="text-right w-24">
                        <p className="font-semibold text-slate-800">Rs. {trx.total.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">
                          {trx.qty} {trx.isOrder ? 'items' : `pcs @ Rs. ${trx.unitPrice}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 w-[72px] justify-end">
                        {!trx.isOrder ? (
                          <>
                            <button onClick={() => trx.originalTrx && startEdit(trx.originalTrx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit retail sale">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => onDeleteSale(Number(trx.id))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete retail sale">
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="text-xs font-semibold px-2 py-1 bg-violet-100 text-violet-700 rounded-lg">
                            Wholesale
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}