import { X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import BottomNavigation from '../components/bottomNavigation';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import '../css/cartPage.scss';

const CartPage = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    actions.loadCart();
    // run only once on mount to avoid loop due to changing actions reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = state.cart?.items || [];
  const total = Number(state.cart?.total || 0);
  const allSelected = selectedIds.length > 0 && selectedIds.length === items.length;
  const selectedTotal = useMemo(() => {
    return items
      .filter(it => selectedIds.includes(String(it.productId)))
      .reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
  }, [items, selectedIds]);

  const toggleSelect = (pid) => {
    const idStr = String(pid);
    setSelectedIds((prev) => prev.includes(idStr) ? prev.filter(x => x !== idStr) : [...prev, idStr]);
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(items.map(it => String(it.productId)));
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) return;
    // Chỉ truyền các sản phẩm đã được chọn
    const selectedItems = items.filter(it => selectedIds.includes(String(it.productId)));
    navigate('/checkout', { 
      state: { 
        selectedItems,
        selectedTotal
      } 
    });
  };

  const askRemove = (productId) => {
    setConfirmTarget(productId);
    setConfirmOpen(true);
  };

  const confirmRemove = () => {
    if (confirmTarget != null) {
      actions.removeFromCart(confirmTarget);
    }
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const cancelRemove = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  return (
    <Page className="cart-page">
      <div className="cart-container">
        <PageHeader 
          title="Giỏ hàng"
          onBackClick={() => navigate(-1)}
          variant="cart"
        />
        
        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Giỏ hàng trống</h3>
              <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            </div>
          ) : (
            <div className="cart-list">
              <div className="cart-select-all">
                <label className="checkbox">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  <span>Chọn tất cả</span>
                </label>
              </div>
              {items.map((it, idx) => (
                <div key={idx} className="cart-item">
                  <div className="cart-item-left">
                    <input
                      type="checkbox"
                      className="item-checkbox"
                      checked={selectedIds.includes(String(it.productId))}
                      onChange={() => toggleSelect(it.productId)}
                      aria-label="Chọn sản phẩm"
                    />
                    <img className="cart-item-image" src={it.product?.image} alt={it.product?.name} />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{it.product?.name || `Sản phẩm #${it.productId}`}</div>
                    <div className="cart-item-row">
                      <div className="price-block"><span className="meta-label">Giá</span> {Number(it.price || 0).toLocaleString('vi-VN')}₫</div>
                      <div className="qty-actions">
                        <div className="qty-controls">
                          <button
                            aria-label="Giảm"
                            onClick={() => {
                              const current = Number(it.quantity || 0);
                              if (current <= 1) {
                                askRemove(it.productId);
                                return;
                              }
                              actions.updateCartItemQuantity(it.productId, current - 1);
                            }}
                          >-</button>
                          <span className="qty-display" aria-live="polite">{it.quantity}</span>
                          <button
                            aria-label="Tăng"
                            onClick={() => actions.updateCartItemQuantity(it.productId, Number(it.quantity || 0) + 1)}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button 
                      className="delete-button" 
                      onClick={() => askRemove(it.productId)}
                      aria-label="Xóa sản phẩm"
                      title="Xóa sản phẩm khỏi giỏ hàng"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-summary">
                {selectedIds.length === 0 ? (
                  <div className="row no-selection">
                    <span>Chưa chọn sản phẩm nào</span>
                    <span>0₫</span>
                  </div>
                ) : (
                  <div className="row">
                    <span>Tổng cộng ({selectedIds.length} sản phẩm)</span>
                    <span>{selectedTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
              </div>
              <div className="checkout-bar">
                <button className="checkout-btn" disabled={selectedIds.length === 0} onClick={handleCheckout}>Thanh toán</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
      {confirmOpen && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-modal">
            <div className="confirm-title">Xóa khỏi giỏ hàng?</div>
            <div className="confirm-text">Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?</div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={cancelRemove}>Hủy</button>
              <button className="btn-danger" onClick={confirmRemove}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default CartPage;
