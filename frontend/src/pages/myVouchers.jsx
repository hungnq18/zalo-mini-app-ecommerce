import { ArrowLeft, TicketPercent } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import { useApp } from '../context/AppContext';
import '../css/checkoutPage.scss';
import ApiService from '../services/apiService';

const MyVouchersPage = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [usable, setUsable] = useState([]);
  const [used, setUsed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await ApiService.getVouchers();
      const all = res.success ? (res.data || []) : [];
      const claimedIds = Array.isArray(state.user?.vouchers) ? state.user.vouchers : [];
      const usedIds = Array.isArray(state.user?.usedVouchers) ? state.user.usedVouchers : [];
      setUsable(all.filter(v => claimedIds.includes(v.id)));
      setUsed(all.filter(v => usedIds.includes(v.id)));
      setLoading(false);
    })();
  }, [state.user]);

  return (
    <Page className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <h1>Kho voucher của bạn</h1>
        </div>

        <div className="checkout-content">
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <>
              <div className="section">
                <div className="section-title">Có thể dùng</div>
                {usable.length === 0 ? (
                  <div className="address-warning">Chưa có voucher nào đã nhận.</div>
                ) : (
                  <div className="product-list">
                    {usable.map((v) => (
                      <div key={v.id} className="product-row" style={{ gridTemplateColumns: 'auto 1fr auto', gap: '8px' }}>
                        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:36, height:36, background:'#ecfdf5', borderRadius:8 }}>
                          <TicketPercent size={18} color="#059669" />
                        </div>
                        <div>
                          <div className="name">{v.code || v.title}</div>
                          <div className="meta">{v.percent ? `Giảm ${v.percent}%` : v.amount ? `Giảm ${Number(v.amount).toLocaleString('vi-VN')}₫` : ''} • Còn {Number(v.quantity || 0)} lượt</div>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/checkout', { state: { voucherId: v.id } })}>Dùng ngay</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">Đã dùng</div>
                {used.length === 0 ? (
                  <div className="address-warning">Chưa có voucher nào đã dùng.</div>
                ) : (
                  <div className="product-list">
                    {used.map((v) => (
                      <div key={v.id} className="product-row" style={{ gridTemplateColumns: 'auto 1fr auto', gap: '8px', opacity: 0.6 }}>
                        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:36, height:36, background:'#f3f4f6', borderRadius:8 }}>
                          <TicketPercent size={18} color="#6b7280" />
                        </div>
                        <div>
                          <div className="name">{v.code || v.title}</div>
                          <div className="meta">{v.percent ? `Giảm ${v.percent}%` : v.amount ? `Giảm ${Number(v.amount).toLocaleString('vi-VN')}₫` : ''}</div>
                        </div>
                        <button className="btn-primary" disabled>Đã dùng</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  );
};

export default MyVouchersPage;


