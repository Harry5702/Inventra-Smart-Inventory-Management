'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Store, Trash2, Pencil, X, Check,
  ChevronDown, Package, Calendar, Clock, Search, TrendingUp, Download, FileText
} from 'lucide-react';
import { Category, ShopOrder, OrderItem } from '../types';
import BillPDF from './BillPDF';

type OrdersViewProps = {
  categories: Category[];
  orders: ShopOrder[];
  onAddOrder: (order: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditOrder: (id: string, updates: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteOrder: (id: string) => void;
};

function fmt(n: number) {
  return `Rs. ${n.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Order Form ───────────────────────────────────────────────────── */
type ProductOption = {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  category: string;
  subcategory: string;
  stock: number;
};

type OrderFormProps = {
  categories: Category[];
  initial?: ShopOrder;
  onSave: (data: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
};

function OrderForm({ categories, initial, onSave, onCancel }: OrderFormProps) {
  const [shopName, setShopName] = useState(initial?.shopName ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [items, setItems] = useState<OrderItem[]>(initial?.items ?? []);
  const [productSearch, setProductSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Flatten all products — only include those with stock > 0
  const allProducts = useMemo<ProductOption[]>(() => {
    const list: ProductOption[] = [];
    categories.forEach((cat) =>
      cat.subcategories.forEach((sub) =>
        sub.products.forEach((prod) => {
          if (prod.stock > 0) {           // ← Only in-stock items
            list.push({
              id: prod.id,
              name: prod.name,
              price: prod.price,
              costPrice: prod.costPrice,  // ← pass costPrice
              category: cat.name,
              subcategory: sub.name,
              stock: prod.stock,
            });
          }
        })
      )
    );
    return list;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  const selectedIds = new Set(items.map((i) => i.productId));

  const addItem = (prod: ProductOption) => {
    if (selectedIds.has(prod.id)) return;
    setItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        unitPrice: prod.price,
        costPrice: prod.costPrice,
        quantity: 1,
        subtotal: prod.price,
        profit: prod.price - prod.costPrice,
      },
    ]);
    setProductSearch('');
    setDropdownOpen(false);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const q = Math.max(1, qty);
        return {
          ...i,
          quantity: q,
          subtotal: q * i.unitPrice,
          profit: q * (i.unitPrice - i.costPrice),
        };
      })
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const p = Math.max(0, price);
        return {
          ...i,
          unitPrice: p,
          subtotal: i.quantity * p,
          profit: i.quantity * (p - i.costPrice),
        };
      })
    );
  };

  const totalPrice  = items.reduce((sum, i) => sum + i.subtotal, 0);
  const totalProfit = items.reduce((sum, i) => sum + i.profit, 0);

  const handleSave = () => {
    if (!shopName.trim()) {
      alert('Please enter a shop name.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item to the order.');
      return;
    }
    onSave({ shopName: shopName.trim(), items, totalPrice, totalProfit, notes: notes.trim(), isArchived: initial?.isArchived ?? false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <ClipboardList size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            {initial ? 'Edit Order' : 'New Shop Order'}
          </h2>
          <button
            onClick={onCancel}
            className="ml-auto p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Shop name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Shop Name *
            </label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Store size={16} className="text-slate-400 flex-shrink-0" />
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Al-Madina Store"
                className="flex-1 outline-none text-slate-800 placeholder-slate-400 text-sm bg-transparent"
              />
            </div>
          </div>

          {/* Product picker — only in-stock products */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Add Items * <span className="text-emerald-500 normal-case font-normal">(in-stock only)</span>
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search products..."
                  className="flex-1 outline-none text-slate-800 placeholder-slate-400 text-sm bg-transparent"
                />
                <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
              </div>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto"
                  >
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-5 text-center text-sm text-slate-400">
                        No in-stock products found
                      </div>
                    ) : (
                      filteredProducts.map((prod) => {
                        const already = selectedIds.has(prod.id);
                        return (
                          <button
                            key={prod.id}
                            onClick={() => !already && addItem(prod)}
                            disabled={already}
                            className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-indigo-50 transition-colors ${already ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-700">{prod.name}</p>
                              <p className="text-xs text-slate-400">{prod.category} › {prod.subcategory}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-indigo-600">{fmt(prod.price)}</p>
                              <p className="text-xs text-emerald-500">{prod.stock} in stock</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Click-away */}
              {dropdownOpen && (
                <div className="fixed inset-0 z-[5]" onClick={() => setDropdownOpen(false)} />
              )}
            </div>
          </div>

          {/* Items table */}
          {items.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Qty</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Unit Price</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Subtotal</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider w-24">Profit</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{item.productName}</p>
                        <p className="text-xs text-slate-400">Cost: {fmt(item.costPrice)}/unit</p>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                          className="w-16 text-center border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => updatePrice(item.productId, Number(e.target.value))}
                          className="w-24 text-center border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                        />
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-700">
                        {fmt(item.subtotal)}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold text-sm ${item.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.profit >= 0 ? '+' : ''}{fmt(item.profit)}
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-indigo-700 uppercase tracking-wider">
                      Total
                    </td>
                    <td className="px-3 py-3 text-right text-base font-bold text-indigo-700">
                      {fmt(totalPrice)}
                    </td>
                    <td className={`px-4 py-3 text-right text-base font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {totalProfit >= 0 ? '+' : ''}{fmt(totalProfit)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special instructions or remarks..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {initial ? 'Save Changes' : 'Create Order'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main View ────────────────────────────────────────────────────── */
export default function OrdersView({
  categories,
  orders,
  onAddOrder,
  onEditOrder,
  onDeleteOrder,
}: OrdersViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ShopOrder | null>(null);

  // PDF Generation State
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => o.shopName.toLowerCase().includes(q));
  }, [orders, searchQuery]);

  const handleSaveNew = (data: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    onAddOrder(data);
    setShowForm(false);
  };

  const handleSaveEdit = (data: Omit<ShopOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingOrder) return;
    onEditOrder(editingOrder.id, data);
    setEditingOrder(null);
  };

  const handleDownloadPDF = async (order: ShopOrder) => {
    setGeneratingPdfId(order.id);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const doc = (
        <BillPDF
          shopName={order.shopName}
          date={order.createdAt}
          items={order.items.map(item => ({
            name: item.productName,
            qty: item.quantity,
            price: item.unitPrice
          }))}
          notes={order.notes}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bill_${order.shopName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shop Orders</h2>
          <p className="text-sm text-slate-400 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search size={15} className="text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops..."
              className="outline-none text-sm text-slate-700 placeholder-slate-400 w-44 bg-transparent"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={16} />
            New Order
          </button>
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="p-5 rounded-2xl bg-slate-100 mb-4">
            <ClipboardList size={36} className="text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-slate-600">
            {searchQuery ? 'No orders found' : 'No orders yet'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {searchQuery ? 'Try a different shop name' : 'Create your first shop order above'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence>
            {filtered.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50">
                      <Store size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{order.shopName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Package size={10} />
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadPDF(order)}
                      disabled={generatingPdfId === order.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                      title="Download Bill PDF"
                    >
                      {generatingPdfId === order.id ? (
                        <div className="animate-spin w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent" />
                      ) : (
                        <Download size={15} />
                      )}
                    </button>

                    <button
                      onClick={() => setEditingOrder(order)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Order"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete order for "${order.shopName}"?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 pb-4 space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-sm gap-2">
                      <span className="text-slate-600 truncate max-w-[45%]">{item.productName}</span>
                      <span className="text-slate-400 text-xs whitespace-nowrap">×{item.quantity} @ {fmt(item.unitPrice)}</span>
                      <span className="font-semibold text-slate-700 whitespace-nowrap">{fmt(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="px-5 pb-3">
                    <p className="text-xs text-slate-400 italic">{order.notes}</p>
                  </div>
                )}

                {/* Footer — total + profit */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={10} />
                        {fmtDate(order.createdAt)}
                      </span>
                      {order.updatedAt !== order.createdAt && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={10} />
                          Updated {fmtDate(order.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Profit badge */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                          <TrendingUp size={10} className="text-emerald-500" />
                          Profit
                        </p>
                        <p className={`text-sm font-bold ${order.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {order.totalProfit >= 0 ? '+' : ''}{fmt(order.totalProfit)}
                        </p>
                      </div>
                      {/* Divider */}
                      <div className="w-px h-8 bg-slate-200" />
                      {/* Total */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="text-lg font-bold text-indigo-700">{fmt(order.totalPrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Order form */}
      <AnimatePresence>
        {showForm && (
          <OrderForm
            categories={categories}
            onSave={handleSaveNew}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editingOrder && (
          <OrderForm
            categories={categories}
            initial={editingOrder}
            onSave={handleSaveEdit}
            onCancel={() => setEditingOrder(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
