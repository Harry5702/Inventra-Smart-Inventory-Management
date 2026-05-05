'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Pencil, Trash2, Check, X, TrendingUp } from 'lucide-react';

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
};

type SalesViewProps = {
  transactions: Transaction[];
  onEditSale: (saleId: number, newQuantity: number) => void;
  onDeleteSale: (saleId: number) => void;
};

export default function SalesView({ transactions, onEditSale, onDeleteSale }: SalesViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');

  const startEdit = (trx: Transaction) => { setEditingId(trx.id); setEditQty(String(trx.qty)); };
  const cancelEdit = () => { setEditingId(null); setEditQty(''); };
  const saveEdit = (id: number) => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty <= 0) { alert('Please enter a valid quantity'); return; }
    onEditSale(id, qty);
    setEditingId(null); setEditQty('');
  };

  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);
  const totalProfit  = transactions.reduce((s, t) => s + t.profit, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Sales</h2>
        {transactions.length > 0 && (
          <div className="flex gap-4 text-sm">
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No sales yet</div>
          ) : (
            transactions.map((trx, i) => (
              <motion.div
                key={trx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                {/* Left: icon + product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="text-blue-500" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{trx.product}</p>
                    <p className="text-xs text-slate-400">{trx.displayId} · {trx.date}</p>
                  </div>
                </div>

                {/* Right: amounts + actions */}
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  {editingId === trx.id ? (
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
                          Total: Rs. {(trx.unitPrice * parseInt(editQty || '0')).toLocaleString()}
                        </p>
                      </div>
                      <button onClick={() => saveEdit(trx.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save">
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
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold justify-end">
                          <TrendingUp size={12} />
                          Rs. {trx.profit.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400">profit</p>
                      </div>
                      {/* Revenue */}
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">Rs. {trx.total.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">
                          {trx.qty} pcs @ Rs. {trx.unitPrice}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(trx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit sale">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => onDeleteSale(trx.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete sale">
                          <Trash2 size={16} />
                        </button>
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