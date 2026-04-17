import { Search, MoreVertical, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';
import { cn } from '../lib/utils';
import { StockStatus } from '../types';

export default function Inventory() {
  return (
    <div className="px-6 pt-6 space-y-8">
      {/* Editorial Header */}
      <section>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Inventory</h2>
        <p className="text-on-surface-variant text-sm font-medium">Manage your stock levels and product status</p>
      </section>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Search products, SKUs..."
          className="w-full bg-surface-container-high rounded-2xl py-4 pl-12 pr-4 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all placeholder:text-on-surface-variant/40"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All Items', 'Critical', 'Low Stock', 'Healthy'].map((filter, idx) => (
          <button 
            key={filter}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
              idx === 0 ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {MOCK_PRODUCTS.map((product, idx) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 group border border-surface-container-highest/30"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-on-surface truncate mb-1">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-primary">₹{product.price}</span>
                <span className="text-[0.7rem] text-on-surface-variant font-bold uppercase tracking-wider">
                  {product.stock}/{product.maxStock} units
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={product.status} />
              <button className="text-on-surface-variant/50 hover:text-primary transition-colors p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-[0_12px_32px_-4px_rgba(31,16,142,0.3)] flex items-center justify-center active:scale-95 transition-transform z-40">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: StockStatus }) {
  const styles = {
    CRITICAL: "bg-error-container text-on-error-container",
    WARNING: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    HEALTHY: "bg-surface-container text-on-tertiary-fixed-variant"
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[0.6rem] font-black tracking-widest uppercase",
      styles[status]
    )}>
      {status}
    </span>
  );
}
