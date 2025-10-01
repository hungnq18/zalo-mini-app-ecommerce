import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from "zmp-ui";
import BottomNavigation from '../components/bottomNavigation';
import Carousel from '../components/carousel';
import Header from '../components/header';
import SuggestionsForYou from '../components/homeProductSuggestions';
import PromotionalBanner from '../components/homePromotionalBanner';
import ProductCategories from '../components/productCategories';
import PromotionalAlert from '../components/promotionalAlert';
import RecentPosts from '../components/recentPosts';
import SuggestedUtilities from '../components/suggestedUtilities';
import UserInfoCard from '../components/userInfoCard';
import ZaloContactPopup from '../components/zaloContactPopup';
import { useApp } from '../context/AppContext';

function HomePage() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load products from context
    const loadProducts = async () => {
      try {
        await actions.loadHotProducts();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [actions]);

  if (isLoading) {
    return (
      <Page>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 font-medium">Đang tải...</div>
            <div className="text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát</div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen bg-gray-50 pb-20 pt2">
        {/* Header */}
        <Header />
        
        {/* Main Content - Enhanced UX */}
        <div className="px-3 py-3">
          {/* Carousel */}
          <Carousel />
          
          {/* User Info Card */}
          <UserInfoCard />
          
          {/* Promotional Alert */}
          <PromotionalAlert />
          
          {/* Promotional Banner */}
          <PromotionalBanner />
          
          {/* Product Categories */}
          <ProductCategories />
          
          {/* Recent Posts */}
          <RecentPosts />
          
          {/* Suggestions For You */}
          <SuggestionsForYou />
          
          {/* Featured Products - Enhanced */}
          <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800">Sản Phẩm Nổi Bật</h2>
              <button 
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => navigate('/category/all')}
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {state.hotProducts.slice(0, 4).map((product) => (
                <div 
                  key={product.id} 
                  className="bg-gray-50 rounded-lg p-2 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="w-full h-20 bg-gray-200 rounded-lg mb-2 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-200">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-xs group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400 text-xs">
                      {'★'.repeat(Math.floor(product.rating))}
                    </div>
                    <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.discount > 0 && (
                        <span className="text-gray-400 text-xs line-through">
                          {product.originalPrice?.toLocaleString()}₫
                        </span>
                      )}
                      <span className="text-blue-600 font-bold text-xs">
                        {product.price.toLocaleString()}₫
                      </span>
                    </div>
                    {product.discount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <button className="w-full mt-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-700 transition-colors duration-200 hover:scale-105">
                    Mua ngay
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Utilities Section */}
          <SuggestedUtilities />
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
        
        {/* Zalo Contact Popup */}
        <ZaloContactPopup />
      </div>
    </Page>
  );
}

export default HomePage;