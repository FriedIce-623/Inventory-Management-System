import React from 'react';
import { TrendingUp, BarChart3, Package, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';

export default function Analytics() {
  return (
    <div className="px-6 pt-6 space-y-8">
      {/* Editorial Header */}
      <section>
        <p className="text-on-surface-variant font-bold text-[0.65rem] uppercase tracking-[0.2em] mb-1">Performance Overview</p>
        <h2 className="text-4xl font-extrabold text-primary tracking-tight">Sales Reports</h2>
      </section>

      {/* Revenue Bento Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Today's Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary bg-gradient-to-br from-primary to-primary-container p-8 rounded-[2rem] text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <span className="text-on-primary/70 text-xs font-bold tracking-widest uppercase">Today</span>
            <h3 className="text-5xl font-black mt-2 leading-none tracking-tighter">₹14,240</h3>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[0.65rem] font-black backdrop-blur-sm uppercase tracking-wider">
              +12.5% vs yesterday
            </span>
          </div>
        </motion.div>

        {/* This Week's Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest p-8 rounded-[2rem] flex flex-col justify-between border border-surface-container-highest/50 min-h-[220px] shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">This Week</span>
              <h3 className="text-5xl font-black text-on-surface mt-2 leading-none tracking-tighter">₹84,500</h3>
            </div>
            <div className="bg-tertiary-fixed p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-on-tertiary-fixed-variant" />
            </div>
          </div>
          <div className="flex gap-1 items-end h-16 mt-4">
            {[40, 60, 30, 80, 50, 90, 100].map((height, i) => (
              <div 
                key={i} 
                className={i === 6 ? "flex-1 bg-primary rounded-t-lg" : "flex-1 bg-primary/10 rounded-t-lg"} 
                style={{ height: `${height}%` }} 
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Trend Section */}
      <section className="bg-surface-container-low p-6 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Revenue Trend</h3>
          <div className="flex items-center gap-2 text-[0.65rem] font-black text-on-surface-variant uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary" /> Current Period
          </div>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-3 px-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const heights = [60, 45, 85, 55, 100, 40, 25];
            return (
              <div key={day} className="flex flex-col items-center flex-1 gap-3">
                <div className="w-full bg-surface-container-high rounded-full h-full flex flex-col justify-end overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heights[i]}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className={i === 4 ? "w-full bg-primary rounded-full" : "w-full bg-primary/20 rounded-full"} 
                  />
                </div>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Selling Products */}
      <section className="pb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Top Selling Products</h3>
          <button className="text-primary font-bold text-sm hover:opacity-70 transition-opacity">View All</button>
        </div>
        <div className="space-y-4">
          {MOCK_PRODUCTS.slice(0, 3).map((product, idx) => (
            <div key={product.id} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border border-surface-container-highest/30 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-on-surface truncate leading-tight">{product.name}</h4>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">{product.category}</p>
              </div>
              <div className="text-right">
                {idx === 0 && (
                  <div className="bg-primary/5 text-primary text-[0.6rem] font-black px-2 py-0.5 rounded-lg inline-block uppercase tracking-widest mb-1">
                    Top Selling
                  </div>
                )}
                <p className="font-black text-on-surface tracking-tight">{(120 - idx * 25)} units</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
