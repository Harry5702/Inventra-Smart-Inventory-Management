'use client';

import { useState } from 'react';
import Modal from './Modal';

type AddSubcategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
};

export default function AddSubcategoryModal({ isOpen, onClose, onAdd }: AddSubcategoryModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name);
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Subcategory">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Subcategory Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Premium"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
        >
          Create Subcategory
        </button>
      </div>
    </Modal>
  );
}