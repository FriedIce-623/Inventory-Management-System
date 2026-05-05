// ─── Auth ────────────────────────────────────────────────────────────────────

export interface ShopRegister {
  shop_name: string;
  owner_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  gstin?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ShopOut {
  shop_id: string;
  shop_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  state?: string;
  district?: string;
  city?: string;
  created_at: string;
}

// ─── Products / Inventory ────────────────────────────────────────────────────

export interface ProductOut {
  product_id: string;
  shop_id: string;
  product_name: string;
  category: string | null;
  unit: string;
  current_stock: number;
  reorder_threshold: number;
  cost_price: number | null;
  selling_price: number | null;
  sku_code: string | null;
  needs_restock: boolean;
}

export interface ProductCreate {
  product_name: string;
  category?: string;
  unit?: string;
  current_stock?: number;
  reorder_threshold?: number;
  cost_price?: number;
  selling_price?: number;
  sku_code?: string;
}

export interface ProductUpdate {
  product_name?: string;
  category?: string;
  unit?: string;
  current_stock?: number;
  reorder_threshold?: number;
  cost_price?: number;
  selling_price?: number;
  sku_code?: string;
}

export type StockStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export function getStockStatus(product: ProductOut): StockStatus {
  if (product.needs_restock || product.current_stock < product.reorder_threshold) {
    return 'CRITICAL';
  }
  if (product.current_stock < product.reorder_threshold * 1.5) {
    return 'WARNING';
  }
  return 'HEALTHY';
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export interface SaleCreate {
  product_id: string;
  quantity_sold: number;
  sale_date?: string;
  note?: string;
}

export interface SaleOut {
  log_id: string;
  shop_id: string;
  product_id: string;
  quantity_sold: number;
  sale_date: string;
  note: string | null;
  created_at: string;
}

export interface SaleSummary {
  product_id: string;
  total_units_sold: number;
  total_transactions: number;
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export interface PredictionOut {
  product_id: string;
  product_name: string;
  forecast_days: number;
  predicted_demand: number;
  current_stock: number;
  suggested_reorder: number;
  confidence: string;
  model_tier: string;
}
