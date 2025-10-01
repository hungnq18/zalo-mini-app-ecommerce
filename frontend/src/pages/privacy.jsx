import { ChevronLeft, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import '../css/profilePage.scss';

const PrivacyPage = () => {
  const navigate = useNavigate();
  const [shareData, setShareData] = useState(false);
  const [personalization, setPersonalization] = useState(true);

  return (
    <Page className="profile-page">
      <div className="profile-container">
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ChevronLeft size={20} color="#111827" />
          </button>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} /> Quyền riêng tư
          </h1>
        </div>

        <div className="profile-content">
          <div className="settings-list">
            <div className="settings-item">
              <span className="settings-text">Chia sẻ dữ liệu sử dụng</span>
              <button
                className={`switch ${shareData ? 'on' : 'off'}`}
                role="switch"
                aria-checked={shareData}
                onClick={() => setShareData(v => !v)}
              >
                <span className="thumb" />
              </button>
            </div>
            <div className="settings-item">
              <span className="settings-text">Cho phép cá nhân hóa</span>
              <button
                className={`switch ${personalization ? 'on' : 'off'}`}
                role="switch"
                aria-checked={personalization}
                onClick={() => setPersonalization(v => !v)}
              >
                <span className="thumb" />
              </button>
            </div>
            <div className="settings-item">
              <span className="settings-text">Chính sách & Điều khoản</span>
              <button className="view-button" onClick={() => alert('Mở chính sách & điều khoản')}>
                Xem
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default PrivacyPage;


