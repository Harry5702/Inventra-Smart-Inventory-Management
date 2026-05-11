'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Product } from '../types';

type EditProductModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit: (productId: string, name: string, sellingPrice: number, costPrice: number) => void;
};

export default function EditProductModal({ isOpen, product, onClose, onEdit }: EditProductModalProps) {
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name);
      setSellingPrice(String(product.price));
      setCostPrice(String(product.costPrice));
    }
  }, [product, isOpen]);

  const sp = Number(sellingPrice) || 0;
  const cp = Number(costPrice) || 0;
  const margin = sp > 0 ? Math.round(((sp - cp) / sp) * 100) : 0;
  const profitPerUnit = sp - cp;

  const handleSubmit = () => {
    if (!product) return;
    if (!name.trim()) { alert('Please enter a product name'); return; }
    if (sp <= 0) { alert('Please enter a valid selling price'); return; }
    if (cp < 0)  { alert('Purchase price cannot be negative'); return; }
    onEdit(product.id, name.trim(), sp, cp);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Product">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Snack Pack"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (Rs.)</label>
            <input
              type="number"
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (Rs.)</label>
            <input
              type="number"
              min={0}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
            />
          </div>
        </div>

        {/* Live profit preview */}
        {sp > 0 && (
          <div className={`rounded-xl p-3 flex justify-between items-center text-sm ${
            profitPerUnit >= 0 ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            <span className={profitPerUnit >= 0 ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'}>
              Profit / unit
            </span>
            <div className="text-right">
              <span className={`font-bold ${profitPerUnit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                Rs. {profitPerUnit.toLocaleString()}
              </span>
              <span className={`ml-2 text-xs ${profitPerUnit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ({margin}% margin)
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
