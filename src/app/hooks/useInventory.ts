'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { seedDatabase } from '../lib/seed';
import { Category, Subcategory, Product, View, ModalType } from '../types';

export type SaleTransaction = {
  id: number;
  displayId: string;
  product: string;
  productId: number;
  qty: number;
  unitPrice: number;
  costPrice: number;
  total: number;
  profit: number;
  date: string;
  rawDate: string;
};

export function useInventory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sellProduct, setSellProduct] = useState<Product | null>(null);
  const [addStockProduct, setAddStockProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const checkDbConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        console.error('Database connection failed:', body?.error ?? 'Unknown error');
      }
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }, []);

  // Refresh categories with nested data
  const refreshCategories = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        subcategories (
          id,
          name,
          products (
            id,
            name,
            selling_price,
            cost_price,
            inventory (quantity)
          )
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      setIsLoading(false);
      return;
    }

    type CatData = {
      id: number;
      name: string;
      subcategories: {
        id: number;
        name: string;
        products: ProductRow[];
      }[];
    };

    type ProductRow = {
      id: number;
      name: string;
      selling_price: number;
      cost_price: number;
      inventory: { quantity: number } | Array<{ quantity: number }> | null;
    };

    const mapped: Category[] = ((data as CatData[]) || []).map((cat: CatData) => ({
      id: String(cat.id),
      name: cat.name,
      subcategories: (cat.subcategories || []).map((sub: CatData['subcategories'][0]) => ({
        id: String(sub.id),
        name: sub.name,
        products: (sub.products || []).map((prod: ProductRow) => {
          const inventoryQty = Array.isArray(prod.inventory)
            ? prod.inventory[0]?.quantity
            : prod.inventory?.quantity;

          return {
            id: String(prod.id),
            name: prod.name,
            price: Number(prod.selling_price),
            costPrice: Number(prod.cost_price),
            stock: inventoryQty ?? 0,
          };
        }),
      })),
    }));

    setCategories(mapped);

    setSelectedCategory((prev) => (prev ? mapped.find((c) => c.id === prev.id) ?? null : null));
    setSelectedSubcategory((prev) => {
      if (!prev) return null;
      for (const cat of mapped) {
        const sub = cat.subcategories.find((s) => s.id === prev.id);
        if (sub) return sub;
      }
      return null;
    });

    setIsLoading(false);
  }, []);

  // Refresh sales with product names
  const refreshSales = useCallback(async () => {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        quantity,
        selling_price,
        date,
        product_id,
        products (name, cost_price)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      return;
    }

    type SalesData = {
      id: number;
      quantity: number;
      selling_price: string | number;
      date: string;
      product_id: number;
      products?: { name: string; cost_price: string | number };
    };

    const mapped: SaleTransaction[] = ((data as unknown) as SalesData[] || []).map((s: SalesData) => {
      const qty       = s.quantity;
      const sellPrice = Number(s.selling_price);
      const costPrice = Number(s.products?.cost_price ?? 0);
      return {
        id: s.id,
        displayId: `#TRX-${String(s.id).padStart(3, '0')}`,
        product: s.products?.name ?? 'Unknown',
        productId: s.product_id,
        qty,
        unitPrice: sellPrice,
        costPrice,
        total: qty * sellPrice,
        profit: qty * (sellPrice - costPrice),
        date: new Date(s.date).toISOString().split('T')[0],
        rawDate: s.date,
      };
    });

    setSales(mapped);
  }, []);

  useEffect(() => {
    const initializeDb = async () => {
      await checkDbConnection();

      const seedKey = 'inventra_seeded_v2';
      const hasSeeded = localStorage.getItem(seedKey) === 'true';

      if (!hasSeeded) {
        const result = await seedDatabase();
        if (result.success) {
          console.log(result.message);
          localStorage.setItem(seedKey, 'true');
        }
      }

      await refreshCategories();
      await refreshSales();
    };

    initializeDb();
  }, [checkDbConnection, refreshCategories, refreshSales]);

  const stats = useMemo(() => {
    // ── Product Aggregates ──────────────────────────────────────────────
    let totalProducts = 0;
    let lowStock = 0;
    let totalStock = 0;
    const lowStockList: { id: string; name: string; stock: number; category: string }[] = [];

    categories.forEach((cat) =>
      cat.subcategories.forEach((sub) =>
        sub.products.forEach((prod) => {
          totalProducts++;
          totalStock += prod.stock;
          if (prod.stock < 10) {
            lowStock++;
            lowStockList.push({ id: prod.id, name: prod.name, stock: prod.stock, category: cat.name });
          }
        })
      )
    );

    // ── Date Boundaries ─────────────────────────────────────────────────
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // ── Revenue & Profit Calculations ────────────────────────────────────
    // Real profit = sum of (selling_price - cost_price) * qty per sale
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit  = sales.reduce((sum, s) => sum + s.profit, 0);

    const todaySales   = sales.filter((s) => s.date === todayStr);
    const weekSales    = sales.filter((s) => new Date(s.rawDate) >= weekAgo);
    const monthSales   = sales.filter((s) => new Date(s.rawDate) >= monthAgo);

    const revenueToday = todaySales.reduce((sum, s) => sum + s.total, 0);
    const revenueWeek  = weekSales.reduce((sum, s) => sum + s.total, 0);
    const revenueMonth = monthSales.reduce((sum, s) => sum + s.total, 0);

    const salesToday = todaySales.reduce((sum, s) => sum + s.qty, 0);
    const salesWeek  = weekSales.reduce((sum, s) => sum + s.qty, 0);
    const salesMonth = monthSales.reduce((sum, s) => sum + s.qty, 0);

    const profitToday = todaySales.reduce((sum, s) => sum + s.profit, 0);
    const profitWeek  = weekSales.reduce((sum, s) => sum + s.profit, 0);
    const profitMonth = monthSales.reduce((sum, s) => sum + s.profit, 0);

    // ── Sales Over Time (Mon → Sun) ──────────────────────────────────────
    const salesByDay: { label: string; revenue: number; qty: number }[] = [];
    const startOfWeek = new Date(now);
    const dayIndex = startOfWeek.getDay();
    const daysSinceMonday = (dayIndex + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en', { weekday: 'short' });
      const daySales = sales.filter((s) => s.date === dayStr);
      salesByDay.push({
        label,
        revenue: daySales.reduce((sum, s) => sum + s.total, 0),
        qty:     daySales.reduce((sum, s) => sum + s.qty, 0),
      });
    }

    // ── Top-Selling Products (by total qty sold) ─────────────────────────
    const productCatalog = new Map<string, { name: string; category: string }>();
    categories.forEach((cat) =>
      cat.subcategories.forEach((sub) =>
        sub.products.forEach((p) => {
          productCatalog.set(p.id, { name: p.name, category: cat.name });
        })
      )
    );

    const productSalesMap = new Map<string, { name: string; qty: number; revenue: number; category: string }>();
    sales.forEach((s) => {
      const key = String(s.productId);
      const existing = productSalesMap.get(key);
      const catalog = productCatalog.get(key);
      const catName = catalog?.category ?? '';
      if (existing) {
        existing.qty     += s.qty;
        existing.revenue += s.total;
      } else {
        productSalesMap.set(key, { name: catalog?.name ?? s.product, qty: s.qty, revenue: s.total, category: catName });
      }
    });

    const allProductSales = Array.from(productCatalog.entries()).map(([id, meta]) => {
      const sold = productSalesMap.get(id);
      return {
        id,
        name: sold?.name ?? meta.name,
        qty: sold?.qty ?? 0,
        revenue: sold?.revenue ?? 0,
        category: meta.category,
      };
    });

    productSalesMap.forEach((value, id) => {
      if (!productCatalog.has(id)) {
        allProductSales.push({ id, ...value });
      }
    });

    const topSelling = allProductSales
      .filter((p) => p.qty > 0)
      .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
      .slice(0, 5);

    const topIds = new Set(topSelling.map((p) => p.id));
    const leastPool = allProductSales.filter((p) => !topIds.has(p.id));
    const leastSource = leastPool.length > 0 ? leastPool : allProductSales;
    const leastSelling = leastSource
      .sort((a, b) => a.qty - b.qty || a.revenue - b.revenue)
      .slice(0, 5);

    // ── Category Performance ─────────────────────────────────────────────
    const categoryRevenueMap = new Map<string, number>();
    categories.forEach((cat) => {
      let rev = 0;
      cat.subcategories.forEach((sub) =>
        sub.products.forEach((prod) => {
          sales.forEach((s) => {
            if (s.productId === Number(prod.id)) rev += s.total;
          });
        })
      );
      categoryRevenueMap.set(cat.name, rev);
    });
    const categoryPerformance = Array.from(categoryRevenueMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // ── Stock Predictions (Phase 7) ──────────────────────────────────────
    // avg daily sales per product over last 30 days → days remaining = stock / avgDailySales
    const DAYS_WINDOW = 30;
    const stockPredictions: {
      id: string; name: string; category: string;
      stock: number; avgDailySales: number; daysRemaining: number | null;
    }[] = [];

    categories.forEach((cat) =>
      cat.subcategories.forEach((sub) =>
        sub.products.forEach((prod) => {
          const productSales = sales.filter(
            (s) => s.productId === Number(prod.id) && new Date(s.rawDate) >= monthAgo
          );
          const totalQtySold = productSales.reduce((sum, s) => sum + s.qty, 0);
          const avgDailySales = totalQtySold / DAYS_WINDOW;
          const daysRemaining = avgDailySales > 0 ? Math.round(prod.stock / avgDailySales) : null;
          stockPredictions.push({
            id: prod.id,
            name: prod.name,
            category: cat.name,
            stock: prod.stock,
            avgDailySales: Math.round(avgDailySales * 10) / 10,
            daysRemaining,
          });
        })
      )
    );
    // Sort by daysRemaining ascending (most urgent first), nulls last
    stockPredictions.sort((a, b) => {
      if (a.daysRemaining === null && b.daysRemaining === null) return 0;
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;
      return a.daysRemaining - b.daysRemaining;
    });

    return {
      totalProducts,
      lowStock,
      lowStockList: lowStockList.sort((a, b) => a.stock - b.stock).slice(0, 8),
      totalStock,
      revenue: totalRevenue,
      profit: totalProfit,
      revenueToday,
      revenueWeek,
      revenueMonth,
      salesToday,
      salesWeek,
      salesMonth,
      profitToday,
      profitWeek,
      profitMonth,
      salesByDay,
      topSelling,
      leastSelling,
      categoryPerformance,
      stockPredictions: stockPredictions.slice(0, 10),
    };
  }, [categories, sales]);

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  }, []);

  const handleCategoryClick = useCallback((cat: Category) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  }, []);

  const handleSubcategoryClick = useCallback((sub: Subcategory) => {
    setSelectedSubcategory(sub);
  }, []);

  const handleGoBack = useCallback(() => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  }, [selectedSubcategory, selectedCategory]);

  const handleAddCategory = useCallback(async (name: string) => {
    const { error } = await supabase.from('categories').insert({ name, is_predefined: false });
    if (error) {
      alert('Failed to add category: ' + error.message);
      return;
    }
    await refreshCategories();
  }, [refreshCategories]);

  const handleAddSubcategory = useCallback(async (name: string) => {
    if (!selectedCategory) return;
    const { error } = await supabase
      .from('subcategories')
      .insert({ category_id: Number(selectedCategory.id), name });
    if (error) {
      alert('Failed to add subcategory: ' + error.message);
      return;
    }
    await refreshCategories();
  }, [selectedCategory, refreshCategories]);

  const handleAddProduct = useCallback(async (
    name: string,
    sellingPrice: number,
    costPrice: number,
    stock: number,
  ) => {
    if (!selectedSubcategory || !selectedCategory) return;

    const { data: productData, error: prodError } = await supabase
      .from('products')
      .insert({
        subcategory_id: Number(selectedSubcategory.id),
        name,
        selling_price: sellingPrice,
        cost_price: costPrice,
      })
      .select()
      .single();

    if (prodError || !productData) {
      alert('Failed to add product: ' + prodError?.message);
      return;
    }

    const { error: invError } = await supabase
      .from('inventory')
      .insert({ product_id: productData.id, quantity: stock });

    if (invError) {
      alert('Failed to add inventory: ' + invError.message);
      return;
    }

    await refreshCategories();
  }, [selectedCategory, selectedSubcategory, refreshCategories]);

  const handleAddStock = useCallback(async (productId: string, amount: number) => {
    const prodId = Number(productId);

    const { data: inv, error: invError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', prodId)
      .maybeSingle();

    if (invError) {
      alert('Failed to load inventory: ' + invError.message);
      return false;
    }

    const currentQty = Number(inv?.quantity ?? 0);
    const newQty = Math.max(0, currentQty + amount);

    const { error } = await supabase
      .from('inventory')
      .upsert(
        {
          product_id: prodId,
          quantity: newQty,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'product_id' }
      );

    if (error) {
      alert('Failed to update stock: ' + error.message);
      return false;
    }

    await refreshCategories();
    return true;
  }, [refreshCategories]);

  // ─── SALE OPERATIONS ─────────────────────────────────

  const handleSellProduct = useCallback(async (productId: string, quantity: number, price: number) => {
    const prodId = Number(productId);

    const { data: inv, error: invError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', prodId)
      .maybeSingle();

    if (invError) {
      alert('Failed to load inventory: ' + invError.message);
      return false;
    }

    const currentQty = Number(inv?.quantity ?? 0);
    if (currentQty < quantity) {
      alert('Not enough stock!');
      return false;
    }

    const { error: saleError } = await supabase.from('sales').insert({
      product_id: prodId,
      quantity,
      selling_price: price,
      date: new Date().toISOString(),
    });

    if (saleError) {
      alert('Failed to record sale: ' + saleError.message);
      return false;
    }

    const { error: invUpdateError } = await supabase
      .from('inventory')
      .upsert(
        {
          product_id: prodId,
          quantity: currentQty - quantity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'product_id' }
      );

    if (invUpdateError) {
      alert('Failed to update inventory: ' + invUpdateError.message);
      return false;
    }

    await Promise.all([refreshCategories(), refreshSales()]);
    return true;
  }, [refreshCategories, refreshSales]);

  const handleEditSale = useCallback(async (saleId: number, newQuantity: number) => {
    // Get the original sale
    const { data: originalSale } = await supabase
      .from('sales')
      .select('quantity, product_id, selling_price')
      .eq('id', saleId)
      .single();

    if (!originalSale) {
      alert('Sale not found');
      return;
    }

    const productId = originalSale.product_id;
    const oldQty = originalSale.quantity;
    const qtyDiff = newQuantity - oldQty;

    // Get current inventory
    const { data: inv } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('product_id', productId)
      .single();

    const currentStock = inv?.quantity ?? 0;

    // Check if we have enough stock for the increase
    if (qtyDiff > 0 && currentStock < qtyDiff) {
      alert(`Not enough stock! Available: ${currentStock}, Need: ${qtyDiff} more`);
      return;
    }

    // Update the sale record
    const { error: saleError } = await supabase
      .from('sales')
      .update({ quantity: newQuantity })
      .eq('id', saleId);

    if (saleError) {
      alert('Failed to update sale: ' + saleError.message);
      return;
    }

    // Adjust inventory: if qty increased, subtract more; if decreased, add back
    const newStock = currentStock - qtyDiff;

    const { error: invError } = await supabase
      .from('inventory')
      .update({ quantity: newStock })
      .eq('product_id', productId);

    if (invError) {
      console.error('Error updating inventory:', invError);
      return;
    }

    await Promise.all([refreshCategories(), refreshSales()]);
  }, [refreshCategories, refreshSales]);

  const handleDeleteSale = useCallback(async (saleId: number) => {
    if (!window.confirm('Are you sure you want to delete this sale?\n\nInventory will be restored automatically.')) {
      return;
    }

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleId);

    if (error) {
      alert('Failed to delete sale: ' + error.message);
      return;
    }

    // Inventory is restored automatically by the database trigger
    await Promise.all([refreshCategories(), refreshSales()]);
  }, [refreshCategories, refreshSales]);

  // ─── DELETE CATEGORY / SUBCATEGORY ───────────────────

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', Number(categoryId));

    if (error) {
      alert('Cannot delete category: ' + error.message);
      return;
    }

    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }

    await refreshCategories();
  }, [refreshCategories, selectedCategory]);

  const handleDeleteSubcategory = useCallback(async (subcategoryId: string) => {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', Number(subcategoryId));

    if (error) {
      alert('Cannot delete subcategory: ' + error.message);
      return;
    }

    if (selectedSubcategory?.id === subcategoryId) {
      setSelectedSubcategory(null);
    }

    await refreshCategories();
  }, [refreshCategories, selectedSubcategory]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', Number(productId));

    if (error) {
      alert('Cannot delete product: ' + error.message);
      return;
    }

    await refreshCategories();
  }, [refreshCategories]);

  const openSellModal = useCallback((product: Product) => {
    setSellProduct(product);
    setActiveModal('sellProduct');
  }, []);

  const closeSellModal = useCallback(() => {
    setActiveModal(null);
    setSellProduct(null);
  }, []);

  const openAddStockModal = useCallback((product: Product) => {
    setAddStockProduct(product);
    setActiveModal('addStock');
  }, []);

  const closeAddStockModal = useCallback(() => {
    setActiveModal(null);
    setAddStockProduct(null);
  }, []);

  return {
    categories,
    sales,
    isLoading,
    currentView,
    sidebarOpen,
    selectedCategory,
    selectedSubcategory,
    activeModal,
    sellProduct,
    addStockProduct,
    searchQuery,
    stats,
    setSidebarOpen,
    setSearchQuery,
    setActiveModal,
    handleViewChange,
    handleCategoryClick,
    handleSubcategoryClick,
    handleGoBack,
    handleAddCategory,
    handleAddSubcategory,
    handleAddProduct,
    handleAddStock,
    handleSellProduct,
    handleEditSale,
    handleDeleteSale,
    handleDeleteCategory,
    handleDeleteSubcategory,
    handleDeleteProduct,
    openSellModal,
    closeSellModal,
    openAddStockModal,
    closeAddStockModal,
  };
}