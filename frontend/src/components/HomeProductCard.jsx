import { Star } from 'lucide-react';
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/homeProductCard.scss';

const HomeProductCard = memo(({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    navigate(`/product/${product.id}`);
  }, [navigate, product.id]);

  const handleBuyNow = useCallback((e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  }, [navigate, product.id]);

  const discountPrice = product.discount ? 
    Math.round(Number(product.price) * (1 - Number(product.discount) / 100)) : 
    Number(product.price);

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

  return (
    <div 
      className="home-product-card"
      onClick={handleCardClick}
    >
      <div className="home-product-image">
        <img 
          src={product.image} 
          alt={product.name}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="fallback-icon" style={{display: 'none'}}>
          📦
        </div>
      </div>
      
      <h3 className="home-product-title">
        {product.name}
      </h3>
      
      <div className="home-product-rating">
        <div className="stars">
          {renderStars(product.rating)}
        </div>
        <span className="rating-text">({product.reviews})</span>
      </div>
      
      <div className="home-product-price">
        <div className="price-info">
          {product.discount > 0 && (
            <span className="original-price">
              {product.price.toLocaleString()}₫
            </span>
          )}
          <span className="current-price">
            {discountPrice.toLocaleString()}₫
          </span>
        </div>
        {product.discount > 0 && (
          <span className="discount-badge">
            -{product.discount}%
          </span>
        )}
      </div>
      
      <button 
        className="home-product-button"
        onClick={handleBuyNow}
      >
        Mua ngay
      </button>
    </div>
  );
});

HomeProductCard.displayName = 'HomeProductCard';

export default HomeProductCard;
