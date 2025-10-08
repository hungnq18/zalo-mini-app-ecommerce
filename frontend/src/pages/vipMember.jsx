import { Crown, Gift, Star, Users } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import BackButton from '../components/BackButton';
import '../css/vipMemberPage.scss';

const VipMemberPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Page className="vip-member-page">
      <div className="vip-member-container">
        {/* Header */}
        <div className="vip-member-header">
          <BackButton 
            text=""
            variant="ghost"
            size="small"
            className="back-button"
          />
          <h1>Hội Viên Thân Thiết</h1>
        </div>

        {/* Hero Section */}
        <div className="vip-hero">
          <div className="vip-badge">
            <Crown size={32} />
          </div>
          <h2>Chào mừng đến với Hội Viên Thân Thiết</h2>
          <p>Trải nghiệm những ưu đãi đặc biệt dành riêng cho bạn</p>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-section">
          <h3>Quyền lợi thành viên</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <Gift size={24} />
              </div>
              <div className="benefit-content">
                <h4>Voucher độc quyền</h4>
                <p>Nhận voucher giảm giá đặc biệt chỉ dành cho thành viên VIP</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <Star size={24} />
              </div>
              <div className="benefit-content">
                <h4>Ưu tiên mua hàng</h4>
                <p>Được ưu tiên mua sản phẩm hot và sản phẩm mới nhất</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <Users size={24} />
              </div>
              <div className="benefit-content">
                <h4>Hỗ trợ 24/7</h4>
                <p>Được hỗ trợ khách hàng ưu tiên mọi lúc mọi nơi</p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <Crown size={24} />
              </div>
              <div className="benefit-content">
                <h4>Miễn phí vận chuyển</h4>
                <p>Miễn phí ship cho mọi đơn hàng không giới hạn số tiền</p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Levels */}
        <div className="membership-levels">
          <h3>Cấp độ thành viên</h3>
          <div className="levels-grid">
            <div className="level-card bronze">
              <div className="level-icon">🥉</div>
              <h4>Đồng</h4>
              <p>Từ 0 điểm</p>
              <ul>
                <li>Giảm giá 5%</li>
                <li>Miễn phí ship từ 500k</li>
              </ul>
            </div>

            <div className="level-card silver">
              <div className="level-icon">🥈</div>
              <h4>Bạc</h4>
              <p>Từ 1000 điểm</p>
              <ul>
                <li>Giảm giá 10%</li>
                <li>Miễn phí ship từ 300k</li>
                <li>Voucher sinh nhật</li>
              </ul>
            </div>

            <div className="level-card gold">
              <div className="level-icon">🥇</div>
              <h4>Vàng</h4>
              <p>Từ 3000 điểm</p>
              <ul>
                <li>Giảm giá 15%</li>
                <li>Miễn phí ship từ 200k</li>
                <li>Ưu tiên mua hàng</li>
                <li>Hỗ trợ VIP</li>
              </ul>
            </div>

            <div className="level-card diamond">
              <div className="level-icon">💎</div>
              <h4>Kim Cương</h4>
              <p>Từ 5000 điểm</p>
              <ul>
                <li>Giảm giá 20%</li>
                <li>Miễn phí ship không giới hạn</li>
                <li>Voucher độc quyền</li>
                <li>Hỗ trợ 24/7</li>
                <li>Quà tặng đặc biệt</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h3>Bắt đầu hành trình VIP ngay hôm nay!</h3>
          <p>Mua sắm nhiều hơn để tích điểm và nâng cấp hạng thành viên</p>
          <button className="cta-button" onClick={() => navigate('/')}>
            Mua sắm ngay
          </button>
        </div>
      </div>
    </Page>
  );
};

export default VipMemberPage;
