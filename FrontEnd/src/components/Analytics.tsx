import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, Package, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { inventoryAPI, ordersAPI, predictionAPI } from '../services/api';
import { Product, SalesSummary, Prediction } from '../types';

function normalizeProduct(item: any): Product {
  const stock = Number(item.current_stock ?? item.stock ?? 0);
  const threshold = Number(item.reorder_threshold ?? 10);
  return {
    id: item.id?.toString() ?? '',
    name: item.name ?? 'Unnamed product',
    sku: item.sku ?? `#${item.id ?? '0'}`,
    price: Number(item.selling_price ?? item.price ?? 0),
    stock,
    maxStock: Number(item.reorder_threshold ? Math.max(item.reorder_threshold * 3, stock) : item.maxStock ?? Math.max(stock + 10, 20)),
    status: item.needs_restock || stock < threshold ? 'CRITICAL' : stock < threshold * 1.5 ? 'WARNING' : 'HEALTHY',
    image: item.image || `https://via.placeholder.com/120?text=${encodeURIComponent(item.name ?? 'Item')}`,
    category: item.category ?? 'General',
    description: item.description ?? '',
    current_stock: stock,
    reorder_threshold: threshold,
    needs_restock: Boolean(item.needs_restock || stock < threshold),
  };
}

export default function Analytics() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<SalesSummary[]>([]);
  const [forecasts, setForecasts] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [productsData, summaryData, forecastsData] = await Promise.all([
        inventoryAPI.getProducts(),
        ordersAPI.getSalesSummary(),
        predictionAPI.getAllForecasts(),
      ]);

      if (Array.isArray(productsData)) {
        setProducts(productsData.map(normalizeProduct));
      }
      if (Array.isArray(summaryData)) {
        setSummary(summaryData);
      }
      if (Array.isArray(forecastsData)) {
        setForecasts(forecastsData);
      }
    } catch (error) {
      console.error('Unable to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = summary.reduce((acc, item) => {
    const product = products.find((prod) => prod.id === String(item.product_id) || prod.id === item.product_id);
    return acc + (product?.price ?? 0) * item.total_units_sold;
  }, 0);

  const topSelling = [...summary]
    .sort((a, b) => b.total_units_sold - a.total_units_sold)
    .slice(0, 3)
    .map((item) => {
      const product = products.find((prod) => prod.id === String(item.product_id) || prod.id === item.product_id);
      return {
        ...item,
        name: product?.name ?? `Product ${item.product_id}`,
        category: product?.category ?? 'General',
      };
    });

  const topForecasts = forecasts.slice(0, 3);

  return (
    <div className="px-6 pt-6 space-y-8">
      <section>
        <p className="text-on-surface-variant font-bold text-[0.65rem] uppercase tracking-[0.2em] mb-1">Performance Overview</p>
        <h2 className="text-4xl font-extrabold text-primary tracking-tight">Sales Reports</h2>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary bg-linear-to-br from-primary to-primary-container p-8 rounded-4xl text-on-primary shadow-lg shadow-primary/20 flex flex-col justify-between min-h-55"
        >
          <div>
            <span className="text-on-primary/70 text-xs font-bold tracking-widest uppercase">Today</span>
            <h3 className="text-5xl font-black mt-2 leading-none tracking-tighter">₹{loading ? '--' : totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[0.65rem] font-black backdrop-blur-sm uppercase tracking-wider">
              {loading ? 'Loading...' : '+12.5% vs yesterday'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest p-8 rounded-4xl flex flex-col justify-between border border-surface-container-highest/50 min-h-55 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">Top Products</span>
              <h3 className="text-5xl font-black text-on-surface mt-2 leading-none tracking-tighter">{topSelling.length ? topSelling[0].total_units_sold : '--'}</h3>
            </div>
            <div className="bg-tertiary-fixed p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-on-tertiary-fixed-variant" />
            </div>
          </div>
          <div className="flex gap-1 items-end h-16 mt-4">
            {[40, 60, 30, 80, 50, 90, 100].map((height, i) => (
              <div
                key={i}
                className={i === 4 ? 'flex-1 bg-primary rounded-t-lg' : 'flex-1 bg-primary/10 rounded-t-lg'}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <section className="bg-surface-container-low p-6 rounded-4xl">
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
                    transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className={i === 4 ? 'w-full bg-primary rounded-full' : 'w-full bg-primary/20 rounded-full'}
                  />
                </div>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Top Selling Products</h3>
          <button className="text-primary font-bold text-sm hover:opacity-70 transition-opacity">View All</button>
        </div>
        <div className="space-y-4">
          {topSelling.length > 0 ? (
            topSelling.map((item, idx) => (
              <div
                key={item.product_id}
                className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 border border-surface-container-highest/30 shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-surface-container overflow-hidden shrink-0">
                  <img
                    src={products.find((product) => product.id === String(item.product_id))?.image || 'https://via.placeholder.com/96?text=Top'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-on-surface truncate leading-tight">{item.name}</h4>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">{item.category}</p>
                </div>
                <div className="text-right">
                  {idx === 0 && (
                    <div className="bg-primary/5 text-primary text-[0.6rem] font-black px-2 py-0.5 rounded-lg inline-block uppercase tracking-widest mb-1">
                      Top Selling
                    </div>
                  )}
                  <p className="font-black text-on-surface tracking-tight">{item.total_units_sold} units</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-surface-container-highest/50 bg-surface-container-low p-6 text-on-surface-variant">
              No sales summary available yet.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Forecasted Demand</h3>
          <button className="text-primary font-bold text-sm hover:opacity-70 transition-opacity">Refresh</button>
        </div>
        <div className="space-y-4">
          {topForecasts.length > 0 ? (
            topForecasts.map((forecast) => (
              <div
                key={forecast.product_id}
                className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container-highest/40 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{forecast.product_name}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mt-1">Forecast for {forecast.forecast_days} days</p>
                  </div>
                  <span className="text-xs uppercase font-bold text-on-surface-variant">{forecast.confidence}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-3xl bg-surface-container p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-on-surface-variant">Demand</p>
                    <p className="text-xl font-black text-on-surface mt-2">{forecast.predicted_demand}</p>
                  </div>
                  <div className="rounded-3xl bg-surface-container p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-on-surface-variant">Reorder</p>
                    <p className="text-xl font-black text-on-surface mt-2">{forecast.suggested_reorder}</p>
                  </div>
                  <div className="rounded-3xl bg-surface-container p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-on-surface-variant">In stock</p>
                    <p className="text-xl font-black text-on-surface mt-2">{forecast.current_stock}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-surface-container-highest/50 bg-surface-container-low p-6 text-on-surface-variant">
              No forecasts available yet. Add sales data to generate demand predictions.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
