import * as SecureStore from 'expo-secure-store';
import {
  TokenResponse,
  ShopRegister,
  ShopOut,
  ProductOut,
  ProductCreate,
  ProductUpdate,
  SaleCreate,
  SaleOut,
  SaleSummary,
  PredictionOut,
} from './types';

// ─── Configuration ───────────────────────────────────────────────────────────
// Change this to your PC's local IP when testing on a physical device
// e.g., 'http://192.168.1.5:8000'
const API_BASE_URL = 'http://192.168.137.1:8000'; // Android emulator localhost alias

const TOKEN_KEY = 'auth_token';

// ─── Token Management ────────────────────────────────────────────────────────

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
  contentType: string = 'application/json',
): Promise<T> {
  const headers: Record<string, string> = {};

  if (contentType === 'application/json') {
    headers['Content-Type'] = 'application/json';
  } else {
    headers['Content-Type'] = contentType;
  }

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (data) {
    body = contentType === 'application/json' ? JSON.stringify(data) : data;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const ct = response.headers.get('content-type') || '';
    let detail = response.statusText;
    if (ct.includes('application/json')) {
      const err = await response.json();
      detail = err.detail || JSON.stringify(err);
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null as T;

  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return response.json();
  }
  return null as T;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const formData = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const result = await apiRequest<TokenResponse>(
      '/auth/login',
      'POST',
      formData,
      'application/x-www-form-urlencoded',
    );
    if (result.access_token) {
      await setAuthToken(result.access_token);
    }
    return result;
  },

  register: async (data: ShopRegister): Promise<ShopOut> => {
    return apiRequest<ShopOut>('/auth/register', 'POST', data);
  },

  getMe: async (): Promise<ShopOut> => {
    return apiRequest<ShopOut>('/auth/me');
  },

  logout: async (): Promise<void> => {
    await removeAuthToken();
  },
};

// ─── Inventory API ───────────────────────────────────────────────────────────

export const inventoryAPI = {
  getProducts: async (): Promise<ProductOut[]> => {
    return apiRequest<ProductOut[]>('/inventory/');
  },

  getLowStockAlerts: async (): Promise<ProductOut[]> => {
    return apiRequest<ProductOut[]>('/inventory/alerts');
  },

  getProduct: async (productId: string): Promise<ProductOut> => {
    return apiRequest<ProductOut>(`/inventory/${productId}`);
  },

  addProduct: async (data: ProductCreate): Promise<ProductOut> => {
    return apiRequest<ProductOut>('/inventory/', 'POST', data);
  },

  updateProduct: async (productId: string, data: ProductUpdate): Promise<ProductOut> => {
    return apiRequest<ProductOut>(`/inventory/${productId}`, 'PATCH', data);
  },

  deleteProduct: async (productId: string): Promise<void> => {
    return apiRequest<void>(`/inventory/${productId}`, 'DELETE');
  },
};

// ─── Sales API ───────────────────────────────────────────────────────────────

export const salesAPI = {
  logSale: async (data: SaleCreate): Promise<SaleOut> => {
    return apiRequest<SaleOut>('/sales/', 'POST', data);
  },

  getSales: async (productId?: string): Promise<SaleOut[]> => {
    const url = productId ? `/sales/?product_id=${productId}` : '/sales/';
    return apiRequest<SaleOut[]>(url);
  },

  getSalesSummary: async (): Promise<SaleSummary[]> => {
    return apiRequest<SaleSummary[]>('/sales/summary');
  },
};

// ─── Prediction API ──────────────────────────────────────────────────────────

export const predictionAPI = {
  getAllForecasts: async (forecastDays: number = 14): Promise<PredictionOut[]> => {
    return apiRequest<PredictionOut[]>(`/predictions/all?forecast_days=${forecastDays}`);
  },

  getProductForecast: async (productId: string, forecastDays: number = 14): Promise<PredictionOut> => {
    return apiRequest<PredictionOut>(`/predictions/${productId}?forecast_days=${forecastDays}`);
  },
};
