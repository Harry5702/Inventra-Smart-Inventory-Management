'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CategoriesView from './components/CategoriesView';
import SalesView from './components/SalesView';
import InventoryView from './components/InventoryView';
import OrdersView from './components/OrdersView';
import AuthScreen from './components/AuthScreen';
import AddCategoryModal from './components/AddCategoryModal';
import AddSubcategoryModal from './components/AddSubcategoryModal';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import AddStockModal from './components/AddStockModal';
import SellProductModal from './components/SellProductModal';
import { useInventory } from './hooks/useInventory';

function DashboardApp() {
  const {
    categories,
    superCategories,
    sales,
    orders,
    isLoading,
    currentView,
    sidebarOpen,
    selectedSuperCategory,
    selectedCategory,
    selectedSubcategory,
    activeModal,
    sellProduct,
    addStockProduct,
    editingProduct,
    searchQuery,
    stats,
    setSidebarOpen,
    setSearchQuery,
    setActiveModal,
    setEditingProduct,
    handleViewChange,
    handleSuperCategoryClick,
    handleCategoryClick,
    handleSubcategoryClick,
    handleGoBack,
    handleAddSuperCategory,
    handleEditSuperCategory,
    handleDeleteSuperCategory,
    handleMoveCategoryToSuperCategory,
    handleAddCategory,
    handleAddSubcategory,
    handleAddProduct,
    handleEditProduct,
    handleAddStock,
    handleSellProduct,
    handleEditSale,
    handleDeleteSale,
    handleEditCategory,
    handleEditSubcategory,
    handleDeleteCategory,
    handleDeleteSubcategory,
    handleDeleteProduct,
    handleResetStats,
    handleAddOrder,
    handleEditOrder,
    handleDeleteOrder,
    openSellModal,
    closeSellModal,
    openAddStockModal,
    closeAddStockModal,
  } = useInventory();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const mainMargin = isMobile ? 0 : sidebarOpen ? 260 : 80;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentView={currentView}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        onViewChange={handleViewChange}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className="flex-1 transition-all duration-300 min-w-0"
        style={{ marginLeft: mainMargin }}
      >
        <Header
          currentView={currentView}
          selectedSuperCategory={selectedSuperCategory}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {isLoading && categories.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentView}-${selectedCategory?.id}-${selectedSubcategory?.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'dashboard' && (
                  <DashboardView
                    stats={stats}
                    categoryCount={categories.length}
                    superCategories={superCategories}
                    onResetStats={handleResetStats}
                  />
                )}
                {currentView === 'categories' && (
                  <CategoriesView
                    categories={categories}
                    superCategories={superCategories}
                    selectedSuperCategory={selectedSuperCategory}
                    selectedCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    searchQuery={searchQuery}
                    onSuperCategoryClick={handleSuperCategoryClick}
                    onAddSuperCategory={handleAddSuperCategory}
                    onEditSuperCategory={handleEditSuperCategory}
                    onDeleteSuperCategory={handleDeleteSuperCategory}
                    onMoveCategory={handleMoveCategoryToSuperCategory}
                    onCategoryClick={handleCategoryClick}
                    onSubcategoryClick={handleSubcategoryClick}
                    onGoBack={handleGoBack}
                    onOpenModal={setActiveModal}
                    onOpenEditModal={(p) => { setEditingProduct(p); setActiveModal('editProduct'); }}
                    onOpenSellModal={openSellModal}
                    onOpenAddStockModal={openAddStockModal}
                    onEditCategory={handleEditCategory}
                    onEditSubcategory={handleEditSubcategory}
                    onDeleteCategory={handleDeleteCategory}
                    onDeleteSubcategory={handleDeleteSubcategory}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}
                {currentView === 'sales' && (
                  <SalesView
                    transactions={sales}
                    orders={orders}
                    onEditSale={handleEditSale}
                    onDeleteSale={handleDeleteSale}
                  />
                )}
                {currentView === 'inventory' && (
                  <InventoryView
                    categories={categories}
                    onOpenAddStockModal={openAddStockModal}
                    onOpenSellModal={openSellModal}
                  />
                )}
                {currentView === 'orders' && (
                  <OrdersView
                    categories={categories}
                    orders={orders}
                    onAddOrder={handleAddOrder}
                    onEditOrder={handleEditOrder}
                    onDeleteOrder={handleDeleteOrder}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AddCategoryModal
        isOpen={activeModal === 'addCategory'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddCategory}
      />

      <AddSubcategoryModal
        isOpen={activeModal === 'addSubcategory'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddSubcategory}
      />

      <AddProductModal
        isOpen={activeModal === 'addProduct'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddProduct}
      />

      <EditProductModal
        isOpen={activeModal === 'editProduct'}
        product={editingProduct}
        onClose={() => setActiveModal(null)}
        onEdit={handleEditProduct}
      />

      <AddStockModal
        isOpen={activeModal === 'addStock'}
        product={addStockProduct}
        onClose={closeAddStockModal}
        onAdd={handleAddStock}
      />

      <SellProductModal
        isOpen={activeModal === 'sellProduct'}
        product={sellProduct}
        onClose={closeSellModal}
        onSell={handleSellProduct}
      />
    </div>
  );
}

export default function InventraDashboard() {
  const [isAuthed, setIsAuthed] = useState(false);

  const handleLogin = (username: string, password: string) => {
    if (username === 'arqam' && password === 'admin125') {
      setIsAuthed(true);
      return true;
    }
    return false;
  };

  if (!isAuthed) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <DashboardApp />;
}