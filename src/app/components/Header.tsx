'use client';

import { ChevronRight, Search } from 'lucide-react';
import { Category, Subcategory, View } from '../types';

type HeaderProps = {
  currentView: View;
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export default function Header({
  currentView,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">
            {currentView}
          </h2>
          {selectedCategory && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <ChevronRight size={16} />
              <span className="text-slate-600">{selectedCategory.name}</span>
              {selectedSubcategory && (
                <>
                  <ChevronRight size={16} />
                  <span className="text-slate-600">{selectedSubcategory.name}</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 w-64 transition-all"
          />
        </div>
      </div>
    </header>
  );
}