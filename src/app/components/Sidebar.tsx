'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Grid3X3, ShoppingCart, Package,
  Menu, Boxes, ClipboardList, X,
} from 'lucide-react';
import { View } from '../types';

type SidebarProps = {
  currentView: View;
  sidebarOpen: boolean;
  isMobile: boolean;
  onViewChange: (view: View) => void;
  onToggleSidebar: () => void;
};

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
  { id: 'sales',      label: 'Sales',      icon: ShoppingCart },
  { id: 'inventory',  label: 'Inventory',  icon: Package },
  { id: 'orders',     label: 'Orders',     icon: ClipboardList },
];

export default function Sidebar({
  currentView, sidebarOpen, isMobile, onViewChange, onToggleSidebar,
}: SidebarProps) {
  const handleNavClick = (view: View) => {
    onViewChange(view);
    if (isMobile) onToggleSidebar();
  };

  // ── Mobile: full-width overlay drawer ─────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggleSidebar}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl"
            >
              {/* Logo + close */}
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center flex-shrink-0">
                    <Boxes className="text-white" size={18} />
                  </div>
                  <h1 className="font-bold text-xl text-slate-800 tracking-tight">INVENTRA</h1>
                </div>
                <button
                  onClick={onToggleSidebar}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── Desktop: collapsible push sidebar ─────────────────────────────
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 80 }}
      className="bg-white border-r border-slate-200 flex flex-col fixed h-full z-40"
    >
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center flex-shrink-0">
          <Boxes className="text-white" size={20} />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-xl text-slate-800 tracking-tight whitespace-nowrap">INVENTRA</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onToggleSidebar}
          className="w-full flex items-center justify-center p-3 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
    </motion.aside>
  );
}
