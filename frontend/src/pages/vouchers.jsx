import { ArrowLeft, TicketPercent } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import { useApp } from '../context/AppContext';
import ApiService from '../services/apiService';

const VouchersPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Public vouchers for all users (available to claim)
      const res = await ApiService.getVouchers();
      const all = res.success ? (res.data || []) : [];
      setVouchers(all.filter(v => Number(v.quantity || 0) > 0));
      setLoading(false);
    })();
  }, []);

  return (
    <Page className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <h1>Ưu đãi của bạn</h1>
        </div>

        <div className="checkout-content">
          {loading ? (
            <div>Đang tải...</div>
          ) : vouchers.length === 0 ? (
            <div className="address-warning">Hiện chưa có voucher khả dụng.</div>
          ) : (
            <div className="product-list">
              {vouchers.map((v) => {
                const claimed = Array.isArray(state.user?.vouchers) && state.user.vouchers.includes(v.id);
                const used = Array.isArray(state.user?.usedVouchers) && state.user.usedVouchers.includes(v.id);
                return (
                <div key={v.id} className="product-row" style={{ gridTemplateColumns: 'auto 1fr auto', gap: '8px', opacity: claimed || used ? 0.7 : 1 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:36, height:36, background:'#eef2ff', borderRadius:8 }}>
                    <TicketPercent size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <div className="name">{v.code || v.title}</div>
                    <div className="meta">
                      {v.percent ? `Giảm ${v.percent}%` : v.amount ? `Giảm ${Number(v.amount).toLocaleString('vi-VN')}₫` : ''} • Còn {Number(v.quantity || 0)} lượt
                    </div>
                  </div>
                  {used ? (
                    <button className="btn-primary" disabled>Đã dùng</button>
                  ) : claimed ? (
                    <button className="btn-primary" disabled>Đã nhận</button>
                  ) : (
                    <button className="btn-primary" onClick={async ()=>{
                      const current = Array.isArray(state.user?.vouchers) ? state.user.vouchers : [];
                      if (!current.includes(v.id)) {
                        await actions.updateUser({ vouchers: [...current, v.id] });
                      }
                    }}>Nhận</button>
                  )}
                </div>
              );})}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default VouchersPage;


