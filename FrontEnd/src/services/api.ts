// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token');

// Helper for API requests
const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  data?: any
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const error = contentType.includes('application/json') ? await response.json() : { detail: response.statusText };
    throw new Error(error.detail || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : null;
};

// Sales/Orders API
export const ordersAPI = {
  // Create a new order
  createOrder: async (productId: number, quantity: number, notes?: string) => {
    return apiRequest('/sales/', 'POST', {
      product_id: productId,
      quantity_sold: quantity,
      notes: notes || 'Order from ML forecast recommendation',
      sale_date: new Date().toISOString(),
    });
  },

  // Get all orders
  getOrders: async (productId?: number) => {
    const url = productId ? `/sales/?product_id=${productId}` : '/sales/';
    return apiRequest(url);
  },

  // Get sales summary
  getSalesSummary: async () => {
    return apiRequest('/sales/summary');
  },
};

// Inventory API
export const inventoryAPI = {
  // Get all products
  getProducts: async () => {
    return apiRequest('/inventory/');
  },

  // Get low stock alerts
  getLowStockAlerts: async () => {
    return apiRequest('/inventory/alerts');
  },

  // Update product stock
  updateProduct: async (productId: number, data: any) => {
    return apiRequest(`/inventory/${productId}`, 'PATCH', data);
  },

  // Add new product
  addProduct: async (productData: any) => {
    return apiRequest('/inventory/', 'POST', productData);
  },

  // Delete a product
  deleteProduct: async (productId: number) => {
    return apiRequest(`/inventory/${productId}`, 'DELETE');
  },
};

// Forecast API
export const predictionAPI = {
  getForecast: async (productId: number, forecastDays = 14) => {
    return apiRequest(`/predictions/${productId}?forecast_days=${forecastDays}`);
  },

  getAllForecasts: async (forecastDays = 14) => {
    return apiRequest(`/predictions?forecast_days=${forecastDays}`);
  },
};

// Auth API
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
    }
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

export default {
  ordersAPI,
  inventoryAPI,
  predictionAPI,
  authAPI,
};
