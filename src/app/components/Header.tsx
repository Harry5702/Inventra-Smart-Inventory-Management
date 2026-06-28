'use client';

import { Menu, Search } from 'lucide-react';
import { Category, Subcategory, SuperCategory, View } from '../types';

type HeaderProps = {
  currentView: View;
  selectedSuperCategory?: SuperCategory | null;
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
};

export default function Header({
  currentView,
  selectedSuperCategory,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">

        {/* Hamburger — visible on mobile only */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Title + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-semibold text-slate-800 capitalize flex-shrink-0">
            {currentView}
          </h2>
          {/* Breadcrumb — hide on very small screens */}
          {(selectedSuperCategory || selectedCategory) && (
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 min-w-0">
              {selectedSuperCategory && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500 truncate max-w-[100px]">{selectedSuperCategory.name}</span>
                </>
              )}
              {selectedCategory && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-600 truncate max-w-[100px]">{selectedCategory.name}</span>
                  {selectedSubcategory && (
                    <>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-600 truncate max-w-[100px]">{selectedSubcategory.name}</span>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 w-36 sm:w-52 md:w-64 transition-all"
          />
        </div>
      </div>
    </header>
  );
}
