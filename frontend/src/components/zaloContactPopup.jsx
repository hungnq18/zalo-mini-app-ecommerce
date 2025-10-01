import { MessageCircle, X } from 'lucide-react';
import React, { useState } from 'react';
import '../css/zaloContactPopup.scss';

const ZaloContactPopup = () => {
  const [isVisible, setIsVisible] = useState(true);

  // TÙY CHỈNH TIN NHẮN TỰ ĐỘNG
  const getAutoMessage = () => {
    const currentPage = window.location.pathname;
    let message = `Xin chào UnionMart! 👋\n\n`;
    
    // Tùy chỉnh tin nhắn theo trang hiện tại
    if (currentPage.includes('/product/')) {
      message += `Tôi đang xem sản phẩm và muốn được tư vấn thêm.\n\n`;
    } else if (currentPage.includes('/cart')) {
      message += `Tôi có sản phẩm trong giỏ hàng và cần hỗ trợ đặt hàng.\n\n`;
    } else {
      message += `Tôi quan tâm đến các sản phẩm trên ứng dụng và muốn được tư vấn.\n\n`;
    }
    
    message += `Thông tin tôi cần hỗ trợ:
• Tư vấn sản phẩm
• Chính sách giao hàng  
• Ưu đãi hiện tại
• Phương thức thanh toán

Cảm ơn bạn! 🛒`;

    return message;
  };

  const handleZaloClick = () => {
    // Lấy tin nhắn tự động (có thể tùy chỉnh theo trang)
    const autoMessage = encodeURIComponent(getAutoMessage());

    // CÁCH 1: Gửi tin nhắn qua Zalo OA (khuyến nghị)
    const zaloOAId = 'unionmart'; // ⚠️ THAY ĐỔI ALIAS OA THỰC TẾ
    const zaloOALink = `https://zalo.me/${zaloOAId}?message=${autoMessage}`;
    
    // CÁCH 2: Gửi tin nhắn qua số điện thoại (backup)
    const phoneNumber = '0123456789'; // ⚠️ THAY ĐỔI SỐ ĐIỆN THOẠI THỰC TẾ
    const zaloPhoneLink = `https://zalo.me/${phoneNumber}?message=${autoMessage}`;
    
    // Thử mở Zalo OA trước, nếu không được thì dùng số điện thoại
    try {
      // Ưu tiên mở OA
      window.open(zaloOALink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      // Fallback: mở chat với số điện thoại
      window.open(zaloPhoneLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="zalo-contact-popup">
      <div className="zalo-popup-container">
        <button 
          className="zalo-popup-button"
          onClick={handleZaloClick}
          title="Liên hệ qua Zalo"
        >
          <div className="zalo-white-square"></div>
          <div className="zalo-logo">
            <MessageCircle size={20} />
          </div>
          <span className="zalo-text">ZALO</span>
        </button>
        
        <button 
          className="zalo-close-button"
          onClick={handleClose}
          title="Đóng"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ZaloContactPopup;
