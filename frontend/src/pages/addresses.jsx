import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import { useApp } from '../context/AppContext';
import '../css/checkoutPage.scss';

const emptyAddr = { name: '', phone: '', street: '', ward: '', district: '', city: '' };

const AddressesPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const user = state.user || {};
  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddr);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const isValid = (
    (form.name || '').trim() !== '' &&
    (form.phone || '').trim() !== '' &&
    (form.street || '').trim() !== '' &&
    (form.city || '').trim() !== ''
  );

  const saveNew = async () => {
    if (!isValid) return;
    const newId = Date.now().toString();
    const newAddr = { id: newId, ...form };
    const next = [...addresses, newAddr];
    const flat = `${newAddr.name || ''}${newAddr.phone ? ' - ' + newAddr.phone : ''}${newAddr.street ? ' - ' + newAddr.street : ''}${newAddr.ward ? ', ' + newAddr.ward : ''}${newAddr.district ? ', ' + newAddr.district : ''}${newAddr.city ? ', ' + newAddr.city : ''}`.trim();
    await actions.updateUser({
      addresses: next,
      ...(setAsDefault ? { defaultAddressId: newId, addressObject: newAddr, address: flat } : {})
    });
    setShowForm(false);
    setForm(emptyAddr);
    setSetAsDefault(false);
  };

  const setDefault = async (addr) => {
    const flat = `${addr.name || ''}${addr.phone ? ' - ' + addr.phone : ''}${addr.street ? ' - ' + addr.street : ''}${addr.ward ? ', ' + addr.ward : ''}${addr.district ? ', ' + addr.district : ''}${addr.city ? ', ' + addr.city : ''}`.trim();
    await actions.updateUser({ defaultAddressId: addr.id, addressObject: addr, address: flat });
  };

  const removeAddress = async (id) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    const next = addresses.filter((a) => a.id !== id);
    const updates = { addresses: next };
    if (user.defaultAddressId === id) {
      const fallback = next[0] || null;
      if (fallback) {
        const flat = `${fallback.name || ''}${fallback.phone ? ' - ' + fallback.phone : ''}${fallback.street ? ' - ' + fallback.street : ''}${fallback.ward ? ', ' + fallback.ward : ''}${fallback.district ? ', ' + fallback.district : ''}${fallback.city ? ', ' + fallback.city : ''}`.trim();
        updates.defaultAddressId = fallback.id;
        updates.addressObject = fallback;
        updates.address = flat;
      } else {
        updates.defaultAddressId = null;
        updates.addressObject = null;
        updates.address = '';
      }
    }
    await actions.updateUser(updates);
  };

  return (
    <Page className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={18} />
          </button>
          <h1>Địa chỉ của tôi</h1>
        </div>

        <div className="checkout-content">
          <div className="section">
            <div className="section-title">Danh sách địa chỉ</div>
            {addresses.length === 0 && (
              <div className="address-warning">Chưa có địa chỉ nào. Thêm địa chỉ mới bên dưới.</div>
            )}
            <div className="product-list">
              {addresses.map((a) => (
                <div key={a.id} className="product-row" style={{ gridTemplateColumns: '1fr auto auto', gap: '8px' }}>
                  <div>
                    <div className="name">{a.name} {a.phone ? `- ${a.phone}` : ''}</div>
                    <div className="meta">{a.street}{a.ward ? `, ${a.ward}` : ''}{a.district ? `, ${a.district}` : ''}{a.city ? `, ${a.city}` : ''}</div>
                  </div>
                  <button className="btn-default" onClick={() => setDefault(a)}>{user.defaultAddressId === a.id ? 'Mặc định' : 'Chọn mặc định'}</button>
                  <button className="btn-default" onClick={() => removeAddress(a.id)}>Xóa</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-title">Thêm địa chỉ</div>
            {!showForm ? (
              <button className="btn-default" onClick={() => setShowForm(true)}>+ Thêm địa chỉ</button>
            ) : (
              <div className="address-form">
                <div className="row two">
                  <div className="field">
                    <label>Họ tên</label>
                    <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Số điện thoại</label>
                    <input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="field">
                  <label>Địa chỉ</label>
                  <input value={form.street} onChange={(e)=>setForm({ ...form, street: e.target.value })} placeholder="Số nhà, đường" />
                </div>
                <div className="row three">
                  <div className="field"><label>Phường/Xã</label><input value={form.ward} onChange={(e)=>setForm({ ...form, ward: e.target.value })} /></div>
                  <div className="field"><label>Quận/Huyện</label><input value={form.district} onChange={(e)=>setForm({ ...form, district: e.target.value })} /></div>
                  <div className="field"><label>Tỉnh/Thành</label><input value={form.city} onChange={(e)=>setForm({ ...form, city: e.target.value })} /></div>
                </div>
                {!isValid && (
                  <div className="address-warning">Vui lòng nhập đầy đủ Họ tên, SĐT, Địa chỉ và Tỉnh/Thành.</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input id="setAddrDefault" type="checkbox" checked={setAsDefault} onChange={(e)=>setSetAsDefault(e.target.checked)} />
                  <label htmlFor="setAddrDefault">Đặt làm địa chỉ mặc định</label>
                </div>
                <div className="place-order-bar" style={{ marginTop: 12 }}>
                  <div className="summary"></div>
                  <button className="btn-primary" onClick={saveNew} disabled={!isValid}>Lưu</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AddressesPage;


