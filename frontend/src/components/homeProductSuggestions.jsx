import { Star } from 'lucide-react';
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';
import '../css/homeProductSuggestions.scss';

const HomeProductSuggestions = memo(() => {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);
  
  // Check if context is available
  if (!appContext) {
    return (
      <div className="home-product-suggestions-container">
        <div className="home-product-suggestions-header">
          <h2>Sản phẩm mới nhất</h2>
        </div>
        <div className="home-product-suggestions-loading">
          <div className="home-product-suggestions-scroll">
            <div className="home-product-suggestions-list">
              {[1, 2, 3].map((index) => (
                <div key={index} className="home-product-suggestion-card">
                  <div className="suggestion-image">
                    <div className="skeleton"></div>
                  </div>
                  <div className="suggestion-content">
                    <div className="skeleton suggestion-title"></div>
                    <div className="product-tags-section">
                      <div className="tags-grid">
                        {[1, 2].map((i) => (
                          <div key={i} className="tag-item">
                            <div className="skeleton"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="suggestion-footer">
                      <div className="skeleton"></div>
                    </div>
                    <div className="skeleton suggestion-button"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { state, actions } = appContext;

  // Memoize navigation handler
  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Memoize newest products to prevent unnecessary re-renders
  const newestProducts = useMemo(() => {
    if (!state.products || state.products.length === 0) return [];
    return state.products
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  }, [state.products]);

  // Memoize star rendering function
  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />);
    }
    for (let i = fullStars; i < 5; i++) {
      stars.push(<Star key={i} size={12} fill="none" color="#d1d5db" />);
    }
    return stars;
  }, []);

  // Load products only once when component mounts
  useEffect(() => {
    if (!hasLoadedRef.current && (!state.products || state.products.length === 0)) {
      hasLoadedRef.current = true;
      actions.loadProducts();
    }
  }, [state.products?.length]); // Remove actions from dependencies to prevent infinite loop

  // Show loading state if no products
  if (state.loading?.products || newestProducts.length === 0) {
    return (
      <div className="home-product-suggestions-container">
        <div className="home-product-suggestions-header">
          <h2>Sản phẩm mới nhất</h2>
        </div>
        <div className="home-product-suggestions-loading">
          <div className="home-product-suggestions-scroll">
            <div className="home-product-suggestions-list">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="home-product-suggestion-card">
                  <div className="suggestion-image">
                    <div className="skeleton"></div>
                  </div>
                  <div className="suggestion-content">
                    <div className="skeleton suggestion-title"></div>
                    <div className="suggestion-footer">
                      <div className="skeleton"></div>
                    </div>
                    <div className="skeleton suggestion-button"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-product-suggestions-container">
      <div className="home-product-suggestions-header">
        <h2>Sản phẩm mới nhất</h2>
      </div>
      
      <div className="home-product-suggestions-scroll">
        <div className="home-product-suggestions-list">
          {newestProducts.map((product) => {
            const discountPrice = product.discount ? 
              Math.round(Number(product.price) * (1 - Number(product.discount) / 100)) : 
              Number(product.price);

            return (
              <div 
                key={product.id} 
                className="home-product-suggestion-card" 
                onClick={() => handleProductClick(product.id)}
              >
                <div className="suggestion-image">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="suggestion-image-fallback" style={{display: 'none'}}>
                    <span>🧴</span>
                  </div>
                  
                  {product.discount && product.discount > 0 && (
                    <div className="discount-badge">
                      -{product.discount}%
                    </div>
                  )}
                </div>
                
                <div className="suggestion-content">
                  <h3 className="suggestion-title">{product.name}</h3>
                  
                  <div className="suggestion-footer">
                    <div className="price-section">
                      {product.discount > 0 && (
                        <span className="original-price">
                          {product.price.toLocaleString()}₫
                        </span>
                      )}
                      <span className="current-price">
                        {discountPrice.toLocaleString()}₫
                      </span>
                    </div>
                    
                    <div className="rating-section">
                      <div className="stars">
                        {renderStars(product.rating)}
                      </div>
                      <span className="rating-text">({product.reviews || 0})</span>
                    </div>
                  </div>
                  
                  <button 
                    className="suggestion-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id);
                    }}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

HomeProductSuggestions.displayName = 'HomeProductSuggestions';

export default HomeProductSuggestions;
