import { Bell, Home, Search, ShoppingCart, User } from 'lucide-react';
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
    { icon: Bell, label: 'Thông báo', path: '/notifications', badge: null },
    { icon: ShoppingCart, label: 'Giỏ hàng', path: '/cart', badge: (state.cart?.items ? state.cart.items.length : 0) },
    { icon: User, label: 'Cá nhân', path: '/profile', badge: null }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getActiveTab = () => {
    switch (location.pathname) {
      case '/':
        return 0;
      case '/search':
        return 1;
      case '/notifications':
        return 2;
      case '/cart':
        return 3;
      case '/profile':
        return 4;
      default:
        return 0;
    }
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
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
    </div>
  );
};

export default BottomNavigation;