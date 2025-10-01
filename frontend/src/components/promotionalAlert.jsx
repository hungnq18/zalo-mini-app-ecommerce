import { ChevronRight, Megaphone, Smartphone } from 'lucide-react';
import React from 'react';
import { useApp } from '../context/AppContext';
import '../css/promotionalAlert.scss';

const PromotionalAlert = () => {
  const { state } = useApp();
  const handleClick = () => {
    window.location.href = '/vouchers';
  };
  
  // Get promotional offers count from database
  const offersCount = state.promotions?.length || 0;
  const hasOffers = offersCount > 0;

  return (
    <button className="bg-blue-600 rounded-xl p-3 mb-3 flex items-center justify-between w-full" onClick={handleClick}>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Megaphone className="h-4 w-4 text-red-500" />
          <Smartphone className="h-4 w-4 text-white" />
        </div>
        <div className="text-white">
          <div className="font-semibold text-xs">
            Bạn đang có {offersCount} ưu đãi
          </div>
          <div className="text-xs text-blue-200">
            {hasOffers 
              ? "Mua hàng để tận hưởng ưu đãi ngay bạn nhé!" 
              : "Chưa có ưu đãi nào"}
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-white" />
    </button>
  );
};

export default PromotionalAlert;