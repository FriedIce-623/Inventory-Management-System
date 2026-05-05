export type StockStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export interface Product {
  id: string | number;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  maxStock?: number;
  status: StockStatus;
  image: string;
  category: string;
  description?: string;
  current_stock?: number;
  reorder_threshold?: number;
  needs_restock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SalesSummary {
  product_id: number;
  total_units_sold: number;
  total_transactions: number;
}

export interface Prediction {
  product_id: number;
  product_name: string;
  forecast_days: number;
  predicted_demand: number;
  current_stock: number;
  suggested_reorder: number;
  confidence: string;
}
