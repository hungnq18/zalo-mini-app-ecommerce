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
    } else if (currentPage.includes('/lucky-wheel')) {
      message += `Tôi vừa tham gia vòng quay may mắn và cần hỗ trợ về voucher.\n\n`;
    } else if (currentPage.includes('/my-vouchers')) {
      message += `Tôi đang xem voucher của mình và cần hỗ trợ sử dụng.\n\n`;
    } else {
      message += `Tôi quan tâm đến các sản phẩm trên ứng dụng và muốn được tư vấn.\n\n`;
    }
    
    message += `Thông tin tôi cần hỗ trợ:
• Tư vấn sản phẩm
• Chính sách giao hàng  
• Ưu đãi hiện tại
• Phương thức thanh toán
• Hỗ trợ voucher

Cảm ơn bạn! 🛒`;

    return message;
  };

  const handleZaloClick = () => {
    // Tạo tin nhắn đơn giản để test
    const simpleMessage = encodeURIComponent('Xin chào UnionMart! Tôi cần hỗ trợ.');
    
    // CÁCH 1: Thử mở Zalo OA trước
    const zaloOAId = 'unionmart'; // ⚠️ THAY ĐỔI ALIAS OA THỰC TẾ
    const zaloOALink = `https://zalo.me/oa/${zaloOAId}?message=${simpleMessage}`;
    
    // CÁCH 2: Fallback với số điện thoại
    const phoneNumber = '0917899282'; // ⚠️ THAY ĐỔI SỐ ĐIỆN THOẠI THỰC TẾ
    const zaloPhoneLink = `https://zalo.me/${phoneNumber}?message=${simpleMessage}`;
    
    console.log('Trying Zalo OA Link:', zaloOALink);
    console.log('Fallback Phone Link:', zaloPhoneLink);
    
    // Kiểm tra xem có phải mobile không
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Thử mở Zalo OA trước
    if (isMobile) {
      // Trên mobile, mở app Zalo
      window.location.href = zaloOALink;
    } else {
      // Trên desktop, mở tab mới
      window.open(zaloOALink, '_blank', 'noopener,noreferrer');
    }
    
    // Nếu không mở được OA, thử số điện thoại sau 2 giây
    setTimeout(() => {
      if (isMobile) {
        window.location.href = zaloPhoneLink;
      } else {
        window.open(zaloPhoneLink, '_blank', 'noopener,noreferrer');
      }
    }, 2000);
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
