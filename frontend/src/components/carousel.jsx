import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import '../css/carousel.scss';

const Carousel = () => {
  const { state, actions } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Load promotions when component mounts
  useEffect(() => {
    if (state.promotions.length === 0) {
      actions.loadPromotions();
    }
  }, []);

  const slides = state.promotions.length > 0 ? state.promotions : [
    {
      id: 1,
      title: "SIÊU MUA CHẤT LƯỢNG",
      subtitle: "KINH DOANH THỊNH VƯỢNG",
      description: "VỪA TIÊU DÙNG, VỪA TẠO THU NHẬP THỤ ĐỘNG",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      overlay: "rgba(59, 130, 246, 0.7)"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Click handler for carousel
  const handleCarouselClick = (e) => {
    // Don't trigger if clicking on buttons or interactive elements
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const carouselWidth = rect.width;
    
    // Click left half = previous slide, right half = next slide
    if (clickX < carouselWidth / 2) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      className="relative rounded-b-3xl overflow-hidden mb-4 image-carousel cursor-pointer"
      onClick={handleCarouselClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 carousel-image"
        style={{ 
          backgroundImage: `url(${currentSlideData.image})`,
        }}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 transition-all duration-1000 carousel-overlay"
          style={{ backgroundColor: currentSlideData.overlay }}
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="carousel-arrow absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 z-10 transition-all duration-200 carousel-button-hover"
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="carousel-arrow absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 z-10 transition-all duration-200 carousel-button-hover"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 py-8">
        {/* Title and Subtitle */}
        <div className="slide-content text-center mb-6">
          <h1 className="text-white font-bold text-2xl mb-2 carousel-text-shadow carousel-title">
            {currentSlideData.title}
          </h1>
          <h2 className="text-yellow-300 font-bold text-xl mb-3 carousel-text-shadow carousel-subtitle">
            {currentSlideData.subtitle}
          </h2>
          <p className="text-white text-base carousel-text-shadow max-w-md mx-auto carousel-description">
            {currentSlideData.description}
          </p>
        </div>

        {/* Call to Action */}
        <div className="slide-cta text-center">
          <button className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-semibold text-base hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:scale-105 carousel-button-hover">
            Khám phá ngay
          </button>
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-dot w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-30 rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {currentSlide + 1}/{slides.length}
        </span>
      </div>


      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30" />
    </div>
  );
};

export default Carousel;