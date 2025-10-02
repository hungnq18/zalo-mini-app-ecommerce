import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Page } from 'zmp-ui';
import { useApp } from '../context/AppContext';
import '../css/checkoutPage.scss';
import ApiService from '../services/apiService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useApp();
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: ''
  });
  const [useDefault, setUseDefault] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressPopupOpen, setAddressPopupOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    // Prefill from user if available
    const incoming = location.state?.address;
    if (incoming) {
      setAddress({ ...address, ...incoming });
    }
    const incomingVoucherId = location.state?.voucherId;
    if (incomingVoucherId) {
      // Only allow if user has claimed this voucher (exists in user.vouchers)
      const userVoucherIds = Array.isArray(state.user?.vouchers) ? state.user.vouchers : [];
      if (userVoucherIds.includes(incomingVoucherId)) {
        setVoucherId(incomingVoucherId);
        (async () => {
          const res = await ApiService.getVoucherById(incomingVoucherId);
          if (res.success && res.data && Number(res.data.quantity || 0) > 0) setVoucherMeta(res.data);
        })();
      }
    }
    const user = state.user || {};
    const addr = user.addressObject || {};
    setAddress(prev => ({
      name: user.name || prev.name,
      phone: user.phone || prev.phone,
      street: addr.street || prev.street,
      ward: addr.ward || prev.ward,
      district: addr.district || prev.district,
      city: addr.city || prev.city
    }));
    if (user.defaultAddressId) setSelectedAddressId(user.defaultAddressId);
  }, [state.user, location.state]);

  // Sử dụng sản phẩm đã chọn từ cart page, fallback về toàn bộ cart nếu không có
  const items = location.state?.selectedItems || state.cart?.items || [];
  const subtotal = useMemo(() => items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0), [items]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherId, setVoucherId] = useState('');
  const [voucherMeta, setVoucherMeta] = useState(null);
  const [voucherList, setVoucherList] = useState([]);
  const [pointsUse, setPointsUse] = useState(0);

  const voucherDiscount = useMemo(() => {
    const v = voucherMeta;
    if (!v) return 0;
    // each user can use a voucher only once
    const used = Array.isArray(state.user?.usedVouchers) ? state.user.usedVouchers : [];
    if (used.includes(v.id)) return 0;
    if (v.percent) return Math.floor(subtotal * (Number(v.percent) / 100));
    if (v.amount) return Number(v.amount);
    if (v.discount) return Number(v.discount);
    return 0;
  }, [voucherMeta, subtotal]);

  const maxPoints = Number(state.user?.points || 0);
  const pointsApplied = Math.min(Math.max(Number(pointsUse || 0), 0), Math.min(maxPoints, Math.max(subtotal - voucherDiscount, 0)));
  // Base shipping fee (could be dynamic later)
  const shippingBase = subtotal > 0 ? 30000 : 0;
  const shippingVoucherApplied = !!(voucherMeta && ((voucherMeta.freeShipping === true) || ((voucherMeta.code || '').toUpperCase() === 'FREESHIP')));
  const shippingDiscount = shippingVoucherApplied ? shippingBase : 0;
  const shipping = Math.max(shippingBase - shippingDiscount, 0);
  const discount = voucherDiscount + pointsApplied;
  const total = Math.max(subtotal + shipping - discount, 0);

  const isAddressValid = (
    // valid if user đã có địa chỉ mặc định
    !!(state.user?.defaultAddressId || state.user?.address || state.user?.addressObject) ||
    // hoặc form đã nhập đủ các trường tối thiểu
    ((address.name || '').trim() !== '' &&
     (address.phone || '').trim() !== '' &&
     (address.street || '').trim() !== '' &&
     (address.city || '').trim() !== '')
  );

  useEffect(() => {
    (async () => {
      const res = await ApiService.getVouchers();
      if (res.success) {
        const available = (res.data || []).filter(v => Number(v.quantity || 0) > 0);
        setVoucherList(available);
      }
    })();
  }, []);

  const placeOrder = async () => {
    if (items.length === 0) return;
    if (!isAddressValid) {
      setAddressPopupOpen(true);
      return;
    }
    const shippingAddress = `${address.name || ''}${address.phone ? ' - ' + address.phone : ''}${address.street ? ' - ' + address.street : ''}${address.ward ? ', ' + address.ward : ''}${address.district ? ', ' + address.district : ''}${address.city ? ', ' + address.city : ''}`.trim() || 'Địa chỉ chưa được cung cấp';
    const orderData = {
      items: items.map(it => ({ productId: it.productId, quantity: it.quantity, price: it.price, product: it.product })),
      total,
      status: 'pending',
      shippingAddress,
      voucher: voucherMeta ? { id: voucherMeta.id, code: voucherMeta.code, discount: voucherDiscount, percent: voucherMeta.percent, amount: voucherMeta.amount } : null,
      pointsUsed: pointsApplied,
      paymentMethod,
      shippingFee: shipping,
      freeShipping: shippingVoucherApplied,
    };
    const orderResult = await actions.createOrder(orderData);
    
    // Chỉ xử lý sau khi đặt hàng thành công
    if (orderResult?.success !== false) {
      // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
      if (location.state?.selectedItems) {
        // Nếu có sản phẩm được chọn cụ thể, chỉ xóa những sản phẩm đó
        for (const item of items) {
          await actions.removeFromCart(item.productId);
        }
      } else {
        // Nếu thanh toán toàn bộ giỏ hàng, xóa tất cả
        await actions.clearCart?.();
      }
      
      // Xử lý voucher sau khi thanh toán thành công
      if (voucherMeta) {
        // decrement voucher quantity if exists
        const remaining = Math.max(Number(voucherMeta.quantity || 0) - 1, 0);
        await ApiService.updateVoucher(voucherMeta.id, { ...voucherMeta, quantity: remaining });
        // mark as used for this user and remove from claimed list
        const used = Array.isArray(state.user?.usedVouchers) ? state.user.usedVouchers : [];
        const claimed = Array.isArray(state.user?.vouchers) ? state.user.vouchers : [];
        const newClaimed = claimed.filter(id => id !== voucherMeta.id);
        await actions.updateUser({ usedVouchers: [...used, voucherMeta.id], vouchers: newClaimed });
      }
      
      // Trừ điểm sau khi thanh toán thành công
      if (pointsApplied > 0) {
        const remaining = Math.max(maxPoints - pointsApplied, 0);
        await actions.updateUser({ points: remaining });
      }
      
      // Chuyển hướng đến trang đơn hàng
      navigate('/orders');
    } else {
      // Hiển thị lỗi nếu đặt hàng thất bại
      alert('Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Page className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <h1>Thanh toán</h1>
        </div>

        <div className="checkout-content">
          {items.length === 0 ? (
            <div className="checkout-empty">Giỏ hàng trống. Vui lòng quay lại giỏ hàng.</div>
          ) : (
            <>
              <div className="section">
                <div className="section-title">Sản phẩm</div>
                <div className="product-list">
                  {items.map((it, idx) => (
                    <div key={idx} className="product-row">
                      <img src={it.product?.image} alt={it.product?.name} />
                      <div className="info">
                        <div className="name">{it.product?.name || `Sản phẩm #${it.productId}`}</div>
                        <div className="meta">{Number(it.price || 0).toLocaleString('vi-VN')}₫ × {it.quantity}</div>
                      </div>
                      <div className="line-total">{(Number(it.price || 0) * Number(it.quantity || 0)).toLocaleString('vi-VN')}₫</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <div className="section-title">Địa chỉ giao hàng</div>
                {!showAddressForm && (
                  <div className="address-block" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap: 8}}>
                    <div>
                      {(address.street || address.city || state.user?.address || state.user?.addressObject) ? (
                        <>
                          <div>{address.name || state.user?.addressObject?.name} {(address.phone || state.user?.addressObject?.phone) ? `- ${address.phone || state.user?.addressObject?.phone}` : ''}</div>
                          <div>{address.street || state.user?.addressObject?.street}{(address.ward || state.user?.addressObject?.ward) ? `, ${address.ward || state.user?.addressObject?.ward}` : ''}{(address.district || state.user?.addressObject?.district) ? `, ${address.district || state.user?.addressObject?.district}` : ''}{(address.city || state.user?.addressObject?.city) ? `, ${address.city || state.user?.addressObject?.city}` : ''}</div>
                        </>
                      ) : (
                        <div>Chưa có địa chỉ giao hàng</div>
                      )}
                    </div>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button className="btn-default" onClick={()=>navigate('/addresses')}>Chọn địa chỉ khác</button>
                      {!state.user?.defaultAddressId && (
                        <button className="btn-default" onClick={()=>navigate('/checkout/address', { state: { address } })}>Nhập địa chỉ</button>
                      )}
                    </div>
                  </div>
                )}
                {showAddressForm && (
                <div className="address-form">
                  <div className="row two">
                    <div className="field">
                      <label>Họ tên</label>
                      <input value={address.name} onChange={(e)=>setAddress({...address, name: e.target.value})} placeholder="Người nhận" />
                    </div>
                    <div className="field">
                      <label>Số điện thoại</label>
                      <input value={address.phone} onChange={(e)=>setAddress({...address, phone: e.target.value})} placeholder="0123..." />
                    </div>
                  </div>
                  <div className="field">
                    <label>Địa chỉ</label>
                    <input value={address.street} onChange={(e)=>setAddress({...address, street: e.target.value})} placeholder="Số nhà, đường" />
                  </div>
                  <div className="row three">
                    <div className="field"><label>Phường/Xã</label><input value={address.ward} onChange={(e)=>setAddress({...address, ward: e.target.value})} /></div>
                    <div className="field"><label>Quận/Huyện</label><input value={address.district} onChange={(e)=>setAddress({...address, district: e.target.value})} /></div>
                    <div className="field"><label>Tỉnh/Thành</label><input value={address.city} onChange={(e)=>setAddress({...address, city: e.target.value})} /></div>
                  </div>
                  <div className="address-actions">
                    <button className={`btn-default ${useDefault ? 'active':''}`} onClick={(e)=>{e.preventDefault();
                      const user = state.user || {};
                      const addr = user.addressObject || {};
                      setAddress({
                        name: user.name || '',
                        phone: user.phone || '',
                        street: addr.street || '',
                        ward: addr.ward || '',
                        district: addr.district || '',
                        city: addr.city || ''
                      });
                      setUseDefault(true);
                    }}>Địa chỉ mặc định</button>
                    <button className="btn-default" onClick={(e)=>{e.preventDefault(); setShowAddressForm(false);}}>Đóng</button>
                  </div>
                  {!isAddressValid && (
                    <div className="address-warning">Vui lòng nhập đầy đủ Họ tên, SĐT, Địa chỉ và Tỉnh/Thành.</div>
                  )}
                </div>
                )}
              </div>
              <div className="section">
                <div className="section-title">Phương thức thanh toán</div>
                <div className="address-form" style={{ padding: 12 }}>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:8, marginRight:16 }}>
                    <input type="radio" name="pm" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                    <input type="radio" name="pm" checked={paymentMethod==='zalopay'} onChange={()=>setPaymentMethod('zalopay')} />
                    ZaloPay
                  </label>
                </div>
              </div>

              <div className="section" id="vouchers">
                <div className="section-title">Tổng kết</div>
                <div className="totals">
                  <div className="row"><span>Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')}₫</span></div>
                  <div className="row"><span>Phí vận chuyển</span><span>{shipping.toLocaleString('vi-VN')}₫ {shippingVoucherApplied ? '(Miễn phí vận chuyển)' : ''}</span></div>
                  <div className="row"><span>Voucher</span>
                    <span style={{display:'inline-flex', gap: 8, alignItems:'center'}}>
                      <button className="btn-default" onClick={()=>navigate('/my-vouchers')}>{voucherMeta ? `${voucherMeta.code || voucherMeta.title}` : 'Chọn voucher'}</button>
                      <span>-{voucherDiscount.toLocaleString('vi-VN')}₫</span>
                    </span>
                  </div>
                  <div className="row"><span>Điểm thưởng (tối đa {maxPoints.toLocaleString('vi-VN')}đ)</span>
                    <span style={{display:'inline-flex', gap: 8, alignItems:'center'}}>
                      <input
                        type="number"
                        min={0}
                        max={maxPoints}
                        value={pointsUse}
                        onChange={(e)=>setPointsUse(e.target.value)}
                        style={{ width: 100, border:'1px solid #e5e7eb', borderRadius: 8, padding: '6px 8px' }}
                      />
                      <span>-{pointsApplied.toLocaleString('vi-VN')}₫</span>
                    </span>
                  </div>
                  <div className="row"><span>Giảm giá</span><span>-{discount.toLocaleString('vi-VN')}₫</span></div>
                  <div className="row grand"><span>Tổng cộng</span><span>{total.toLocaleString('vi-VN')}₫</span></div>
                </div>
              </div>

              <div className="place-order-bar">
                <Button className="place-order-btn" onClick={placeOrder}>Đặt hàng</Button>
              </div>
            </>
          )}
        </div>
      </div>
      {addressPopupOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-title">Thiếu địa chỉ giao hàng</div>
            <div className="modal-text">Vui lòng nhập đầy đủ địa chỉ giao hàng để tiếp tục đặt hàng.</div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setAddressPopupOpen(false)}>Đóng</button>
              <button className="btn-primary" onClick={() => { setAddressPopupOpen(false); navigate('/checkout/address', { state: { address } }); }}>Nhập địa chỉ</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default CheckoutPage;


