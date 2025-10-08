import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/backButton.scss';

const BackButton = ({ 
  text = 'Quay lại', 
  onClick, 
  className = '', 
  variant = 'default' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      className={`back-button back-button--${variant} ${className}`}
      onClick={handleClick}
    >
      <ArrowLeft className="back-button__icon" size={24} strokeWidth={2.5} />
      <span className="back-button__text">{text}</span>
    </button>
  );
};

export default BackButton;
