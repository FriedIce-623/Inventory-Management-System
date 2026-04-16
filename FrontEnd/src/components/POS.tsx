import React, { useState } from 'react';
import { Search, QrCode, PlusCircle, Minus, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';
import { CartItem } from '../types';
import { cn } from '../lib/utils';

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([
    { ...MOCK_PRODUCTS[3], quantity: 1 },
    { ...MOCK_PRODUCTS[2], quantity: 1 },
  ]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="px-6 py-4 space-y-6">
        <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">POS Cashier</h2>
        
        {/* Search & Scan */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Search products or scan SKU..."
            className="w-full bg-surface-container-high rounded-2xl py-4 pl-12 pr-4 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <QuickAction icon={<QrCode className="w-6 h-6" />} label="Scan Item" />
          <QuickAction icon={<PlusCircle className="w-6 h-6" />} label="Manual Entry" />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['All Items', 'Staples', 'Snacks', 'Dairy'].map((cat, idx) => (
            <button 
              key={cat}
              className={cn(
                "flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all",
                idx === 0 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Cart Section */}
      <section className="px-6 pb-48 space-y-4 flex-1">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
            Current Basket ({cart.length})
          </h3>
          <button 
            onClick={() => setCart([])}
            className="text-[0.7rem] font-bold text-error uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border border-surface-container-highest/30 shadow-sm"
              >
                <div className="w-16 h-16 bg-surface-container rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-surface leading-tight truncate pr-2">{item.name}</h4>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant/30 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">{item.category}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-black text-primary">₹{item.price}</span>
                    <div className="flex items-center bg-surface-container-low rounded-xl px-2 py-1 gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-surface-container-high rounded-lg transition-colors text-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-surface-container-high rounded-lg transition-colors text-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Summary & Checkout */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-glass border border-surface-container-highest rounded-3xl p-6 space-y-4 shadow-[0_-12px_32px_-4px_rgba(31,16,142,0.12)]"
        >
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
            <span className="text-sm font-black">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-widest">GST (0%)</span>
            <span className="text-sm font-black">₹0.00</span>
          </div>
          <button className="w-full bg-primary text-on-primary py-5 rounded-2xl flex items-center justify-between px-8 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total to Pay</span>
              <span className="text-2xl font-black tracking-tight">₹{subtotal}</span>
            </div>
            <div className="flex items-center gap-2 font-black text-lg">
              Checkout
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-4 bg-surface-container-lowest rounded-2xl border border-surface-container-highest/30 hover:bg-surface-container-low transition-colors duration-150 group active:scale-95">
      <div className="text-primary mb-2 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant/70">{label}</span>
    </button>
  );
}
