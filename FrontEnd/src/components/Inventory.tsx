import React, { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_PRODUCTS } from '../constants';
import { cn } from '../lib/utils';
import { inventoryAPI } from '../services/api';
import { Product, StockStatus } from '../types';

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

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Items');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await inventoryAPI.getProducts();
      if (Array.isArray(data)) {
        setProducts(data.map(normalizeProduct));
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Unable to load products', err);
      setError('Unable to fetch inventory. Please check backend connectivity and authentication.');
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (product: Product) => {
    try {
      const newStock = Number(product.current_stock ?? product.stock) + 10;
      await inventoryAPI.updateProduct(Number(product.id), {
        current_stock: newStock,
      });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, stock: newStock, current_stock: newStock } : item
        )
      );
    } catch (err) {
      console.error('Unable to restock', err);
      alert('Unable to restock the product. Please check backend connectivity.');
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await inventoryAPI.deleteProduct(Number(product.id));
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (err) {
      console.error('Unable to delete product', err);
      alert('Unable to delete the product.');
    }
  };

  const handleAddProduct = async () => {
    const name = window.prompt('Product name');
    if (!name) {
      return;
    }

    const priceInput = window.prompt('Selling price (₹)');
    const price = Number(priceInput ?? 0);
    if (!price || price <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    try {
      const newProduct = await inventoryAPI.addProduct({
        name,
        category: 'General',
        unit: 'units',
        current_stock: 10,
        reorder_threshold: 5,
        cost_price: price * 0.7,
        selling_price: price,
      });
      setProducts((prev) => [normalizeProduct(newProduct), ...prev]);
    } catch (err) {
      console.error('Unable to add product', err);
      alert('Failed to add product.');
    }
  };

  const filteredProducts = useMemo(() => {
    const source = products.length ? products : MOCK_PRODUCTS;
    return source.filter((product) => {
      const query = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku?.toString().toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === 'Critical') {
        return product.status === 'CRITICAL';
      }
      if (filter === 'Low Stock') {
        return product.status !== 'HEALTHY';
      }
      if (filter === 'Healthy') {
        return product.status === 'HEALTHY';
      }
      return true;
    });
  }, [products, search, filter]);

  return (
    <div className="px-6 pt-6 space-y-8">
      <section>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Inventory</h2>
        <p className="text-on-surface-variant text-sm font-medium">Manage your stock levels, search products, and make updates quickly.</p>
      </section>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, SKUs..."
          className="w-full bg-surface-container-high rounded-2xl py-4 pl-12 pr-4 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all placeholder:text-on-surface-variant/40"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All Items', 'Critical', 'Low Stock', 'Healthy'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              'px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
              filter === item
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-3xl bg-error-container/10 border border-error-container p-4 text-error">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {(loading ? MOCK_PRODUCTS : filteredProducts).map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 group border border-surface-container-highest/30"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-low shrink-0">
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
                  {product.stock}/{product.maxStock ?? Math.max(product.stock + 10, 20)} units
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={product.status} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRestock(product)}
                  className="bg-primary p-2 rounded-xl text-on-primary hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="bg-surface-container p-2 rounded-xl text-error hover:bg-error-container/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddProduct}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-[0_12px_32px_-4px_rgba(31,16,142,0.3)] flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: StockStatus }) {
  const styles = {
    CRITICAL: 'bg-error-container text-on-error-container',
    WARNING: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    HEALTHY: 'bg-surface-container text-on-tertiary-fixed-variant',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-[0.6rem] font-black tracking-widest uppercase',
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
