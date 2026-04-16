export type StockStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  maxStock: number;
  status: StockStatus;
  image: string;
  category: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
