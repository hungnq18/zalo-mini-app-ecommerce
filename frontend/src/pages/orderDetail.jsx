import { ArrowLeft, CheckCircle2, Clock, Package, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from 'zmp-ui';
import { useApp } from '../context/AppContext';

const STATUS_LABEL = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [order, setOrder] = useState(null);
  const [openTimelineKey, setOpenTimelineKey] = useState(null);

  const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN') + '₫';

  useEffect(() => {
    const load = async () => {
      const needOrders = !state.orders || state.orders.length === 0;
      const needProducts = !state.products || state.products.length === 0;
      if (needOrders || needProducts) {
        await Promise.all([
          needOrders ? actions.loadOrders() : Promise.resolve(),
          needProducts ? actions.loadProducts() : Promise.resolve(),
        ]);
      }
      const found = ((state.orders || [])).find(o => String(o.id) === String(id));
      if (found) {
        // enrich items with product info
        const products = state.products || [];
        const productMap = new Map(products.map(p => [String(p.id), p]));
        const enriched = (found.items || []).map((it) => {
          const product = productMap.get(String(it.productId)) || it.product || null;
          const authoritativePrice = (product?.price != null ? product.price : 0);
          return { ...it, product, price: authoritativePrice };
        });
        setOrder({ ...found, items: enriched });
      } else {
        setOrder(null);
      }
    };
    load();
  }, [id, state.orders, state.products, actions]);

  if (!order) {
    return (
      <Page className="order-detail-page">
        <div className="order-detail-container">
          {/* Header với nút back */}
          <div className="order-header">
            <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
              <ArrowLeft size={20} />
            </button>
            <h1 className="header-title">Chi tiết đơn hàng</h1>
            <div className="header-spacer"></div>
          </div>
          <div className="loading">Đang tải đơn hàng...</div>
        </div>
      </Page>
    );
  }

  return (
    <Page className="order-detail-page">
      <div className="order-detail-container">
        {/* Header với nút back */}
        <div className="order-header">
          <button className="back-button" onClick={() => navigate(-1)} aria-label="Quay lại">
            <ArrowLeft size={20} />
          </button>
          <h1 className="header-title">Chi tiết đơn hàng</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="order-summary">
          <div className="order-number">Đơn hàng #{order.orderNumber || order.id}</div>
          <div className="order-status">{STATUS_LABEL[order.status] || order.status}</div>
          <div className="order-meta">
            <span>Ngày đặt: {order.date}</span>
            <span>Tổng tiền: {Number(order.total || 0).toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="order-timeline">
          {[
            { key: 'pending', label: 'Đặt hàng', Icon: Clock },
            { key: 'processing', label: 'Chuẩn bị hàng', Icon: Package },
            { key: 'shipping', label: 'Đang giao', Icon: Truck },
            { key: 'delivered', label: 'Đã giao', Icon: CheckCircle2 },
          ].map(({ key, label, Icon }) => {
            const isDone =
              (key === 'pending') ||
              (key === 'processing' && ['processing','shipping','delivered'].includes(order.status)) ||
              (key === 'shipping' && ['shipping','delivered'].includes(order.status)) ||
              (key === 'delivered' && order.status === 'delivered');

            const time = order.statusHistory?.[key] || order.timestamps?.[key] || null;
            const timeLabel = time ? new Date(time).toLocaleString('vi-VN') : 'Chưa có thời gian';
            return (
              <div
                key={key}
                className={`timeline-step ${isDone ? 'done' : ''}`}
              >
                <div className="icon"><Icon size={16} /></div>
                <div className="label">{label}</div>
                {/* Hiển thị luôn thời gian */}
                <div className="timeline-time">{timeLabel}</div>
              </div>
            );
          })}
        </div>

        <div className="order-items">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="item-info">
                <div className="item-name">{item.product?.name || item.name || `Sản phẩm #${item.productId}`}</div>
                <div className="item-meta">Số lượng: {item.quantity} × {formatCurrency(item.price)}</div>
              </div>
              <div className="item-total">{formatCurrency((item.price || 0) * (item.quantity || 0))}</div>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="order-section">
          <div className="section-title">Địa chỉ giao hàng</div>
          <div className="shipping-address">
            {(() => {
              // Kiểm tra shippingAddress là string và có dữ liệu
              if (order.shippingAddress && typeof order.shippingAddress === 'string' && order.shippingAddress.trim()) {
                return order.shippingAddress;
              }
              
              // Kiểm tra field address backup
              if (order.address && typeof order.address === 'string' && order.address.trim()) {
                return order.address;
              }
              
              // Fallback: nếu shippingAddress là object
              const addr = order.shippingAddress || order.address || {};
              if (typeof addr === 'object' && addr !== null) {
                const full = addr.full || [addr.name, addr.phone, addr.street, addr.ward, addr.district, addr.city]
                  .filter(Boolean)
                  .join(', ');
                if (full) return full;
              }
              
              return 'Chưa có địa chỉ giao hàng';
            })()}
          </div>
        </div>

        {/* Voucher and totals */}
        <div className="order-section">
          <div className="section-title">Thanh toán</div>
          {(() => {
            const itemsSubtotal = (order.items || []).reduce((sum, it) => sum + (Number((it.price != null ? it.price : 0)) * Number(it.quantity || 0)), 0);
            const voucherCode = order.voucher?.code || order.voucherCode || null;
            const voucherDiscountRaw =
              order.voucher?.amount ?? order.voucher?.discount ?? order.discount ?? 0;
            const voucherDiscount = Number(voucherDiscountRaw || 0);
            const total = Number((itemsSubtotal - voucherDiscount));
            return (
              <div className="totals">
                <div className="total-row">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(itemsSubtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Giảm giá {voucherCode ? `(Voucher: ${voucherCode})` : ''}</span>
                  <span>-{formatCurrency(voucherDiscount)}</span>
                </div>
                <div className="total-row total-row--grand">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            );
          })()}
        </div>

      </div>
    </Page>
  );
}

export default OrderDetailPage;


