import { ArrowLeft, Search } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Page } from 'zmp-ui';
import BottomNavigation from '../components/bottomNavigation';
import HomeProductCard from '../components/HomeProductCard';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import '../css/searchPage.scss';

const SearchPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchCache, setSearchCache] = useState(new Map());

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Load recent searches and products from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    const savedProducts = localStorage.getItem('recentProducts');
    if (savedProducts) {
      setRecentProducts(JSON.parse(savedProducts));
    } else {
      // Load from state.products if no saved products
      if (state.products && state.products.length > 0) {
        const sampleProducts = state.products.slice(0, 4).map(product => ({
          ...product,
          rating: product.rating || 4.5,
          reviews: product.reviews || Math.floor(Math.random() * 1000) + 100,
          discount: product.discount || Math.floor(Math.random() * 30) + 10
        }));
        setRecentProducts(sampleProducts);
      }
    }
  }, [state.products]);

  // Optimized search with caching and debouncing
  const handleSearch = useCallback(async (query) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    // Check cache first
    if (searchCache.has(q)) {
      setSearchResults(searchCache.get(q));
      return;
    }

    setIsSearching(true);
    try {
      const response = await actions.searchProducts(q);
      if (response?.success) {
        const results = response.data || [];
        setSearchResults(results);
        
        // Cache results
        setSearchCache(prev => {
          const newCache = new Map(prev);
          newCache.set(q, results);
          // Keep only last 50 searches in cache
          if (newCache.size > 50) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          return newCache;
        });
        
        // Update recent searches
        const newRecent = [q, ...recentSearches.filter(item => item !== q)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [actions, searchCache, recentSearches]);

  // Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId;
    return (query) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleSearch(query), 300);
    };
  }, [handleSearch]);

  // Search suggestions based on products
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const allProducts = state.products || [];
    const suggestions = new Set();
    
    allProducts.forEach(product => {
      // Add product name suggestions
      if (product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.add(product.name);
      }
      
      // Add keyword suggestions
      if (product.searchKeywords) {
        product.searchKeywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
            suggestions.add(keyword);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [searchQuery, state.products]);

  // Handle recent search click
  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <Page className="search-page">
      <div className="search-container">
        {/* Search Header */}
        <div className="search-header">
          <div className="search-header-content">
            <button className="back-button pt-10" onClick={handleBack}>
              <ArrowLeft size={20} />
              <span>Trở lại</span>
            </button>
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Lucky Spin Banner */}
        {!searchQuery && (
          <div className="lucky-spin-banner">
            <div className="banner-content">
              <h2>Nhận lượt chơi vòng quay may mắn</h2>
              <p>khi QUAN TÂM</p>
              <Button 
                className="follow-button"
                variant="primary"
              >
                Quan tâm ngay
              </Button>
            </div>
          </div>
        )}

        {/* Recent Products */}
        {!searchQuery && (
          <div className="recent-products-section">
            <h3 className="recent-products-title">Sản phẩm xem gần đây</h3>
            {recentProducts.length > 0 ? (
              <div className="recent-products-grid">
                {recentProducts.slice(0, 4).map((product) => (
                  <HomeProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="no-recent-products">
                <p>Chưa có sản phẩm xem gần đây</p>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="search-results">
            <div className="search-results-header">
              <h3>Kết quả tìm kiếm cho "{searchQuery}"</h3>
              <span className="results-count">
                {isSearching ? 'Đang tìm...' : `${searchResults.length} kết quả`}
              </span>
            </div>

            {isSearching ? (
              <div className="search-loading">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="product-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-price"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="products-list">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="list"
                    showBuyButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Hãy thử từ khóa khác hoặc kiểm tra chính tả</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNavigation />
    </Page>
  );
};

export default SearchPage;
