'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Product } from '../types';

type SellProductModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSell: (productId: string, quantity: number, price: number) => Promise<boolean | void> | boolean | void;
};

export default function SellProductModal({ isOpen, product, onClose, onSell }: SellProductModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity('1');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!product || isSubmitting) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (qty > product.stock) {
      alert(`Not enough stock! Available: ${product.stock}`);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await onSell(product.id, qty, product.price);
      if (result !== false) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to sell product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sell Product">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-500">Product</p>
          <p className="font-semibold text-slate-800">{product.name}</p>
          <p className="text-sm text-slate-500 mt-1">
            Available: <span className={product.stock === 0 ? 'text-red-600 font-bold' : product.stock < 5 ? 'text-yellow-600 font-bold' : 'text-green-600 font-bold'}>{product.stock} units</span> @ Rs. {product.price}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
          />
          {parseInt(quantity || '0') > product.stock && (
            <p className="text-xs text-red-500 mt-1">Cannot exceed available stock ({product.stock})</p>
          )}
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm text-blue-700 font-medium">Total</span>
          <span className="text-lg font-bold text-blue-800">
            Rs. {(product.price * parseInt(quantity || '0')).toLocaleString()}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={parseInt(quantity || '0', 10) > product.stock || parseInt(quantity || '0', 10) <= 0 || isSubmitting}
          className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Sale'}
        </button>
      </div>
    </Modal>
  );
}