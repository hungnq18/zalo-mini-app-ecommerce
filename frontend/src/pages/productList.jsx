import { Grid, List } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from 'zmp-ui';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import '../css/productListPage.scss';

const ProductListPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  
  // UI State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);
  const [activeCategoryId, setActiveCategoryId] = useState(categoryId || 'all');
  
  // Filter State - Optimized with useCallback
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: true,
    featured: false
  });
  
  // Memoized data
  const siblingCategories = useMemo(() => state.categories || [], [state.categories]);
  const currentIndex = useMemo(() => 
    siblingCategories.findIndex(c => String(c.id) === String(activeCategoryId)), 
    [siblingCategories, activeCategoryId]
  );

  // Optimized navigation functions with useCallback
  const gotoPrevCategory = useCallback(() => {
    if (!siblingCategories || siblingCategories.length === 0) return;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : siblingCategories.length - 1;
    const prev = siblingCategories[prevIndex];
    if (prev) setActiveCategoryId(prev.id);
  }, [siblingCategories, currentIndex]);

  const gotoNextCategory = useCallback(() => {
    if (!siblingCategories || siblingCategories.length === 0) return;
    const nextIndex = currentIndex < siblingCategories.length - 1 ? currentIndex + 1 : 0;
    const next = siblingCategories[nextIndex];
    if (next) setActiveCategoryId(next.id);
  }, [siblingCategories, currentIndex]);

  const category = useMemo(() => {
    if (!state.categories || state.categories.length === 0) return null;
    if (String(activeCategoryId) === 'all') {
      return { id: 'all', name: 'Tất cả sản phẩm' };
    }
    const targetId = String(activeCategoryId);
    return state.categories.find(cat => String(cat.id) === targetId) || null;
  }, [state.categories, activeCategoryId]);

  // Optimized products filtering with debounced search
  const products = useMemo(() => {
    const all = state.products || [];
    let filtered = all;
    
    // Category filter
    if (String(activeCategoryId) !== 'all') {
      const targetId = String(activeCategoryId);
      filtered = filtered.filter(product => {
        const ids = (product.categoryIds || []).map(id => String(id));
        return ids.includes(targetId);
      });
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.searchKeywords || []).some(keyword => 
          keyword.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    // Price range filter
    if (filters.minPrice && filters.minPrice.trim() !== '') {
      const minPrice = Number(filters.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) {
        filtered = filtered.filter(product => product.price >= minPrice);
      }
    }
    if (filters.maxPrice && filters.maxPrice.trim() !== '') {
      const maxPrice = Number(filters.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        filtered = filtered.filter(product => product.price <= maxPrice);
      }
    }
    
    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(product => product.rating >= Number(filters.rating));
    }
    
    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }
    
    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(product => product.isFeatured);
    }
    
    return filtered;
  }, [state.products, activeCategoryId, filters]);

  // Optimized filter handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: true,
      featured: false
    });
  }, []);

  // Optimized sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    
    switch (filters.sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'popular':
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    }
  }, [products, filters.sortBy]);

  useEffect(() => {
    if (!state.categories || state.categories.length === 0) {
      actions.loadCategories();
    }
    if (!state.products || state.products.length === 0) {
      actions.loadProducts();
    }
  }, []);

  // Sync URL param -> local active category when user lands or deep-links
  useEffect(() => {
    const nextId = categoryId || 'all';
    if (String(activeCategoryId) !== String(nextId)) {
      setActiveCategoryId(nextId);
    }
  }, [categoryId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  

  if (!state.categories || state.categories.length === 0) {
    return (
      <Page className="product-list-page">
        <div className="product-list-container">
          <div className="loading">Đang tải...</div>
        </div>
      </Page>
    );
  }

  if (!category) {
    return (
      <Page className="product-list-page">
        <div className="product-list-container">
          <div className="empty-state">Danh mục không tồn tại</div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="product-list-page">
      <div className="product-list-container">
        {/* Header sử dụng component tái sử dụng */}
        <PageHeader 
          title="Danh mục sản phẩm"
          onBackClick={() => navigate('/')}
          variant="colored"
        />
        
        {/* Content area - same pattern as cart page */}
        <div className="product-list-content">
          {/* Tabs for categories */}
          <div className="category-tabs">
          <button
            key="all"
            className={`tab-btn ${String(activeCategoryId) === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategoryId('all')}
          >
            Tất cả
          </button>
          {siblingCategories.map((c) => (
            <button
              key={c.id}
              className={`tab-btn ${String(c.id) === String(activeCategoryId) ? 'active' : ''}`}
              onClick={() => setActiveCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div className="view-controls-section">
          <div className="left-spacer"></div>
          <div className="category-name">
            <h2>{category.name}</h2>
          </div>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Xem dạng lưới"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Xem dạng danh sách"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="search-sort-wrapper" ref={sortDropdownRef}>
          <div className="search-filter-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="sort-button-container">
                <button
                  className="sort-button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <span className="sort-icon">⇅</span>
                  <span className="sort-text">Sắp xếp</span>
                </button>
              </div>
            </div>
            
            {showSortDropdown && (
              <div className="sort-dropdown-menu">
                <div 
                  className={`sort-option ${filters.sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('sortBy', 'newest');
                    setShowSortDropdown(false);
                  }}
                >
                  Mới nhất
                </div>
                <div 
                  className={`sort-option ${filters.sortBy === 'popular' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('sortBy', 'popular');
                    setShowSortDropdown(false);
                  }}
                >
                  Phổ biến
                </div>
                <div 
                  className={`sort-option ${filters.sortBy === 'price_asc' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('sortBy', 'price_asc');
                    setShowSortDropdown(false);
                  }}
                >
                  Giá thấp → cao
                </div>
                <div
                  className={`sort-option ${filters.sortBy === 'price_desc' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('sortBy', 'price_desc');
                    setShowSortDropdown(false);
                  }}
                >
                  Giá cao → thấp
                </div>
                <div
                  className={`sort-option ${filters.sortBy === 'rating' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('sortBy', 'rating');
                    setShowSortDropdown(false);
                  }}
                >
                  Đánh giá cao
                </div>
                <div 
                  className={`sort-option ${filters.sortBy === 'name' ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange('sortBy', 'name');
                    setShowSortDropdown(false);
                  }}
                >
                  Tên A-Z
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Count */}
        <div className="product-count">
          {sortedProducts.length} sản phẩm
        </div>

        {/* Products Grid/List */}
        <div className={`products-container ${viewMode}`}>
          {sortedProducts.length === 0 ? (
            <div className="skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
          ) : (
            sortedProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.discount && (
                    <div className="discount-badge">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  
                  {viewMode === 'list' && (
                    <p className="product-description">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="product-rating">
                    <span className="stars">
                      {'★'.repeat(Math.floor(product.rating || 0))}
                      {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                    </span>
                    <span className="rating-text">
                      ({product.rating || 0})
                    </span>
                  </div>
                  
                  <div className="product-price">
                    <span className="current-price">
                      {product.price?.toLocaleString('vi-VN')}đ
                    </span>
                    {product.originalPrice && (
                      <span className="original-price">
                        {product.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                      {product.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Page>
  );
};

export default ProductListPage;
