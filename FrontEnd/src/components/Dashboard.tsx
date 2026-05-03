import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingCart, TrendingUp, PackageSearch, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';
import { cn } from '../lib/utils';
import { inventoryAPI, predictionAPI } from '../services/api';
import { Product, Prediction } from '../types';

function normalizeProduct(item: any): Product {
  const currentStock = Number(item.current_stock ?? item.stock ?? 0);
  const threshold = Number(item.reorder_threshold ?? 10);
  return {
    id: item.id?.toString() ?? '',
    name: item.name ?? 'Unnamed product',
    sku: item.sku ?? `#${item.id ?? '0'}`,
    price: Number(item.selling_price ?? item.price ?? 0),
    stock: currentStock,
    maxStock: Number(item.maxStock ?? Math.max(threshold * 3, currentStock + 10, 20)),
    status:
      item.needs_restock || currentStock < threshold
        ? 'CRITICAL'
        : currentStock < threshold * 1.5
        ? 'WARNING'
        : 'HEALTHY',
    image:
      item.image || `https://via.placeholder.com/120?text=${encodeURIComponent(item.name ?? 'Item')}`,
    category: item.category ?? 'General',
    description: item.description ?? '',
    current_stock: currentStock,
    reorder_threshold: threshold,
    needs_restock: Boolean(item.needs_restock || currentStock < threshold),
  };
}

export default function Dashboard() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [forecast, setForecast] = useState<Prediction | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [products, forecasts] = await Promise.all([
        inventoryAPI.getProducts(),
        predictionAPI.getAllForecasts(),
      ]);

      setProductList(Array.isArray(products) ? products.map(normalizeProduct) : []);

      if (Array.isArray(forecasts) && forecasts.length > 0) {
        const sortedForecasts = [...forecasts].sort(
          (a: Prediction, b: Prediction) => b.suggested_reorder - a.suggested_reorder
        );
        setForecast(sortedForecasts[0]);
      }
    } catch (error) {
      console.error('Unable to load dashboard data', error);
      setProductList(MOCK_PRODUCTS);
    }
  };

  const recommendedProduct =
    productList.find((product) => Number(product.id) === Number(forecast?.product_id)) ??
    MOCK_PRODUCTS[0];

  const criticalAlerts = productList.filter((product) => product.status === 'CRITICAL');

  const handleOrderNow = () => {
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const currentStock = Number(recommendedProduct.current_stock ?? recommendedProduct.stock);
      await inventoryAPI.updateProduct(Number(recommendedProduct.id), {
        current_stock: currentStock + orderQuantity,
      });
      setShowOrderModal(false);
      setOrderQuantity(50);
      await loadDashboard();
      alert(`✓ Restocked ${recommendedProduct.name} with ${orderQuantity} units.`);
    } catch (error) {
      console.error('Error restocking inventory:', error);
      const message = error instanceof Error ? error.message : 'Failed to restock inventory';
      alert(`❌ Error: ${message}\n\nMake sure your backend is running on http://localhost:8000`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-6 pt-6 space-y-8">
      <section>
        <p className="text-on-surface-variant text-[0.75rem] font-bold tracking-widest uppercase mb-1">Store Dashboard</p>
        <h2 className="text-[1.75rem] font-extrabold text-primary leading-tight tracking-tight">
          Welcome back,<br />Sharma General Store
        </h2>
      </section>

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
          Based on your shop data, reorder <span className="text-white font-bold">{forecast ? `${forecast.suggested_reorder} units of ${forecast.product_name}` : 'a priority product'}</span>.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-tertiary-fixed rounded-full" />
            <span className="text-white text-[0.65rem] font-bold uppercase tracking-widest">{forecast ? `${forecast.confidence} confidence` : 'Loading forecast...'}</span>
          </div>
          <button
            onClick={handleOrderNow}
            className="bg-surface-container-lowest text-primary px-5 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform hover:bg-surface-container-low"
          >
            Restock Now
          </button>
        </div>
      </motion.section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[1.25rem] font-bold text-on-surface tracking-tight">Critical Alerts</h3>
          <span className="bg-error-container text-on-error-container text-[0.65rem] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
            {criticalAlerts.length} Action Items
          </span>
        </div>
        <div className="space-y-4">
          {(criticalAlerts.length ? criticalAlerts : MOCK_PRODUCTS.slice(0, 3)).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 border border-surface-container-highest/50"
            >
              <div className="w-14 h-14 rounded-xl bg-surface-container-low overflow-hidden shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="grow">
                <h4 className="text-sm font-bold text-on-surface leading-tight">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-error font-bold text-[0.65rem] uppercase tracking-wider">{product.stock} in stock</span>
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

      <section className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          label="Daily Revenue"
          value={forecast ? `₹${Math.round(forecast.predicted_demand * 15).toLocaleString()}` : '₹--'}
        />
        <StatCard
          icon={<PackageSearch className="w-5 h-5 text-primary" />}
          label="Stock Value"
          value={forecast ? `₹${Math.round((productList[0]?.price ?? 0) * (productList[0]?.stock ?? 0)).toLocaleString()}` : '₹--'}
          dot
        />
      </section>

      <AnimatePresence>
        {showOrderModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowOrderModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-end"
            >
              <div className="w-full bg-surface-container-lowest rounded-t-3xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-on-surface">Confirm Restock</h3>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>
                <div className="bg-surface-container-high rounded-2xl p-4 space-y-3">
                  <div className="flex gap-4">
                    <img
                      src={recommendedProduct.image}
                      alt={recommendedProduct.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="grow">
                      <h4 className="font-bold text-on-surface">{recommendedProduct.name}</h4>
                      <p className="text-sm text-on-surface-variant">SKU: {recommendedProduct.sku}</p>
                      <p className="text-sm font-semibold text-primary mt-1">₹{recommendedProduct.price} per unit</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Quantity</label>
                  <div className="flex items-center gap-4 bg-surface-container-high rounded-xl p-4">
                    <button
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 5))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface font-bold active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="grow text-center text-2xl font-bold bg-transparent text-on-surface outline-none"
                      min="1"
                    />
                    <button
                      onClick={() => setOrderQuantity(orderQuantity + 5)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant">Total: ₹{(orderQuantity * recommendedProduct.price).toLocaleString()}</p>
                </div>
                <div className="bg-primary-container rounded-lg p-4 space-y-2">
                  <p className="text-sm text-on-primary-container">
                    <span className="font-bold">Reason:</span> Local trends and forecast data
                  </p>
                  <p className="text-sm text-on-primary-container">
                    <span className="font-bold">Confidence:</span> {forecast?.confidence ?? 'medium'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-xl font-bold transition-colors hover:bg-surface-container-highest active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold transition-all active:scale-95",
                      isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? 'Processing...' : 'Restock Inventory'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, dot }: { icon: React.ReactNode; label: string; value: string; dot?: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-highest/40 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="rounded-3xl bg-surface-container p-3 flex items-center justify-center w-12 h-12">
          {icon}
        </div>
        {dot && <span className="w-3 h-3 bg-primary rounded-full" />}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">{label}</p>
      <p className="mt-4 text-3xl font-black text-on-surface">{value}</p>
    </div>
  );
}
