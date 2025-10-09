// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.MODE === 'production' 
      ? 'https://zalo-mini-app-ecommerce.onrender.com/api'
      : 'https://zalo-mini-app-ecommerce.onrender.com/api'), // Use production API for development too
  ENDPOINTS: {
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    PROMOTIONS: '/promotions',
    VOUCHERS: '/vouchers',
    UTILITIES: '/utilities',
    USER: '/user',
    CART: '/cart',
    ORDERS: '/orders'
  }
};

// App Configuration from environment variables
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'UnionMart',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ZALO_APP_ID: import.meta.env.VITE_ZALO_APP_ID || '',
  MODE: import.meta.env.MODE || 'development'
};
