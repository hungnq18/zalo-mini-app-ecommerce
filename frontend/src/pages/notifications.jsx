import { Bell } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import PageHeader from '../components/PageHeader';
import '../css/profilePage.scss';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [promo, setPromo] = useState(true);
  const [orderNoti, setOrderNoti] = useState(true);
  const [systemNoti, setSystemNoti] = useState(false);
  return (
    <Page className="profile-page">
      <PageHeader 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} /> Thông báo
          </div>
        }
        onBackClick={() => navigate(-1)}
        variant="notifications"
      />

      <div className="profile-container">
        <div className="profile-content">
          <div className="settings-list">
            <div className="settings-item">
              <span className="settings-text">Nhận thông báo khuyến mãi</span>
              <button
                className={`switch ${promo ? 'on' : 'off'}`}
                role="switch"
                aria-checked={promo}
                onClick={() => setPromo(v => !v)}
              >
                <span className="thumb" />
              </button>
            </div>
            <div className="settings-item">
              <span className="settings-text">Thông báo đơn hàng</span>
              <button
                className={`switch ${orderNoti ? 'on' : 'off'}`}
                role="switch"
                aria-checked={orderNoti}
                onClick={() => setOrderNoti(v => !v)}
              >
                <span className="thumb" />
              </button>
            </div>
            <div className="settings-item">
              <span className="settings-text">Thông báo hệ thống</span>
              <button
                className={`switch ${systemNoti ? 'on' : 'off'}`}
                role="switch"
                aria-checked={systemNoti}
                onClick={() => setSystemNoti(v => !v)}
              >
                <span className="thumb" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default NotificationsPage;


