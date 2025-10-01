import { CheckCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../css/homePromotionalBanner.scss';
const HomePromotionalBanner = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const handleClick = () => {
    navigate('/#');
  };
  // Get promotional data from database
  const promotionalData = state.promotions?.find(p => p.type === 'banner') || {
    title: "Nhận lượt chơi vòng quay may mắn khi QUAN TÂM",
    accountName: "UnionMart",
    accountBadge: "Official Account"
  };

  return (
    <div className="home-promotional-banner">
      <div className="home-promotional-banner-content">
        <div className="home-promotional-banner-text">
          <h3>{promotionalData.title}</h3>
        </div>
        
        <div className="home-promotional-banner-account">
          <div className="account-info">
            <div className="account-logo">
              <div className="logo-circle">
                <span className="logo-text">U</span>
                <CheckCircle className="verified-icon" />
              </div>
            </div>
            <div className="account-details">
              <div className="account-name">{promotionalData.accountName}</div>
              <div className="account-badge">{promotionalData.accountBadge}</div>
            </div>
          </div>
          
          <button className="follow-button" onClick={handleClick}>
            Quan tâm
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePromotionalBanner;
