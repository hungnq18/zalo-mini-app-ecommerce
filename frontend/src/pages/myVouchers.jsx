import { TicketPercent } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import BackButton from '../components/BackButton';
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
      try {
        // Lấy voucher IDs từ user object
        const currentUser = state.user || {};
        const userVoucherIds = Array.isArray(currentUser.vouchers) ? currentUser.vouchers : [];
        const usedVoucherIds = Array.isArray(currentUser.usedVouchers) ? currentUser.usedVouchers : [];
        
        // Lấy chi tiết voucher từ API
        const res = await ApiService.getVouchers();
        const allVouchers = res.success ? (res.data || []) : [];
        
        // Lọc voucher của user
        const userVouchers = allVouchers.filter(v => userVoucherIds.includes(v.id));
        
        // Filter usable vouchers (not expired and not used)
        const now = new Date();
        const usableVouchers = userVouchers.filter(v => {
          const isExpired = v.expiresAt && new Date(v.expiresAt) < now;
          const isUsed = usedVoucherIds.includes(v.id);
          return !isExpired && !isUsed;
        });
        
        // Filter used vouchers
        const usedVouchers = userVouchers.filter(v => usedVoucherIds.includes(v.id));
        
        setUsable(usableVouchers);
        setUsed(usedVouchers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vouchers:', error);
        setLoading(false);
      }
    })();
  }, [state.user, state.user?.vouchers, state.user?.usedVouchers]);

  return (
    <Page className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <BackButton 
            text=""
            variant="ghost"
            size="small"
            className="back-button"
          />
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
                          <div className="name">{v.title || v.code}</div>
                          <div className="meta">
                            {v.percent ? `Giảm ${v.percent}%` : v.amount ? `Giảm ${Number(v.amount).toLocaleString('vi-VN')}₫` : ''}
                            {v.minOrderAmount && ` • Đơn tối thiểu ${Number(v.minOrderAmount).toLocaleString('vi-VN')}₫`}
                            {v.expiresInDays && ` • HSD ${v.expiresInDays} ngày`}
                            {/* Hiển thị nguồn gốc voucher */}
                            {v.id.startsWith('wheel-voucher-') && (
                              <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '500' }}>
                                {' '}• 🎡 Từ vòng quay
                              </span>
                            )}
                          </div>
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
                          <div className="name">{v.title || v.code}</div>
                          <div className="meta">
                            {v.percent ? `Giảm ${v.percent}%` : v.amount ? `Giảm ${Number(v.amount).toLocaleString('vi-VN')}₫` : ''}
                            {v.minOrderAmount && ` • Đơn tối thiểu ${Number(v.minOrderAmount).toLocaleString('vi-VN')}₫`}
                            {/* Hiển thị nguồn gốc voucher */}
                            {v.id.startsWith('wheel-voucher-') && (
                              <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '500' }}>
                                {' '}• 🎡 Từ vòng quay
                              </span>
                            )}
                          </div>
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


