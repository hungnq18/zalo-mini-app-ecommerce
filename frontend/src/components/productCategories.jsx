import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../css/productCategories.scss';

const ProductCategories = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  const categories = state.categories.length > 0 ? state.categories : [];

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="product-categories-container">
      <div className="product-categories-header">
        <h2>Danh mục sản phẩm</h2>
      </div>
      
      <div className="product-categories-grid">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="product-category-card"
            onClick={() => handleCategoryClick(category.id)}
          >
            <img 
              src={category.icon} 
              alt={category.name}
              className="product-category-icon"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="product-category-icon" style={{display: 'none'}}>
              📦
            </span>
            <div className="product-category-name">
              {category.name}
            </div>
            {category.productCount > 0 && (
              <div className="product-category-count">
                {category.productCount} sản phẩm
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProductCategories;