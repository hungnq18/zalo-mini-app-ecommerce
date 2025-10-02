import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from "zmp-ui";
import BottomNavigation from '../components/bottomNavigation';
import Carousel from '../components/carousel';
import Header from '../components/header';
import HomeProductCard from '../components/HomeProductCard';
import SuggestionsForYou from '../components/homeProductSuggestions';
import PromotionalBanner from '../components/homePromotionalBanner';
import ProductCategories from '../components/productCategories';
import PromotionalAlert from '../components/promotionalAlert';
import RecentPosts from '../components/recentPosts';
import SuggestedUtilities from '../components/suggestedUtilities';
import UserInfoCard from '../components/userInfoCard';
import ZaloContactPopup from '../components/zaloContactPopup';
import { useApp } from '../context/AppContext';
import '../css/homePage.scss';

const HomePage = memo(() => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // Memoize hot products to prevent unnecessary re-renders
  const hotProducts = useMemo(() => {
    return state.hotProducts || [];
  }, [state.hotProducts]);

  // Memoize navigation handlers
  const handleViewAllClick = useCallback(() => {
    navigate('/category/all');
  }, [navigate]);

  useEffect(() => {
    // Load products from context only if not already loaded
    const loadProducts = async () => {
      if (!state.hotProducts || state.hotProducts.length === 0) {
        try {
          await actions.loadHotProducts();
        } catch (error) {
          console.error('Error loading products:', error);
        }
      }
      setIsLoading(false);
    };

    loadProducts();
  }, []); // Remove dependencies to prevent infinite loop

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
          <div className="home-page">
            <div className="featured-products-section">
              <div className="section-header">
                <h2>Sản Phẩm Nổi Bật</h2>
                <button 
                  className="view-all-button"
                  onClick={handleViewAllClick}
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="products-grid">
                {hotProducts.slice(0, 4).map((product) => (
                  <HomeProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
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
});

HomePage.displayName = 'HomePage';

export default HomePage;