import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Page } from 'zmp-ui';
import { useApp } from '../context/AppContext';
import '../css/checkoutPage.scss';

const AddressFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.address || {};
  const { actions } = useApp();
  const [address, setAddress] = useState({
    name: initial.name || '',
    phone: initial.phone || '',
    street: initial.street || '',
    ward: initial.ward || '',
    district: initial.district || '',
    city: initial.city || ''
  });

  const [setDefault, setSetDefault] = useState(false);

  const isValid = (
    (address.name || '').trim() !== '' &&
    (address.phone || '').trim() !== '' &&
    (address.street || '').trim() !== '' &&
    (address.city || '').trim() !== ''
  );

  const save = async () => {
    if (!isValid) return;
    if (setDefault) {
      const flat = `${address.name || ''}${address.phone ? ' - ' + address.phone : ''}${address.street ? ' - ' + address.street : ''}${address.ward ? ', ' + address.ward : ''}${address.district ? ', ' + address.district : ''}${address.city ? ', ' + address.city : ''}`.trim();
      await actions.updateUser({ addressObject: address, address: flat });
    }
    navigate('/checkout', { state: { address } });
  };

  return (
    <Page className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <h1>Địa chỉ giao hàng</h1>
        </div>

        <div className="checkout-content">
          <div className="address-form">
            <div className="row two">
              <div className="field">
                <label>Họ tên</label>
                <input value={address.name} onChange={(e)=>setAddress({ ...address, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Số điện thoại</label>
                <input value={address.phone} onChange={(e)=>setAddress({ ...address, phone: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>Địa chỉ</label>
              <input value={address.street} onChange={(e)=>setAddress({ ...address, street: e.target.value })} placeholder="Số nhà, đường" />
            </div>
            <div className="row three">
              <div className="field"><label>Phường/Xã</label><input value={address.ward} onChange={(e)=>setAddress({ ...address, ward: e.target.value })} /></div>
              <div className="field"><label>Quận/Huyện</label><input value={address.district} onChange={(e)=>setAddress({ ...address, district: e.target.value })} /></div>
              <div className="field"><label>Tỉnh/Thành</label><input value={address.city} onChange={(e)=>setAddress({ ...address, city: e.target.value })} /></div>
            </div>
            {!isValid && (
              <div className="address-warning">Vui lòng nhập đầy đủ Họ tên, SĐT, Địa chỉ và Tỉnh/Thành.</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input id="setDefault" type="checkbox" checked={setDefault} onChange={(e)=>setSetDefault(e.target.checked)} />
              <label htmlFor="setDefault">Đặt làm địa chỉ mặc định</label>
            </div>
            <div className="place-order-bar" style={{ marginTop: 12 }}>
              <div className="summary"></div>
              <Button className="place-order-btn" onClick={save} disabled={!isValid}>Lưu địa chỉ</Button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AddressFormPage;


