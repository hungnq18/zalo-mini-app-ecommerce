import { Star } from 'lucide-react';
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/productCard.scss';

const ProductCard = memo(({ 
  product, 
  variant = 'grid', // 'grid' or 'list'
  showBuyButton = true,
  onClick 
}) => {
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  }, [onClick, product, navigate]);

  const handleBuyNow = useCallback((e) => {
    e.stopPropagation();
    // Logic mua ngay - có thể customize sau
    navigate(`/product/${product.id}`);
  }, [product.id, navigate]);

  const discountPrice = product.discount ? 
    Math.round(Number(product.price) * (1 - Number(product.discount) / 100)) : 
    Number(product.price);

  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const emptyStars = 5 - fullStars;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={i + fullStars} size={12} fill="none" color="#d1d5db" />);
    }
    return stars;
  }, []);

  return (
    <div 
      className={`product-card ${variant === 'list' ? 'list-view' : 'grid-view'}`}
      onClick={handleCardClick}
    >
      <div className="product-image">
        <img 
          src={product.image} 
          alt={product.name}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-price-rating">
          <div className="product-price">
            <span className="current-price">
              {discountPrice.toLocaleString('vi-VN')}₫
            </span>
            {product.discount && product.discount > 0 && (
              <span className="original-price">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            )}
            {product.discount && product.discount > 0 && (
              <span className="discount-badge">
                -{product.discount}%
              </span>
            )}
          </div>
          
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.rating)}
            </div>
            <span className="rating-text">
              ({product.rating || 0})
            </span>
          </div>
        </div>
        
        {showBuyButton && (
          <button 
            className="buy-now-btn"
            onClick={handleBuyNow}
          >
            Mua ngay
          </button>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
