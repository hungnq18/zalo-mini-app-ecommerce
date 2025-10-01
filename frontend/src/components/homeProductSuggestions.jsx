import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';
import '../css/homeProductSuggestions.scss';

const HomeProductSuggestions = () => {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  
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

  // Load products when component mounts
  useEffect(() => {
    if (state.products.length === 0) {
      actions.loadProducts();
    }
  }, [actions, state.products.length]);

  // Get newest products from database (sorted by ID - higher ID = newer)
  const newestProducts = state.products
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  const suggestions = newestProducts.map(product => {
    // Dynamic features based on product
    const getFeatures = (product) => {
      const features = [];
      if (product.discount > 0) features.push(`GIẢM ${product.discount}%`);
      if (product.rating >= 4.5) features.push("CHẤT LƯỢNG CAO");
      if (product.stock > 50) features.push("CÒN HÀNG");
      return features.length > 0 ? features : ["SẢN PHẨM MỚI"];
    };

    return {
      ...product,
      features: getFeatures(product)
    };
  });

  // Show loading state if no products
  if (state.loading.products || suggestions.length === 0) {
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

  return (
    <div className="home-product-suggestions-container">
      <div className="home-product-suggestions-header">
        <h2>Sản phẩm mới nhất</h2>
      </div>
      
      <div className="home-product-suggestions-scroll">
        <div className="home-product-suggestions-list">
          {suggestions.map((product) => (
            <div key={product.id} className="home-product-suggestion-card" onClick={() => navigate(`/product/${product.id}`)}>
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
                
                {/* Product Tags */}
                <div className="product-tags">
                  {product.tags.map((tag, index) => (
                    <div key={index} className="product-tag">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="suggestion-content">
                <h3 className="suggestion-title">{product.name}</h3>
                
                {/* Product Description */}
                <div className="product-description">
                  <p className="description-text">
                    {product.detailedDescription || product.description}
                  </p>
                </div>
                
                {/* Categories */}
                <div className="product-categories">
                  {(Array.isArray(product.categories) ? product.categories : [product.category]).map((category, index) => (
                    <span key={index} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
                
                {/* Product Tags */}
                <div className="product-tags-section">
                  <div className="tags-grid">
                    {product.tags.map((tag, index) => (
                      <div key={index} className="tag-item">
                        <span className="tag-text">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price and Rating */}
                <div className="suggestion-footer">
                  <div className="price-section">
                    {product.discount > 0 && (
                      <span className="original-price">
                        {product.originalPrice?.toLocaleString()}₫
                      </span>
                    )}
                    <span className="current-price">
                      {product.price.toLocaleString()}₫
                    </span>
                  </div>
                  
                  <div className="rating-section">
                    <div className="stars">
                      {'★'.repeat(Math.floor(product.rating))}
                    </div>
                    <span className="rating-text">({product.reviews})</span>
                  </div>
                </div>
                
                <button className="suggestion-button">
                  Mua ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeProductSuggestions;
