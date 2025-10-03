import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import ApiService from '../services/apiService';

// Force rebuild - useCallback fix v1.0.2

// Initial state
const initialState = {
  // Products
  products: [],
  categories: [],
  promotions: [],
  utilities: [],
  hotProducts: [],
  newProducts: [],
  
  // User
  user: null,
  
  // Cart
  cart: {
    items: [],
    total: 0,
    itemCount: 0
  },
  
  // Orders
  orders: [],
  
  // UI State
  loading: {
    products: false,
    categories: false,
    promotions: false,
    utilities: false,
    hotProducts: false,
    newProducts: false,
    user: false,
    cart: false
  },
  
  // Search
  searchQuery: '',
  searchResults: [],
  
  // Filters
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    tags: [],
    sortBy: null
  }
};

// Action types
const ActionTypes = {
  // Products
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_PROMOTIONS: 'SET_PROMOTIONS',
  SET_UTILITIES: 'SET_UTILITIES',
  SET_HOT_PRODUCTS: 'SET_HOT_PRODUCTS',
  SET_NEW_PRODUCTS: 'SET_NEW_PRODUCTS',
  
  // User
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
  
  // Cart
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  
  // Orders
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  
  // UI State
  SET_LOADING: 'SET_LOADING',
  
  // Search
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    // Products
    case ActionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };
    
    case ActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case ActionTypes.SET_PROMOTIONS:
      return { ...state, promotions: action.payload };
    
    case ActionTypes.SET_UTILITIES:
      return { ...state, utilities: action.payload };
    
    case ActionTypes.SET_HOT_PRODUCTS:
      return { ...state, hotProducts: action.payload };
    
    case ActionTypes.SET_NEW_PRODUCTS:
      return { ...state, newProducts: action.payload };
    
    // User
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case ActionTypes.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    
    // Cart
    case ActionTypes.SET_CART:
      return { ...state, cart: action.payload };
    
    case ActionTypes.ADD_TO_CART:
      return { ...state, cart: action.payload };
    
    case ActionTypes.REMOVE_FROM_CART:
      return { ...state, cart: action.payload };
    
    case ActionTypes.UPDATE_CART_ITEM:
      return { ...state, cart: action.payload };
    
    case ActionTypes.CLEAR_CART:
      return { ...state, cart: action.payload };
    
    // Orders
    case ActionTypes.SET_ORDERS:
      return { ...state, orders: action.payload };
    
    case ActionTypes.ADD_ORDER:
      return { ...state, orders: [action.payload, ...state.orders] };
    
    // UI State
    case ActionTypes.SET_LOADING:
      return { 
        ...state, 
        loading: { ...state.loading, ...action.payload } 
      };
    
    // Search
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    
    // Filters
    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case ActionTypes.CLEAR_FILTERS:
      return { 
        ...state, 
        filters: {
          category: null,
          minPrice: null,
          maxPrice: null,
          tags: [],
          sortBy: null
        }
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Actions - using useCallback to prevent infinite re-renders
  const loadProducts = useCallback(async (filters = {}) => {
    // Avoid refetch if data already loaded and no filters
    if (!filters || Object.keys(filters).length === 0) {
      if (state.products && state.products.length > 0) {
        return;
      }
    }
    dispatch({ type: ActionTypes.SET_LOADING, payload: { products: true } });
    try {
      const response = await ApiService.getProducts(filters);
      if (response.success) {
        dispatch({ type: ActionTypes.SET_PRODUCTS, payload: response.data });
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { products: false } });
    }
  }, [state.products]);

  const actions = useMemo(() => ({
    // Products
    loadProducts,
    
    loadCategories: async () => {
      if (state.categories && state.categories.length > 0) {
        return;
      }
      dispatch({ type: ActionTypes.SET_LOADING, payload: { categories: true } });
      try {
        const response = await ApiService.getCategories();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_CATEGORIES, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { categories: false } });
      }
    },
    
    loadPromotions: async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { promotions: true } });
      try {
        const response = await ApiService.getPromotions();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_PROMOTIONS, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading promotions:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { promotions: false } });
      }
    },

    loadVouchers: async () => {
      try {
        const response = await ApiService.getVouchers();
        if (response.success) {
          // store vouchers in promotions for now if there's no dedicated field
          // or extend state with vouchers as needed
          // Here we keep them in promotions to reuse state
          dispatch({ type: ActionTypes.SET_PROMOTIONS, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading vouchers:', error);
      }
    },
    
    loadUtilities: async () => {
      // Check if utilities are already loaded or currently loading
      if ((state.utilities && state.utilities.length > 0) || state.loading.utilities) {
        console.log('Utilities already loaded or loading, skipping...');
        return;
      }
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: { utilities: true } });
      try {
        console.log('Loading utilities from API...');
        const response = await ApiService.getUtilities();
        console.log('Utilities API response:', response);
        if (response.success && response.data) {
          // Use only API data, no hardcoded fallback
          console.log('Setting utilities from API:', response.data);
          dispatch({ type: ActionTypes.SET_UTILITIES, payload: response.data });
        } else {
          // Show error if API fails
          console.error('Failed to load utilities from API');
          dispatch({ type: ActionTypes.SET_UTILITIES, payload: [] });
        }
      } catch (error) {
        console.error('Error loading utilities:', error);
        // Show empty state on error
        dispatch({ type: ActionTypes.SET_UTILITIES, payload: [] });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { utilities: false } });
      }
    },
    
    loadHotProducts: async () => {
      try {
        const response = await ApiService.getHotProducts();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_HOT_PRODUCTS, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading hot products:', error);
      }
    },
    
    loadNewProducts: async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { newProducts: true } });
      try {
        const response = await ApiService.getNewProducts();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_NEW_PRODUCTS, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading new products:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { newProducts: false } });
      }
    },
    
    // User
    loadUser: async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { user: true } });
      try {
        const response = await ApiService.getUserInfo();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_USER, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { user: false } });
      }
    },
    
    updateUser: async (userData) => {
      try {
        const response = await ApiService.updateUserInfo(userData);
        if (response.success) {
          dispatch({ type: ActionTypes.UPDATE_USER, payload: userData });
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
    
    // Cart
    loadCart: async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { cart: true } });
      try {
        const response = await ApiService.getCart();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_CART, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { cart: false } });
      }
    },
    
    addToCart: async (productId, quantity = 1) => {
      try {
        const response = await ApiService.addToCart(productId, quantity);
        if (response.success) {
          dispatch({ type: ActionTypes.ADD_TO_CART, payload: response.data });
        }
        return response;
      } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: String(error) };
      }
    },
    
    removeFromCart: async (productId) => {
      try {
        const response = await ApiService.removeFromCart(productId);
        if (response.success) {
          dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: response.data });
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    },
    
    updateCartItemQuantity: async (productId, quantity) => {
      try {
        const response = await ApiService.updateCartItemQuantity(productId, quantity);
        if (response.success) {
          dispatch({ type: ActionTypes.UPDATE_CART_ITEM, payload: response.data });
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
      }
    },
    
    clearCart: async () => {
      try {
        const response = await ApiService.clearCart();
        if (response.success) {
          dispatch({ type: ActionTypes.CLEAR_CART, payload: response.data });
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    },
    
    // Orders
    loadOrders: async () => {
      try {
        const response = await ApiService.getOrders();
        if (response.success) {
          dispatch({ type: ActionTypes.SET_ORDERS, payload: response.data });
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    },
    
    createOrder: async (orderData) => {
      try {
        const response = await ApiService.createOrder(orderData);
        if (response.success) {
          dispatch({ type: ActionTypes.ADD_ORDER, payload: response.data });
        }
        return response;
      } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: String(error) };
      }
    },
    
    // Search
    setSearchQuery: (query) => {
      dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
    },
    
    searchProducts: async (query, filters = {}) => {
      try {
        const response = await ApiService.searchProducts(query, filters);
        if (response.success) {
          dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: response.data });
        }
        return response;
      } catch (error) {
        console.error('Error searching products:', error);
        return { success: false, error: String(error) };
      }
    },
    
    // Filters
    setFilters: (filters) => {
      dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
    },
    
    clearFilters: () => {
      dispatch({ type: ActionTypes.CLEAR_FILTERS });
    }
  }), [state.utilities, state.loading.utilities, state.categories, loadProducts]);
  
  // Load initial data
  useEffect(() => {
    actions.loadCategories();
    loadProducts(); // Use the memoized version
    actions.loadPromotions();
    actions.loadUtilities();
    actions.loadHotProducts();
    actions.loadNewProducts();
    actions.loadUser();
    actions.loadCart();
    actions.loadOrders();
  }, [actions, loadProducts]); // Add dependencies
  
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
