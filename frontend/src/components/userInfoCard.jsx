import { Crown, Gift, Heart, Star, Store, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import '../css/userInfoCard.scss';

const UserInfoCard = () => {
  const { state } = useApp();
  const [hoveredButton, setHoveredButton] = useState(null);

  const user = state.user || {
    name: 'Khách hàng',
    points: 0,
    level: 'Bronze'
  };

  const actionButtons = [
    { 
      icon: TrendingUp, 
      label: 'Kho Sỉ Hội Viên', 
      color: 'bg-blue-100', 
      iconColor: 'text-blue-600',
      description: 'Mua sỉ giá tốt'
    },
    { 
      icon: Store, 
      label: 'Đăng Ký Đại Lý', 
      color: 'bg-green-100', 
      iconColor: 'text-green-600',
      description: 'Trở thành đại lý'
    },
    { 
      icon: Gift, 
      label: 'Vòng Quay May Mắn', 
      color: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      description: 'Quay thưởng ngay'
    },
    { 
      icon: Heart, 
      label: 'Hội Viên Thân Thiết', 
      color: 'bg-pink-100', 
      iconColor: 'text-pink-600',
      description: 'Ưu đãi đặc biệt'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm mb-3">
      {/* User Greeting - Enhanced */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center relative">
            <span className="text-yellow-800 font-bold text-xs">HI</span>
            <div className="absolute -top-1 -right-1">
              <Crown className="h-3 w-3 text-yellow-600" />
            </div>
          </div>
          <div>
            <div className="text-gray-800 font-medium text-sm">Xin chào, {user.name}</div>
            <div className="text-xs text-gray-500">Chào mừng đến với UnionMart</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-gray-600 text-xs font-medium">Điểm thưởng: {Number(user.points || 0).toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="text-gray-500 text-xs">{user.level} Member</div>
        </div>
      </div>

      {/* Action Buttons Grid - Enhanced */}
      <div className="grid grid-cols-2 gap-2">
        {actionButtons.map((button, index) => {
          const IconComponent = button.icon;
          return (
            <button 
              key={index}
              className={`bg-white border border-gray-200 rounded-lg p-2 text-left hover:bg-gray-50 transition-all duration-200 group ${
                hoveredButton === index ? 'shadow-md border-blue-300' : ''
              }`}
              onMouseEnter={() => setHoveredButton(index)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className={`${button.color} rounded-lg p-1.5 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className={`h-4 w-4 ${button.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                    {button.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {button.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {(state.orders || []).length}
            </div>
            <div>Đơn hàng</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {((state.orders || []).reduce((total, order) => {
                const savings = (order.items || []).reduce((orderSavings, item) => {
                  const originalPrice = item.product?.originalPrice || 0;
                  const currentPrice = item.product?.price || 0;
                  const quantity = item.quantity || 1;
                  return orderSavings + ((originalPrice - currentPrice) * quantity);
                }, 0);
                return total + savings;
              }, 0)).toLocaleString()}đ
            </div>
            <div>Đã tiết kiệm</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">
              {(state.user?.reviews || []).length}
            </div>
            <div>Đánh giá</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;