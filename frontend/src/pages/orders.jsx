import { ChevronRight, Package } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from 'zmp-ui';
import BottomNavigation from '../components/bottomNavigation';
import PageHeader from '../components/PageHeader';
import { useApp } from '../context/AppContext';

const STATUS_LABEL = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const STATUS_COLOR = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipping: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

function OrdersPage() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    actions.loadOrders();
  }, [actions]);

  const orders = state.orders || [];
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = orders.filter(o => String(o.status) === String(statusFilter));
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      // Try to parse dates in different formats
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        
        // Handle different date formats
        if (dateStr.includes('/')) {
          // Format: DD/MM/YYYY or MM/DD/YYYY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Assume DD/MM/YYYY format (Vietnamese)
            return new Date(parts[2], parts[1] - 1, parts[0]);
          }
        }
        
        // Try ISO format or other standard formats
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? new Date(0) : parsed;
      };
      
      const dateA = parseDate(a.date || a.createdAt || a.orderDate);
      const dateB = parseDate(b.date || b.createdAt || b.orderDate);
      
      // Sort newest first (descending)
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders, statusFilter]);

  return (
    <Page className="orders-page">
      <div className="orders-container">
        <PageHeader 
          title="Đơn hàng của tôi"
          showBackButton={false}
        />

        {/* Status Filters */}
        <div className="orders-filters">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: STATUS_LABEL.pending },
            { key: 'processing', label: STATUS_LABEL.processing },
            { key: 'shipping', label: STATUS_LABEL.shipping },
            { key: 'delivered', label: STATUS_LABEL.delivered },
            { key: 'cancelled', label: STATUS_LABEL.cancelled },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`orders-filter-btn ${statusFilter === key ? 'active' : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <Package size={28} />
            <div>Không có đơn hàng phù hợp</div>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="order-card"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="order-header">
                  <div className="order-id">#{order.orderNumber || order.id}</div>
                  <div
                    className="order-status-badge"
                    style={{ 
                      backgroundColor: STATUS_COLOR[order.status] || '#374151',
                      color: 'white'
                    }}
                  >
                    {STATUS_LABEL[order.status] || order.status}
                  </div>
                </div>
                
                <div className="order-info">
                  <div className="order-date">
                    <span className="label">Ngày đặt:</span>
                    <span className="value">{order.date}</span>
                  </div>
                  <div className="order-items">
                    <span className="label">Sản phẩm:</span>
                    <span className="value">{order.items?.length || 0} món</span>
                  </div>
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <span className="total-label">Tổng tiền</span>
                    <span className="total-amount">{Number(order.total || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="order-arrow">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </Page>
  );
}

export default OrdersPage;


