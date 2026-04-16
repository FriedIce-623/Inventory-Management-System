import React from 'react';
import { Sparkles, ShoppingCart, TrendingUp, PackageSearch } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const criticalAlerts = MOCK_PRODUCTS.filter(p => p.status === 'CRITICAL');

  return (
    <div className="px-6 pt-6 space-y-8">
      {/* Hero Greeting */}
      <section>
        <p className="text-on-surface-variant text-[0.75rem] font-bold tracking-widest uppercase mb-1">Store Dashboard</p>
        <h2 className="text-[1.75rem] font-extrabold text-primary leading-tight tracking-tight">
          Welcome back,<br />Sharma General Store
        </h2>
      </section>

      {/* Prophet ML Forecast */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-primary-container rounded-3xl p-6 shadow-[0_12px_32px_-4px_rgba(31,16,142,0.15)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-on-primary-container fill-on-primary-container" />
          <span className="text-on-primary-container text-[0.7rem] font-bold tracking-widest uppercase">Prophet ML Forecast</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Inventory Boost Recommended</h3>
        <p className="text-on-primary-container/80 text-sm leading-relaxed mb-6">
          Based on local trends, reorder <span className="text-white font-bold">50 units of Aashirvaad Atta 5kg</span>. Sales surge predicted for the Diwali festival.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-tertiary-fixed rounded-full" />
            <span className="text-white text-[0.65rem] font-bold uppercase tracking-widest">High Confidence (94%)</span>
          </div>
          <button className="bg-surface-container-lowest text-primary px-5 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform">
            Order Now
          </button>
        </div>
      </motion.section>

      {/* Critical Alerts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[1.25rem] font-bold text-on-surface tracking-tight">Critical Alerts</h3>
          <span className="bg-error-container text-on-error-container text-[0.65rem] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
            {criticalAlerts.length} Action Items
          </span>
        </div>
        <div className="space-y-4">
          {criticalAlerts.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 border border-surface-container-highest/50"
            >
              <div className="w-14 h-14 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-on-surface leading-tight">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-error font-bold text-[0.65rem] uppercase tracking-wider">
                    {product.stock} in stock
                  </span>
                  <span className="w-1 h-1 bg-on-surface-variant/30 rounded-full" />
                  <span className="text-on-surface-variant text-[0.65rem] font-medium tracking-wide">SKU: {product.sku}</span>
                </div>
              </div>
              <button className="bg-primary text-on-primary p-2.5 rounded-xl active:scale-90 transition-transform shadow-sm">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-primary" />} 
          label="Daily Revenue" 
          value="₹14,240" 
        />
        <StatCard 
          icon={<PackageSearch className="w-5 h-5 text-primary" />} 
          label="Stock Value" 
          value="₹3.2L" 
          dot
        />
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, dot }: { icon: React.ReactNode, label: string, value: string, dot?: boolean }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        {dot && <div className="w-1.5 h-1.5 bg-tertiary-fixed rounded-full" />}
      </div>
      <div>
        <p className="text-on-surface-variant text-[0.65rem] font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-extrabold text-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
}
