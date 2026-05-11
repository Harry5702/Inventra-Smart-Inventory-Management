'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Boxes, Grid3X3, ChevronRight, Plus, ArrowLeft, Package, Minus, Trash2, Pencil,
  Users, Clock, Cookie, Zap, Droplet, Disc, Leaf, Gift, Flame, Star, MoreHorizontal 
} from 'lucide-react';
import { Category, Subcategory, Product, ModalType } from '../types';

type CategoriesViewProps = {
  categories: Category[];
  selectedCategory: Category | null;
  selectedSubcategory: Subcategory | null;
  searchQuery: string;
  onCategoryClick: (cat: Category) => void;
  onSubcategoryClick: (sub: Subcategory) => void;
  onGoBack: () => void;
  onOpenModal: (modal: ModalType) => void;
  onOpenEditModal: (product: Product) => void;
  onOpenSellModal: (product: Product) => void;
  onOpenAddStockModal: (product: Product) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteSubcategory: (id: string) => void;
  onDeleteProduct: (id: string) => void;
};

export default function CategoriesView({
  categories,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onCategoryClick,
  onSubcategoryClick,
  onGoBack,
  onOpenModal,
  onOpenEditModal,
  onOpenSellModal,
  onOpenAddStockModal,
  onDeleteCategory,
  onDeleteSubcategory,
  onDeleteProduct,
}: CategoriesViewProps) {
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {selectedCategory
              ? selectedSubcategory
                ? selectedSubcategory.name
                : selectedCategory.name
              : 'Categories'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {selectedCategory
              ? selectedSubcategory
                ? 'Manage products in this subcategory'
                : 'Select a subcategory'
              : 'Select a category to view subcategories'}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedCategory && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {!selectedSubcategory && selectedCategory && (
            <button
              onClick={() => onOpenModal('addSubcategory')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add Subcategory
            </button>
          )}
          {selectedSubcategory && (
            <button
              onClick={() => onOpenModal('addProduct')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add Product
            </button>
          )}
          {!selectedCategory && (
            <button
              onClick={() => onOpenModal('addCategory')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Plus size={16} />
              Add Category
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="cat-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategoryClick(cat)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    {getDynamicIcon(cat.name, 'category')}
                  </div>
                  <div className="flex items-center gap-1">
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
                <h3 className="font-semibold text-slate-800 text-lg">{cat.name}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {cat.subcategories.length} subcategories
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : !selectedSubcategory ? (
          <motion.div
            key="sub-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {selectedCategory.subcategories.map((sub, i) => (
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
                <p className="text-sm text-slate-400 mt-1">
                  {sub.products.length} products
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
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
                className={`rounded-2xl p-6 shadow-sm border-2 ${getStockColor(
                  prod.stock
                )} transition-all relative min-h-[220px] flex flex-col`}
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