import { Home, Search, ShoppingCart, User } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../css/bottomNavigation.scss';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredTab, setHoveredTab] = useState(null);
  const { state } = useApp();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/', badge: null },
    { icon: Search, label: 'Tìm kiếm', path: '/search', badge: null },
    { icon: ShoppingCart, label: 'Giỏ hàng', path: '/cart', badge: (state.cart?.items ? state.cart.items.length : 0) },
    { icon: User, label: 'Cá nhân', path: '/profile', badge: null }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getActiveTab = () => {
    const path = location.pathname;
    
    // Check for exact matches first
    if (path === '/') return 0;
    if (path === '/search') return 1;
    if (path === '/cart') return 2;
    if (path === '/profile') return 3;
    
    // Check for sub-paths
    if (path.startsWith('/orders')) return 3; // Orders belongs to profile section
    if (path.startsWith('/addresses')) return 3; // Addresses belongs to profile section
    if (path.startsWith('/vouchers')) return 3; // Vouchers belongs to profile section
    if (path.startsWith('/notifications')) return 3; // Notifications belongs to profile section
    if (path.startsWith('/vip-member')) return 3; // VIP member belongs to profile section
    if (path.startsWith('/privacy')) return 3; // Privacy belongs to profile section
    if (path.startsWith('/lucky-wheel')) return 3; // Lucky wheel belongs to profile section
    
    // Default fallback
    return 0;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex justify-around items-center">
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = getActiveTab() === index;
          const isHovered = hoveredTab === index;
          
          return (
            <button
              key={index}
              className={`flex flex-col items-center space-y-0.5 py-1 px-2 rounded transition-all duration-200 relative ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              } ${isHovered ? 'scale-105' : ''}`}
              onClick={() => handleNavigation(item.path)}
              onMouseEnter={() => setHoveredTab(index)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div className="relative">
                <IconComponent 
                  className={`h-4 w-4 transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  } ${isHovered ? 'scale-110' : ''}`} 
                />
                {item.badge !== null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              } ${isHovered ? 'scale-105' : ''}`}>
                {item.label}
              </span>
              
            </button>
          );
        })}
      </div>
      
    </div>
  );
};

export default BottomNavigation;