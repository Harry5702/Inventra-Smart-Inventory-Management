'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Product } from '../types';

type AddStockModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAdd: (productId: string, amount: number) => Promise<boolean | void> | boolean | void;
};

export default function AddStockModal({ isOpen, product, onClose, onAdd }: AddStockModalProps) {
  const [amount, setAmount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('1');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!product || isSubmitting) return;
    const qty = parseInt(amount, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAdd(product.id, qty);
      if (result !== false) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to add stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stock">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Product</p>
          <p className="font-semibold text-slate-800 mt-1">{product.name}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Current stock: <span className="font-bold text-slate-700">{product.stock} units</span>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quantity to Add
          </label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter quantity"
            autoFocus
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
          />
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm text-emerald-700 font-medium">New Stock Total</span>
          <span className="text-lg font-bold text-emerald-800">
            {product.stock + (parseInt(amount) || 0)} units
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={parseInt(amount || '0', 10) <= 0 || isSubmitting}
          className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Stock'}
        </button>
      </div>
    </Modal>
  );
}
