'use client';

import { motion } from 'framer-motion';
import { Category, Product } from '../types';
import { Minus, Plus, Package, Search } from 'lucide-react';
import { useState } from 'react';

type InventoryViewProps = {
  categories: Category[];
  onOpenAddStockModal: (product: Product) => void;
  onOpenSellModal: (product: Product) => void;
};

export default function InventoryView({ categories, onOpenAddStockModal, onOpenSellModal }: InventoryViewProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in' | 'low' | 'out'>('all');

  const allProducts = categories.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.products.map((prod) => ({
        ...prod,
        categoryName: cat.name,
        categoryId: cat.id,
        subcategoryName: sub.name,
      }))
    )
  );

  const filtered = allProducts.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategoryName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'out' && p.stock === 0) ||
      (filterStatus === 'low' && p.stock > 0 && p.stock < 10) ||
      (filterStatus === 'in' && p.stock >= 10);
    return matchSearch && matchCat && matchStatus;
  });

  const totalStock = allProducts.reduce((s, p) => s + p.stock, 0);
  const outOfStock  = allProducts.filter((p) => p.stock === 0).length;
  const lowStock    = allProducts.filter((p) => p.stock > 0 && p.stock < 10).length;
  const inStock     = allProducts.filter((p) => p.stock >= 10).length;

  const badgeClass = (stock: number) => {
    if (stock === 0) return 'text-red-700 bg-red-100';
    if (stock < 10)  return 'text-amber-700 bg-amber-100';
    return 'text-emerald-700 bg-emerald-100';
  };
  const badgeText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10)  return 'Low Stock';
    return 'In Stock';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: allProducts.length, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'In Stock',       value: inStock,            color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Low Stock',      value: lowStock,           color: 'bg-amber-50 text-amber-700' },
          { label: 'Out of Stock',   value: outOfStock,         color: 'bg-red-50 text-red-700' },
        ].map((t) => (
          <div key={t.label} className={`rounded-2xl p-4 ${t.color} flex flex-col gap-1`}>
            <span className="text-2xl font-bold">{t.value}</span>
            <span className="text-xs font-medium opacity-80">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {(['all', 'in', 'low', 'out'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'All' : s === 'in' ? 'In Stock' : s === 'low' ? 'Low' : 'Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Product</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Price</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Stock</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Package className="mx-auto mb-2 text-slate-300" size={32} />
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((prod, i) => (
                  <motion.tr
                    key={prod.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">{prod.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {prod.categoryName}
                      <span className="text-slate-300 mx-1">/</span>
                      {prod.subcategoryName}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">Rs. {prod.price.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{prod.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeClass(prod.stock)}`}>
                        {badgeText(prod.stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenAddStockModal(prod)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-semibold"
                        >
                          <Plus size={13} /> Add Stock
                        </button>
                        <button
                          onClick={() => onOpenSellModal(prod)}
                          disabled={prod.stock === 0}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={13} /> Sell
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>Showing {filtered.length} of {allProducts.length} products</span>
            <span>Total stock units: <strong className="text-slate-600">{totalStock}</strong></span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
