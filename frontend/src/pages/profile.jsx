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

  // Calculate member level based on points
  const calculateMemberLevel = (points) => {
    if (points >= 5000) return { level: 'Kim Cương', color: '#ff6b6b', icon: '💎', nextLevel: null, progress: 100 };
    if (points >= 3000) return { level: 'Vàng', color: '#ffd700', icon: '🥇', nextLevel: 'Kim Cương', progress: ((points - 3000) / 2000) * 100 };
    if (points >= 1000) return { level: 'Bạc', color: '#4ecdc4', icon: '🥈', nextLevel: 'Vàng', progress: ((points - 1000) / 2000) * 100 };
    if (points >= 0) return { level: 'Đồng', color: '#ff9f43', icon: '🥉', nextLevel: 'Bạc', progress: (points / 1000) * 100 };
    return { level: 'Thành viên', color: '#6b7280', icon: '👤', nextLevel: 'Đồng', progress: 0 };
  };

  // Calculate points needed for next level
  const getNextLevelPoints = (currentPoints) => {
    if (currentPoints >= 5000) return null; // Max level
    if (currentPoints >= 3000) return 5000 - currentPoints; // Diamond
    if (currentPoints >= 1000) return 3000 - currentPoints; // Gold
    if (currentPoints >= 0) return 1000 - currentPoints; // Silver
    return 0; // Bronze
  };

  useEffect(() => {
    actions.loadUserInfo?.();
    // Only load utilities if not already loaded
    if (!state.utilities || state.utilities.length === 0) {
      actions.loadUtilities?.();
    }
    actions.loadPromotions?.();
    // run once on mount to avoid update depth loops
    (async () => {
      try {
        // Lấy voucher IDs từ user object
        const currentUser = state.user || {};
        const userVoucherIds = Array.isArray(currentUser.vouchers) ? currentUser.vouchers : [];
        
        // Lấy chi tiết voucher từ API
        const res = await ApiService.getVouchers();
        const allVouchers = res.success ? (res.data || []) : [];
        
        // Lọc voucher của user
        const userVouchers = allVouchers.filter(v => userVoucherIds.includes(v.id));
        
        setClaimedVouchers(userVouchers);
      } catch (error) {
        console.error('Error loading vouchers:', error);
        setClaimedVouchers([]);
      }
    })();
  }, [state.user, state.user?.vouchers]); // Remove state.utilities from dependencies

  const user = state.user || { name: 'Người dùng', level: 'Member', points: 0 };
  const utilities = state.utilities || [];
  const vouchers = (state.promotions || []).slice(0, 4);
  
  // Calculate member info
  const userPoints = Number(user.points || 0);
  const memberInfo = calculateMemberLevel(userPoints);
  const nextLevelPoints = getNextLevelPoints(userPoints);
  return (
    <Page className="profile-page">
      <div className="profile-header">
        <h1>Cá nhân</h1>
      </div>
      
      <div className="profile-container">
        <div className="profile-content">
          <div className="membership-banner">
            <div className="banner-left">
              <div className="avatar-circle" style={{ backgroundColor: memberInfo.color }}>
                {memberInfo.icon}
              </div>
              <div className="member-info">
                <div className="member-name">{user.name || 'Người dùng'}</div>
                <div className="member-rank" style={{ color: memberInfo.color }}>
                  Hạng: {memberInfo.level}
                </div>
              </div>
            </div>
            <div className="banner-right">
              <div className="points">
                <div className="points-label">Điểm</div>
                <div className="points-value">{userPoints.toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>

          {/* Member Progress */}
          {nextLevelPoints !== null && (
            <div className="member-progress-section">
              <div className="progress-header">
                <h3>Tiến độ thành viên</h3>
                <span className="next-level-info">
                  Còn {nextLevelPoints.toLocaleString('vi-VN')} điểm để lên hạng {memberInfo.nextLevel}
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min(memberInfo.progress, 100)}%`,
                      backgroundColor: memberInfo.color 
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {Math.round(memberInfo.progress)}% hoàn thành
                </div>
              </div>
            </div>
          )}
          
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

          {/* Points System Info */}
          <div className="section">
            <div className="section-title">Quy chế tích điểm</div>
            <div className="points-system-info">
              <div className="points-rule">
                <div className="rule-icon">🛒</div>
                <div className="rule-content">
                  <div className="rule-title">Mua hàng</div>
                  <div className="rule-desc">1 điểm / 1.000đ</div>
                </div>
              </div>
              <div className="points-rule">
                <div className="rule-icon">🎁</div>
                <div className="rule-content">
                  <div className="rule-title">Vòng quay may mắn</div>
                  <div className="rule-desc">10-50 điểm / lần quay</div>
                </div>
              </div>
              <div className="points-rule">
                <div className="rule-icon">⭐</div>
                <div className="rule-content">
                  <div className="rule-title">Đánh giá sản phẩm</div>
                  <div className="rule-desc">5 điểm / đánh giá</div>
                </div>
              </div>
              <div className="points-rule">
                <div className="rule-icon">👥</div>
                <div className="rule-content">
                  <div className="rule-title">Giới thiệu bạn bè</div>
                  <div className="rule-desc">100 điểm / người</div>
                </div>
              </div>
            </div>
          </div>

          {/* Member Benefits */}
          <div className="section">
            <div className="section-title">Quyền lợi hạng {memberInfo.level}</div>
            <div className="member-benefits">
              {memberInfo.level === 'Kim Cương' && (
                <>
                  <div className="benefit-item">✓ Giảm giá 20%</div>
                  <div className="benefit-item">✓ Miễn phí ship không giới hạn</div>
                  <div className="benefit-item">✓ Voucher độc quyền</div>
                  <div className="benefit-item">✓ Hỗ trợ 24/7</div>
                  <div className="benefit-item">✓ Quà tặng đặc biệt</div>
                </>
              )}
              {memberInfo.level === 'Vàng' && (
                <>
                  <div className="benefit-item">✓ Giảm giá 15%</div>
                  <div className="benefit-item">✓ Miễn phí ship từ 200k</div>
                  <div className="benefit-item">✓ Ưu tiên mua hàng</div>
                  <div className="benefit-item">✓ Hỗ trợ VIP</div>
                </>
              )}
              {memberInfo.level === 'Bạc' && (
                <>
                  <div className="benefit-item">✓ Giảm giá 10%</div>
                  <div className="benefit-item">✓ Miễn phí ship từ 300k</div>
                  <div className="benefit-item">✓ Voucher sinh nhật</div>
                </>
              )}
              {memberInfo.level === 'Đồng' && (
                <>
                  <div className="benefit-item">✓ Giảm giá 5%</div>
                  <div className="benefit-item">✓ Miễn phí ship từ 500k</div>
                </>
              )}
              {memberInfo.level === 'Thành viên' && (
                <>
                  <div className="benefit-item">✓ Tích điểm khi mua hàng</div>
                  <div className="benefit-item">✓ Tham gia các chương trình khuyến mãi</div>
                </>
              )}
            </div>
          </div>

          {/* Utilities */}
          {utilities.length > 0 && (
            <div className="section">
              <div className="section-title">Tiện ích</div>
              <div className="utilities-grid">
                {utilities.map((u) => (
                  <div 
                    key={u.id} 
                    className="utility-card" 
                    onClick={() => {
                      if (u.path) {
                        navigate(u.path);
                      }
                    }}
                  >
                    <div className={`utility-icon ${u.color || ''} ${u.iconColor || ''}`}>{u.icon}</div>
                    <div className="utility-texts">
                      <div className="utility-title">{u.title}</div>
                      <div className="utility-sub">{u.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
