'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Grid3X3,
  ShoppingCart,
  Package,
  Menu,
  Boxes,
  ClipboardList,
} from 'lucide-react';
import { View } from '../types';

type SidebarProps = {
  currentView: View;
  sidebarOpen: boolean;
  onViewChange: (view: View) => void;
  onToggleSidebar: () => void;
};

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
];

export default function Sidebar({
  currentView,
  sidebarOpen,
  onViewChange,
  onToggleSidebar,
}: SidebarProps) {
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
              <h1 className="font-bold text-xl text-slate-800 tracking-tight whitespace-nowrap">
                INVENTRA
              </h1>
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
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
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