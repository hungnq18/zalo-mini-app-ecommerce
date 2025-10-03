import { ChevronRight, Megaphone } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../css/promotionalAlert.scss';

const PromotionalAlert = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const handleClick = () => {
    navigate('/vouchers');
  };
  
  // Get promotional offers count from database
  const offersCount = state.promotions?.length || 0;
  const hasOffers = offersCount > 0;

  return (
    <button className="promotional-alert" onClick={handleClick}>
      <div className="promotional-alert-icon">
        <Megaphone className="h-4 w-4" />
      </div>
      <div className="promotional-alert-content">
        <div className="promotional-alert-text">
          <div className="font-semibold">
            Bạn đang có {offersCount} ưu đãi
          </div>
          <div className="text-sm opacity-90">
            {hasOffers 
              ? "Mua hàng để tận hưởng ưu đãi ngay bạn nhé!" 
              : "Chưa có ưu đãi nào"}
          </div>
        </div>
        <div className="promotional-alert-arrow">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
};

export default PromotionalAlert;