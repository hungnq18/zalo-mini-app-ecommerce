import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/header.scss';
import logo from '../static/logo.png';

const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <header className="bg-blue-600 text-white relative">

      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 pt-5">
            <div className="logo-container">
              <img src={logo} alt="UnionMart" />
            </div>
            <div className="text-white pt-2">
              <div className="font-bold text-xs">Union Mall</div>
              <div className="text-xs text-blue-200">Siêu thị trực tuyến</div>
            </div>
          </div>

          {/* Menu Button removed per request */}
        </div>

        {/* Search Bar */}
        <div className="mt-3">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
              placeholder="Tìm kiếm sản phẩm..."
              onClick={handleSearchClick}
              readOnly
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;