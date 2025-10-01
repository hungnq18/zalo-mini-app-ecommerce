import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/pageHeader.scss';

const PageHeader = ({ 
  title, 
  showBackButton = true, 
  onBackClick, 
  rightContent,
  className = '',
  variant = 'default', // 'default', 'minimal', 'colored', 'cart', 'notifications'
  customStyles = {} // Allow custom inline styles
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`page-header ${variant} ${className}`} style={customStyles}>
      {showBackButton && (
        <button 
          className="back-btn" 
          onClick={handleBackClick}
          aria-label="Quay lại"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      <h1 className="page-title">{title}</h1>
      
      {rightContent && (
        <div className="header-right">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
