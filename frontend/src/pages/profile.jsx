import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import BottomNavigation from '../components/bottomNavigation';
import { useApp } from '../context/AppContext';
import '../css/profilePage.scss';
import ApiService from '../services/apiService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [claimedVouchers, setClaimedVouchers] = useState([]);

  useEffect(() => {
    actions.loadUserInfo?.();
    actions.loadUtilities?.();
    actions.loadPromotions?.();
    // run once on mount to avoid update depth loops
    (async () => {
      // Build list of user's claimed vouchers with details
      try {
        const res = await ApiService.getVouchers();
        const all = res.success ? (res.data || []) : [];
        const ids = Array.isArray(state.user?.vouchers) ? state.user.vouchers : [];
        const list = all.filter(v => ids.includes(v.id));
        setClaimedVouchers(list);
      } catch (e) {}
    })();
  }, [state.user]);

  const user = state.user || { name: 'Người dùng', level: 'Member', points: 0 };
  const utilities = state.utilities || [];
  const vouchers = (state.promotions || []).slice(0, 4);
  return (
    <Page className="profile-page">
      <div className="profile-header">
        <h1>Cá nhân</h1>
      </div>
      
      <div className="profile-container">
        <div className="profile-content">
          <div className="membership-banner">
            <div className="banner-left">
              <div className="avatar-circle">{user.name?.[0] || 'U'}</div>
              <div className="member-info">
                <div className="member-name">{user.name || 'Người dùng'}</div>
                <div className="member-rank">Hạng: {user.level || 'Member'}</div>
              </div>
            </div>
            <div className="banner-right">
              <div className="points">
                <div className="points-label">Điểm</div>
                <div className="points-value">{Number(user.points || 0).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>
          
          <div className="quick-row">
            <button className="quick-card" onClick={() => navigate('/orders')}>
              <span className="quick-emoji">🧾</span>
              <span className="quick-text">Đơn mua</span>
            </button>
            <button className="quick-card" onClick={() => navigate('/cart')}>
              <span className="quick-emoji">🛒</span>
              <span className="quick-text">Giỏ hàng</span>
            </button>
          </div>

          <div className="section">
            <div className="section-title">Tiện ích</div>
            <div className="utilities-grid">
              {utilities.map((u) => (
                <div key={u.id} className="utility-card">
                  <div className={`utility-icon ${u.iconColor || ''}`}>{u.icon}</div>
                  <div className="utility-texts">
                    <div className="utility-title">{u.title}</div>
                    <div className="utility-sub">{u.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">Kho voucher</div>
            <div className="vouchers-list">
              <button className="settings-item" onClick={() => navigate('/my-vouchers')}>
                <span className="settings-text">Bạn đang có {claimedVouchers.length} voucher đã nhận</span>
                <span className="settings-action">›</span>
              </button>
              <button className="settings-item" onClick={() => navigate('/vouchers')}>
                <span className="settings-text">Xem voucher công khai để nhận thêm</span>
                <span className="settings-action">›</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="section">
            <div className="section-title">Cài đặt</div>
            <div className="settings-list">
              <button className="settings-item" onClick={() => navigate('/addresses')}>
                <span className="settings-text">Địa chỉ giao hàng</span>
                <span className="settings-action">›</span>
              </button>
              <button className="settings-item" onClick={() => navigate('/notifications')}>
                <span className="settings-text">Thông báo</span>
                <span className="settings-action">›</span>
              </button>
              <button className="settings-item" onClick={() => navigate('/privacy')}>
                <span className="settings-text">Quyền riêng tư</span>
                <span className="settings-action">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </Page>
  );
};

export default ProfilePage;
