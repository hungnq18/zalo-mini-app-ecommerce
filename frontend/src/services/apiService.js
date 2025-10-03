// API Service for UnionMart
import { API_CONFIG } from '../config/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check if response has content
    const text = await response.text();
    if (!text || text === 'undefined') {
      throw new Error('Empty or undefined response');
    }
    
    const data = JSON.parse(text);
    console.log('API Response parsed:', data);
    // If server already wraps responses in { success: true, data: ... }, unwrap once
    if (data && typeof data === 'object' && data.success && data.data !== undefined) {
      return { success: true, data: data.data };
    }
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

class ApiService {
  // Products API - Optimized with caching and better filtering
  static async getProducts(filters = {}) {
    let endpoint = API_CONFIG.ENDPOINTS.PRODUCTS;
    
    // Build optimized query string for filters
    const queryParams = new URLSearchParams();
    
    // Direct ID filtering - highest priority
    if (filters.id) {
      queryParams.append('id', filters.id);
      return await apiCall(`${endpoint}?${queryParams.toString()}`);
    }
    
    // Category filtering - optimized for performance
    if (filters.category) {
      // Primary filter: categoryIds (most efficient)
      queryParams.append('categoryIds_like', filters.category);
      // Fallback for legacy data
      queryParams.append('categories_like', filters.category);
    }
    
    // Search optimization - use searchKeywords for better results
    if (filters.search) {
      // Use both general search and keyword search for better results
      queryParams.append('q', filters.search);
      queryParams.append('searchKeywords_like', filters.search);
    }
    
    // Tag filtering - optimized
    if (filters.tags && filters.tags.length > 0) {
      // Use OR logic for multiple tags
      filters.tags.forEach(tag => {
        queryParams.append('tags_like', tag);
      });
    }
    
    // Price range filtering
    if (filters.minPrice) {
      queryParams.append('price_gte', filters.minPrice);
    }
    
    if (filters.maxPrice) {
      queryParams.append('price_lte', filters.maxPrice);
    }
    
    // Rating filtering
    if (filters.rating) {
      queryParams.append('rating_gte', filters.rating);
    }
    
    // Stock filtering
    if (filters.inStock !== undefined) {
      queryParams.append('stock_gte', filters.inStock ? 1 : 0);
    }
    
    // Active products only (default)
    if (filters.isActive !== false) {
      queryParams.append('isActive', true);
    }
    
    // Featured products filter
    if (filters.featured) {
      queryParams.append('isFeatured', true);
    }
    
    // Sorting optimization
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          queryParams.append('_sort', 'price');
          queryParams.append('_order', 'asc');
          break;
        case 'price_desc':
          queryParams.append('_sort', 'price');
          queryParams.append('_order', 'desc');
          break;
        case 'rating':
          queryParams.append('_sort', 'rating');
          queryParams.append('_order', 'desc');
          break;
        case 'newest':
          queryParams.append('_sort', 'updatedAt');
          queryParams.append('_order', 'desc');
          break;
        case 'popular':
          queryParams.append('_sort', 'reviews');
          queryParams.append('_order', 'desc');
          break;
        default:
          queryParams.append('_sort', 'updatedAt');
          queryParams.append('_order', 'desc');
      }
    } else {
      // Default sort by updatedAt for better performance
      queryParams.append('_sort', 'updatedAt');
      queryParams.append('_order', 'desc');
    }
    
    // Pagination
    if (filters.limit) {
      queryParams.append('_limit', filters.limit);
    }
    
    if (filters.page) {
      queryParams.append('_page', filters.page);
    }
    
    // Add query string to endpoint
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }
    
    return await apiCall(endpoint);
  }
  
  static async getProductById(id) {
    return await apiCall(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }

  // Categories API - Optimized
  static async getCategories() {
    return await apiCall(`${API_CONFIG.ENDPOINTS.CATEGORIES}?isActive=true&_sort=sortOrder&_order=asc`);
  }

  static async getCategoryById(id) {
    return await apiCall(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  }

  // Search API - Optimized with full-text search
  static async searchProducts(query, filters = {}) {
    const searchFilters = {
      ...filters,
      search: query,
      // Enable full-text search
      _limit: filters.limit || 20
    };
    
    return await this.getProducts(searchFilters);
  }

  static async addProductReview(productId, review) {
    // Load current product
    const productRes = await this.getProductById(productId);
    if (!productRes.success) return productRes;
    const product = productRes.data;

    const reviewsList = Array.isArray(product.reviewsList) ? [...product.reviewsList] : [];
    const newReview = {
      author: review.author || 'Người dùng',
      stars: Number(review.stars) || 5,
      comment: review.comment || '',
      date: review.date || new Date().toLocaleDateString('vi-VN')
    };
    reviewsList.unshift(newReview);

    const updated = {
      ...product,
      reviewsList,
      reviews: (product.reviews || 0) + 1,
      rating: reviewsList.reduce((sum, r) => sum + (Number(r.stars) || 0), 0) / reviewsList.length
    };

    const response = await apiCall(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updated)
    });

    return response;
  }
  
  static async getHotProducts(limit = 8) {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?tags_like=hot&_limit=${limit}&_sort=rating&_order=desc`;
    return await apiCall(endpoint);
  }
  
  static async getNewProducts(limit = 8) {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?tags_like=new&_limit=${limit}&_sort=id&_order=desc`;
    return await apiCall(endpoint);
  }
  
  // Categories API
  static async getCategories() {
    return await apiCall(API_CONFIG.ENDPOINTS.CATEGORIES);
  }
  
  static async getCategoryById(id) {
    return await apiCall(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  }
  
  // Promotions API
  static async getPromotions() {
    return await apiCall(API_CONFIG.ENDPOINTS.PROMOTIONS);
  }

  // Vouchers API
  static async getVouchers() {
    return await apiCall(API_CONFIG.ENDPOINTS.VOUCHERS);
  }

  static async getVoucherById(id) {
    return await apiCall(`${API_CONFIG.ENDPOINTS.VOUCHERS}/${id}`);
  }

  static async updateVoucher(id, payload) {
    return await apiCall(`${API_CONFIG.ENDPOINTS.VOUCHERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
  
  static async getMainPromotions() {
    const endpoint = `${API_CONFIG.ENDPOINTS.PROMOTIONS}?type=main`;
    return await apiCall(endpoint);
  }
  
  // User API
  static async getUserInfo() {
    return await apiCall(API_CONFIG.ENDPOINTS.USER);
  }
  
  static async updateUserInfo(userData) {
    // Merge with existing user to avoid overwriting unrelated fields
    let current = {};
    try {
      const existing = await this.getUserInfo();
      if (existing.success) current = existing.data || {};
    } catch (e) {}
    const merged = { ...current, ...userData };
    return await apiCall(API_CONFIG.ENDPOINTS.USER, {
      method: 'PUT',
      body: JSON.stringify(merged)
    });
  }
  
  static async saveVoucher(voucherData) {
    return await apiCall('/api/vouchers', {
      method: 'POST',
      body: JSON.stringify(voucherData)
    });
  }
  
  // Cart API
  static async getCart() {
    return await apiCall(API_CONFIG.ENDPOINTS.CART);
  }
  
  static async addToCart(productId, quantity = 1) {
    const pid = String(productId);
    const qty = Math.max(1, Number(quantity || 1));
    // First get the product to add
    const productResponse = await this.getProductById(pid);
    
    if (!productResponse.success) {
      return productResponse;
    }
    
    // Get current cart
    const cartResponse = await this.getCart();
    
    if (!cartResponse.success) {
      return cartResponse;
    }
    
    const cart = cartResponse.data || { items: [], total: 0, itemCount: 0 };
    const product = productResponse.data;
    
    // Check if item already exists in cart
    if (!Array.isArray(cart.items)) cart.items = [];
    const existingItemIndex = cart.items.findIndex(item => String(item.productId) === pid);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity = Number(cart.items[existingItemIndex].quantity || 0) + qty;
    } else {
      cart.items.push({
        productId: pid,
        quantity: qty,
        price: Number(product.price),
        product: product
      });
    }
    
    // Update cart totals
    cart.itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    cart.total = cart.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    
    return await apiCall(API_CONFIG.ENDPOINTS.CART, {
      method: 'PUT',
      body: JSON.stringify(cart)
    });
  }
  
  static async removeFromCart(productId) {
    const cartResponse = await this.getCart();
    
    if (!cartResponse.success) {
      return cartResponse;
    }
    
    const cart = cartResponse.data;
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    // Update cart totals
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return await apiCall(API_CONFIG.ENDPOINTS.CART, {
      method: 'PUT',
      body: JSON.stringify(cart)
    });
  }
  
  static async updateCartItemQuantity(productId, quantity) {
    const cartResponse = await this.getCart();
    
    if (!cartResponse.success) {
      return cartResponse;
    }
    
    const cart = cartResponse.data;
    const item = cart.items.find(item => item.productId === productId);
    
    if (!item) {
      return {
        success: false,
        error: 'Item not found in cart'
      };
    }
    
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    
    item.quantity = quantity;
    
    // Update cart totals
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return await apiCall(API_CONFIG.ENDPOINTS.CART, {
      method: 'PUT',
      body: JSON.stringify(cart)
    });
  }
  
  static async clearCart() {
    const emptyCart = {
      items: [],
      total: 0,
      itemCount: 0
    };
    
    return await apiCall(API_CONFIG.ENDPOINTS.CART, {
      method: 'PUT',
      body: JSON.stringify(emptyCart)
    });
  }
  
  // Orders API
  static async getOrders() {
    return await apiCall(API_CONFIG.ENDPOINTS.ORDERS);
  }
  
  static async createOrder(orderData) {
    const newOrder = {
      ...orderData,
      id: Date.now(), // Simple ID generation
      orderNumber: `UM${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    const response = await apiCall(API_CONFIG.ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(newOrder)
    });
    
    // Clear cart after successful order
    if (response.success) {
      await this.clearCart();
    }
    
    return response;
  }
  
  // Utilities API
  static async getUtilities() {
    return await apiCall(API_CONFIG.ENDPOINTS.UTILITIES);
  }
  
  // Lucky Wheel API
  static async getWheelData() {
    return await apiCall('/lucky-wheel');
  }

  static async updateWheelConfig(config) {
    return await apiCall('/lucky-wheel/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  static async getWheelPrizes() {
    return await apiCall('/lucky-wheel/prizes');
  }

  static async updateWheelPrize(prizeId, prizeData) {
    return await apiCall(`/lucky-wheel/prizes/${prizeId}`, {
      method: 'PUT',
      body: JSON.stringify(prizeData)
    });
  }

  static async getVoucherTemplate(voucherId) {
    return await apiCall(`/lucky-wheel/voucher-templates/${voucherId}`);
  }

  static async logSpinResult(spinData) {
    return await apiCall('/lucky-wheel/spin-log', {
      method: 'POST',
      body: JSON.stringify(spinData)
    });
  }

  // Server-side spin: consume a spin, enforce cooldown/reset, update user and logs
  static async spinWheel(spinRequest) {
    return await apiCall('/lucky-wheel/spin', {
      method: 'POST',
      body: JSON.stringify(spinRequest)
    });
  }
  
  // Search API
  static async searchProducts(query, filters = {}) {
    const searchFilters = {
      search: query,
      ...filters
    };
    
    return this.getProducts(searchFilters);
  }
}

export default ApiService;