'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes, Grid3X3, ChevronRight, Plus, ArrowLeft, Package, Minus, Trash2, Pencil,
  Users, Clock, Cookie, Zap, Droplet, Disc, Leaf, Gift, Flame, Star, MoreHorizontal,
  Layers, MoveRight,
} from 'lucide-react';
import { Category, Subcategory, Product, SuperCategory, ModalType } from '../types';

type CategoriesViewProps = {
  categories: Category[];
  superCategories: SuperCategory[];
  selectedSuperCategory: SuperCategory | null;
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  searchQuery: string;
  onSuperCategoryClick: (sc: SuperCategory) => void;
  onAddSuperCategory: (name: string) => void;
  onEditSuperCategory: (id: string, newName: string) => void;
  onDeleteSuperCategory: (id: string) => void;
  onMoveCategory: (categoryId: string, superCategoryId: string | null) => void;
  onCategoryClick: (cat: Category) => void;
  onSubcategoryClick: (sub: Subcategory) => void;
  onGoBack: () => void;
  onOpenModal: (modal: ModalType) => void;
  onOpenEditModal: (product: Product) => void;
  onOpenSellModal: (product: Product) => void;
  onOpenAddStockModal: (product: Product) => void;
  onEditCategory: (id: string, newName: string) => void;
  onEditSubcategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string) => void;
  onDeleteProduct: (id: string) => void;
};

export default function CategoriesView({
  categories,
  superCategories,
  selectedSuperCategory,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onSuperCategoryClick,
  onAddSuperCategory,
  onEditSuperCategory,
  onDeleteSuperCategory,
  onMoveCategory,
  onCategoryClick,
  onSubcategoryClick,
  onGoBack,
  onOpenModal,
  onOpenEditModal,
  onOpenSellModal,
  onOpenAddStockModal,
  onEditCategory,
  onEditSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
  onDeleteProduct,
}: CategoriesViewProps) {
  const [movingCategoryId, setMovingCategoryId] = useState<string | null>(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    if (!movingCategoryId) return;
    const close = () => setMovingCategoryId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [movingCategoryId]);

  // Derive visible categories based on context
  const ungroupedCategories = categories.filter((c) => !c.superCategoryId);
  const categoriesInSuperCat = selectedSuperCategory
    ? categories.filter((c) => c.superCategoryId === selectedSuperCategory.id)
    : [];

  const filteredCategories = selectedSuperCategory
    ? categoriesInSuperCat.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : ungroupedCategories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredSuperCategories = superCategories.filter((sc) =>
    sc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'border-red-500 bg-red-50';
    if (stock < 5) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-white';
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Out of Stock</span>;
    if (stock < 5) return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Low Stock</span>;
    return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">In Stock</span>;
  };

  const getDynamicIcon = (name: string, type: 'category' | 'subcategory' | 'product') => {
    const n = name.toLowerCase();
    const className = type === 'category'
      ? 'text-blue-600 w-8 h-8'
      : type === 'subcategory'
      ? 'text-emerald-600 w-8 h-8'
      : 'text-slate-600 w-8 h-8';

    if (n.includes('friend')) return <Users className={className} />;
    if (n.includes('time')) return <Clock className={className} />;
    if (n.includes('choco')) return <Cookie className={className} />;
    if (n.includes('aktiv')) return <Zap className={className} />;
    if (n.includes('butter')) return <Droplet className={className} />;
    if (n.includes('peanut') || n.includes('dip') || n.includes('chip')) return <Disc className={className} />;
    if (n.includes('zeera') || n.includes('lemon') || n.includes('vanilla') || n.includes('strawberry')) return <Leaf className={className} />;
    if (n.includes('vittle')) return <Gift className={className} />;
    if (n.includes('nimko')) return <Flame className={className} />;
    if (n.includes('classic')) return <Star className={className} />;
    if (n.includes('more')) return <MoreHorizontal className={className} />;

    if (type === 'category') return <Boxes className={className} />;
    if (type === 'subcategory') return <Grid3X3 className={className} />;
    return <Package className={className} />;
  };

  // Page title & subtitle
  const pageTitle = selectedSubcategory
    ? selectedSubcategory.name
    : selectedCategory
    ? selectedCategory.name
    : selectedSuperCategory
    ? selectedSuperCategory.name
    : 'Categories';

  const pageSubtitle = selectedSubcategory
    ? 'Manage products in this subcategory'
    : selectedCategory
    ? 'Select a subcategory'
    : selectedSuperCategory
    ? 'Categories in this group'
    : 'Manage super categories and categories';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{pageTitle}</h2>
          <p className="text-slate-500 text-sm mt-1">{pageSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(selectedCategory || selectedSuperCategory) && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {/* Products level */}
          {selectedSubcategory && (
            <button
              onClick={() => onOpenModal('addProduct')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add Product
            </button>
          )}
          {/* Subcategories level */}
          {!selectedSubcategory && selectedCategory && (
            <button
              onClick={() => onOpenModal('addSubcategory')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add Subcategory
            </button>
          )}
          {/* Categories level (inside a super cat) */}
          {!selectedCategory && selectedSuperCategory && (
            <button
              onClick={() => onOpenModal('addCategory')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add Category
            </button>
          )}
          {/* Top level */}
          {!selectedCategory && !selectedSuperCategory && (
            <>
              <button
                onClick={() => {
                  const name = window.prompt('Enter super category name:');
                  if (name && name.trim()) onAddSuperCategory(name.trim());
                }}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                <Plus size={16} />
                Add Super Category
              </button>
              <button
                onClick={() => onOpenModal('addCategory')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                <Plus size={16} />
                Add Category
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── TOP LEVEL: Super Categories + Ungrouped ── */}
        {!selectedCategory && !selectedSuperCategory ? (
          <motion.div
            key="top-level"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Super Categories Section */}
            {filteredSuperCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers size={18} className="text-violet-500" />
                  <h3 className="text-base font-semibold text-slate-700">Super Categories</h3>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    {filteredSuperCategories.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSuperCategories.map((sc, i) => {
                    const childCount = categories.filter((c) => c.superCategoryId === sc.id).length;
                    return (
                      <motion.div
                        key={sc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSuperCategoryClick(sc)}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-violet-200 transition-all group relative"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center group-hover:from-violet-100 group-hover:to-purple-100 transition-colors">
                            <Layers className="text-violet-600 w-8 h-8" />
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newName = window.prompt('Enter new super category name:', sc.name);
                                if (newName && newName.trim() !== '' && newName !== sc.name) {
                                  onEditSuperCategory(sc.id, newName.trim());
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit super category"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Delete "${sc.name}"?\n\nCategories inside will become ungrouped — no data will be lost.`
                                  )
                                ) {
                                  onDeleteSuperCategory(sc.id);
                                }
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete super category"
                            >
                              <Trash2 size={16} />
                            </button>
                            <ChevronRight
                              className="text-slate-300 group-hover:text-violet-500 transition-colors"
                              size={20}
                            />
                          </div>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-lg">{sc.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{childCount} categories</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ungrouped Categories Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Boxes size={18} className="text-blue-500" />
                <h3 className="text-base font-semibold text-slate-700">
                  {superCategories.length > 0 ? 'Ungrouped Categories' : 'Categories'}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {filteredCategories.length}
                </span>
              </div>

              {filteredCategories.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  {superCategories.length > 0
                    ? 'All categories are assigned to super categories.'
                    : 'No categories yet.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCategories.map((cat, i) => (
                    <CategoryCard
                      key={cat.id}
                      cat={cat}
                      index={i}
                      superCategories={superCategories}
                      movingCategoryId={movingCategoryId}
                      setMovingCategoryId={setMovingCategoryId}
                      onCategoryClick={onCategoryClick}
                      onEditCategory={onEditCategory}
                      onDeleteCategory={onDeleteCategory}
                      onMoveCategory={onMoveCategory}
                      getDynamicIcon={getDynamicIcon}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        ) : /* ── SUPER CATEGORY DRILL-DOWN: show its categories ── */
        !selectedCategory && selectedSuperCategory ? (
          <motion.div
            key="super-cat-drill"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredCategories.length === 0 ? (
              <p className="text-slate-400 text-sm mt-2">
                No categories in this group yet. Click &quot;Add Category&quot; to add one.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((cat, i) => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    index={i}
                    superCategories={superCategories}
                    movingCategoryId={movingCategoryId}
                    setMovingCategoryId={setMovingCategoryId}
                    onCategoryClick={onCategoryClick}
                    onEditCategory={onEditCategory}
                    onDeleteCategory={onDeleteCategory}
                    onMoveCategory={onMoveCategory}
                    getDynamicIcon={getDynamicIcon}
                  />
                ))}
              </div>
            )}
          </motion.div>

        ) : /* ── SUBCATEGORIES ── */
        !selectedSubcategory ? (
          <motion.div
            key="sub-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {selectedCategory!.subcategories.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSubcategoryClick(sub)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all group relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                    {getDynamicIcon(sub.name, 'subcategory')}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = window.prompt('Enter new subcategory name:', sub.name);
                        if (newName && newName.trim() !== '' && newName !== sub.name) {
                          onEditSubcategory(sub.id, newName.trim());
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit subcategory"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${sub.name}"?\n\nThis will also delete all products and stock inside it.`
                          )
                        ) {
                          onDeleteSubcategory(sub.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete subcategory"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight
                      className="text-slate-300 group-hover:text-emerald-500 transition-colors"
                      size={20}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">{sub.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{sub.products.length} products</p>
              </motion.div>
            ))}
          </motion.div>

        ) : /* ── PRODUCTS ── */
        (
          <motion.div
            key="prod-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {selectedSubcategory.products.map((prod, i) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl p-6 shadow-sm border-2 ${getStockColor(prod.stock)} transition-all relative min-h-[220px] flex flex-col`}
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center shadow-sm border border-slate-100">
                      {getDynamicIcon(prod.name, 'product')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="text-xl font-black text-slate-900 mt-1">
                        Rs. {prod.price}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-1">
                      <button
                        onClick={() => onOpenEditModal(prod)}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete "${prod.name}"?\n\nThis action cannot be undone.`
                            )
                          ) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {getStockBadge(prod.stock)}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <Package size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-600 font-semibold">
                    Stock: {prod.stock} units
                  </span>
                </div>
                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => onOpenSellModal(prod)}
                    disabled={prod.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                    Sell
                  </button>
                  <button
                    onClick={() => onOpenAddStockModal(prod)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-semibold"
                  >
                    <Plus size={16} />
                    Add Stock
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Extracted Category Card ───────────────────────────────────────────────────
type CategoryCardProps = {
  cat: Category;
  index: number;
  superCategories: SuperCategory[];
  movingCategoryId: string | null;
  setMovingCategoryId: (id: string | null) => void;
  onCategoryClick: (cat: Category) => void;
  onEditCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (categoryId: string, superCategoryId: string | null) => void;
  getDynamicIcon: (name: string, type: 'category' | 'subcategory' | 'product') => React.ReactElement;
};

function CategoryCard({
  cat,
  index,
  superCategories,
  movingCategoryId,
  setMovingCategoryId,
  onCategoryClick,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
  getDynamicIcon,
}: CategoryCardProps) {
  const currentSuperCat = superCategories.find((sc) => sc.id === cat.superCategoryId);
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      key={cat.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onCategoryClick(cat)}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group relative flex flex-col"
    >
      {/* Top row: icon + action buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
          {getDynamicIcon(cat.name, 'category')}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newName = window.prompt('Enter new category name:', cat.name);
              if (newName && newName.trim() !== '' && newName !== cat.name) {
                onEditCategory(cat.id, newName.trim());
              }
            }}
            className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit category"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  `Are you sure you want to delete "${cat.name}"?\n\nThis will also delete all subcategories, products, and stock inside it.`
                )
              ) {
                onDeleteCategory(cat.id);
              }
            }}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 size={16} />
          </button>
          <ChevronRight
            className="text-slate-300 group-hover:text-blue-500 transition-colors"
            size={20}
          />
        </div>
      </div>

      {/* Name + subcategory count */}
      <h3 className="font-semibold text-slate-800 text-lg">{cat.name}</h3>
      <p className="text-sm text-slate-400 mt-1 mb-4">
        {cat.subcategories.length} subcategories
      </p>

      {/* Move to Super Category — always visible button */}
      <div
        ref={dropdownRef}
        className="relative mt-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMovingCategoryId(movingCategoryId === cat.id ? null : cat.id);
          }}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            currentSuperCat
              ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers size={14} />
            <span>{currentSuperCat ? currentSuperCat.name : 'Move to Super Category'}</span>
          </div>
          <MoveRight size={14} />
        </button>

        {/* Dropdown */}
        {movingCategoryId === cat.id && (
          <div
            className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-slate-400 font-medium px-2 py-1 mb-1">Assign to group:</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveCategory(cat.id, null);
                setMovingCategoryId(null);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                !cat.superCategoryId
                  ? 'bg-slate-100 text-slate-800 font-semibold'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              None (Ungrouped)
              {!cat.superCategoryId && <span className="ml-1 text-xs text-slate-400">(current)</span>}
            </button>
            {superCategories.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400 italic">
                No super categories yet. Create one first.
              </p>
            )}
            {superCategories.map((sc) => (
              <button
                key={sc.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveCategory(cat.id, sc.id);
                  setMovingCategoryId(null);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  cat.superCategoryId === sc.id
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'hover:bg-violet-50 hover:text-violet-700 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{sc.name}</span>
                  {cat.superCategoryId === sc.id && (
                    <span className="text-xs text-violet-400">current</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
