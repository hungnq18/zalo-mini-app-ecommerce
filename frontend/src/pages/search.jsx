import { ArrowLeft, Clock, Search, TrendingUp, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Page } from 'zmp-ui';
import BottomNavigation from '../components/bottomNavigation';
import { useApp } from '../context/AppContext';
import '../css/searchPage.scss';

const SearchPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchCache, setSearchCache] = useState(new Map());

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

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
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                <div className="search-suggestions">
                  {searchSuggestions.length > 0 && (
                    <div className="suggestion-group">
                      <div className="suggestion-title">
                        <TrendingUp size={14} />
                        Gợi ý tìm kiếm
                      </div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-item"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          <Search size={14} />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {recentSearches.length > 0 && (
                    <div className="suggestion-group">
                      <div className="suggestion-title">
                        <Clock size={14} />
                        Tìm kiếm gần đây
                        <button 
                          className="clear-recent"
                          onClick={clearRecentSearches}
                        >
                          <X size={12} />
                        </button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          className="suggestion-item"
                          onClick={() => {
                            setSearchQuery(search);
                            handleSearch(search);
                            setShowSuggestions(false);
                          }}
                        >
                          <Clock size={14} />
                          {search}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            <div className="banner-badge">6/6</div>
          </div>
        )}

        {/* Recent Searches */}
        {!searchQuery && (
          <div className="recent-searches-section">
            <h3 className="recent-searches-title">Tìm kiếm sản phẩm gần đây</h3>
            {recentSearches.length > 0 ? (
              <div className="recent-searches-list">
                {recentSearches.map((search, index) => (
                  <div 
                    key={index}
                    className="recent-search-item"
                    onClick={() => handleRecentSearch(search)}
                  >
                    <Search size={16} />
                    <span>{search}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-recent-searches">
                <p>Chưa có tìm kiếm gần đây</p>
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
              <div className="products-grid">
                {searchResults.map((product) => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="product-image">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <div className="product-price">
                        <span className="current-price">
                          {product.price.toLocaleString()}đ
                        </span>
                        {product.originalPrice && (
                          <span className="original-price">
                            {product.originalPrice.toLocaleString()}đ
                          </span>
                        )}
                      </div>
                      <div className="product-rating">
                        <span className="stars">⭐</span>
                        <span className="rating">{product.rating}</span>
                        <span className="reviews">({product.reviews})</span>
                      </div>
                    </div>
                  </div>
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
