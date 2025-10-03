import { ArrowLeft, Heart, Minus, Plus, Share2, ShoppingCart, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Page, useSnackbar } from 'zmp-ui';
import { useApp } from '../context/AppContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const snackbar = useSnackbar();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ stars: 5, comment: '' });
  const [toast, setToast] = useState({ visible: false, text: '', type: 'success' });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      console.log('ProductDetail: Loading product with ID:', id);
      console.log('ProductDetail: Current state.products:', state.products);
      
      if (!state.products || state.products.length === 0) {
        console.log('ProductDetail: No products in state, loading...');
        await actions.loadProducts();
        console.log('ProductDetail: Products loaded, new state.products:', state.products);
      }
      
      const foundProduct = (state.products || []).find(p => {
        const productId = String(p.id);
        const searchId = String(id);
        console.log('ProductDetail: Comparing product ID:', productId, 'with search ID:', searchId);
        return productId === searchId;
      });
      
      console.log('ProductDetail: Found product:', foundProduct);
      setProduct(foundProduct || null);
      
      if (foundProduct) {
        setSelectedImage(0);
      } else {
        console.log('ProductDetail: Product not found! Available product IDs:', (state.products || []).map(p => p.id));
        
        // Fallback: Try to fetch product directly from API
        try {
          console.log('ProductDetail: Trying to fetch product directly from API...');
          const { default: ApiService } = await import('../services/apiService');
          const response = await ApiService.getProducts({ id: id });
          console.log('ProductDetail: Direct API response:', response);
          
          if (response.success && response.data && response.data.length > 0) {
            const directProduct = response.data[0];
            console.log('ProductDetail: Found product via direct API:', directProduct);
            setProduct(directProduct);
            setSelectedImage(0);
          } else {
            console.log('ProductDetail: Product not found via direct API either');
            setProduct(null);
          }
        } catch (error) {
          console.error('ProductDetail: Error fetching product directly:', error);
          setProduct(null);
        }
      }
    };
    load();
  }, [id, state.products, actions]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const stock = Number(product.stock || product.quantityAvailable || 0);
    if (stock > 0 && quantity > stock) {
      setError(`Chỉ còn ${stock} sản phẩm trong kho`);
      return;
    }
    setError('');
    actions.addToCart(product.id, quantity).then((res) => {
      const ok = !!(res && res.success);
      setToast({ visible: true, text: ok ? 'Đã thêm vào giỏ hàng' : 'Thêm giỏ hàng thất bại', type: ok ? 'success' : 'warning' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    const stock = Number(product.stock || product.quantityAvailable || 0);
    if (stock > 0 && quantity > stock) {
      setError(`Chỉ còn ${stock} sản phẩm trong kho`);
      return;
    }
    setError('');
    
    // Tạo item cho sản phẩm đang chọn
    const selectedItem = {
      productId: product.id,
      quantity: quantity,
      price: discountPrice,
      product: product
    };
    
    // Chuyển đến checkout với chỉ sản phẩm đang chọn
    navigate('/checkout', { 
      state: { 
        selectedItems: [selectedItem] 
      } 
    });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleOpenReviewForm = () => setShowReviewForm(true);
  const handleCancelReview = () => {
    setShowReviewForm(false);
    setNewReview({ stars: 5, comment: '' });
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;
    const res = await actions.api.addProductReview(product.id, newReview);
    // Fallback if actions.api not available: call service directly
    if (!res || !res.success) {
      const { default: ApiService } = await import('../services/apiService');
      const altRes = await ApiService.addProductReview(product.id, newReview);
      if (altRes.success) setProduct(altRes.data);
    } else {
      setProduct(res.data);
    }
    handleCancelReview();
  };

  if (!product) {
    return (
      <Page className="product-detail-page">
        <div className="product-detail-container">
          {state.products && state.products.length > 0 ? (
            <div className="loading-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-description"></div>
              </div>
            </div>
          ) : (
            <div className="loading-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-description"></div>
              </div>
            </div>
          )}
        </div>
      </Page>
    );
  }

  const images = product.images || [product.image];
  const discountPrice = product.discount ? 
    Math.round(Number(product.price) * (1 - Number(product.discount) / 100)) : 
    Number(product.price);

  return (
    <Page className="product-detail-page">
      <div className="product-detail-container">
        {/* Header */}
        <div className="product-header"></div>

        {/* Product Images */}
        <div className="product-images">
          <div className="main-image">
            <button 
              className="image-back-btn" 
              onClick={handleBack} 
              aria-label="Quay lại"
            >
              <ArrowLeft size={18} />
            </button>
            <img 
              src={images[selectedImage]} 
              alt={product.name}
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
            <div className="image-actions">
              <button 
                className={`image-action-btn ${isFavorite ? 'favorite' : ''}`}
                onClick={toggleFavorite}
                aria-label="Yêu thích"
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button 
                className="image-action-btn"
                onClick={handleShare}
                aria-label="Chia sẻ"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header-info">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating || 0) ? '#fbbf24' : 'none'}
                    color={i < Math.floor(product.rating || 0) ? '#fbbf24' : '#d1d5db'}
                  />
                ))}
              </div>
              <span className="rating-text">
                {product.rating || 0} ({product.reviews || 0} đánh giá)
              </span>
            </div>
          </div>

          <div className="product-price">
            <div className="price-main">
              <span className="current-price">
                {discountPrice.toLocaleString('vi-VN')}₫
              </span>
              {product.discount && (
                <span className="original-price">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            {product.discount && (
              <div className="discount-badge">
                -{product.discount}%
              </div>
            )}
          </div>

          {error && (
            <div className="product-error" role="alert" style={{ color: '#ef4444', marginTop: 8 }}>
              {error}
            </div>
          )}

          {/* Quantity Controls before description */}
          <div className="quantity-row">
            <span className="quantity-label">Số lượng</span>
            <div className="inline-quantity">
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                aria-label="Giảm số lượng"
              >
                <Minus size={18} />
              </button>
              <span className="quantity-value">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
                aria-label="Tăng số lượng"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.detailedDescription || product.description}</p>
          </div>


          {product.tags && product.tags.length > 0 && (
            <div className="product-tags">
              <h3>Thẻ tag</h3>
              <div className="tags-list">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.categories && product.categories.length > 0 && (
            <div className="product-categories">
              <h3>Danh mục</h3>
              <div className="categories-list">
                {product.categories.map((category, index) => (
                  <span key={index} className="category">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="product-reviews">
            <h3>Đánh giá sản phẩm</h3>
            <div className="reviews-summary">
              <div className="average">
                <span className="score">{(product.rating || 0).toFixed(1)}</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < Math.floor(product.rating || 0) ? '#fbbf24' : 'none'}
                      color={i < Math.floor(product.rating || 0) ? '#fbbf24' : '#d1d5db'}
                    />
                  ))}
                </div>
                <span className="count">{product.reviews || 0} đánh giá</span>
              </div>
              <button className="write-review-btn" onClick={handleOpenReviewForm}>Viết đánh giá</button>
            </div>

            {Array.isArray(product.reviewsList) && product.reviewsList.length > 0 ? (
              <div className="reviews-list">
                {product.reviewsList.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        {r.avatar && (
                          <img src={r.avatar} alt={r.author || 'Avatar'} className="reviewer-avatar" />
                        )}
                        <div className="reviewer">{r.author || 'Người dùng'}</div>
                      </div>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={14}
                            fill={i < (r.stars || 0) ? '#fbbf24' : 'none'}
                            color={i < (r.stars || 0) ? '#fbbf24' : '#d1d5db'}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="review-content">{r.comment}</div>
                    {r.date && <div className="review-date">{r.date}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="reviews-empty">Chưa có đánh giá nào cho sản phẩm này.</div>
            )}

            {showReviewForm && (
              <div className="review-form">
                <div className="stars-select">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      className={`star-btn ${newReview.stars >= s ? 'active' : ''}`}
                      onClick={(e)=>{e.preventDefault(); setNewReview({...newReview, stars: s});}}
                      aria-label={`Chọn ${s} sao`}
                    >
                      <Star size={18} fill={newReview.stars >= s ? '#fbbf24' : 'none'} color={newReview.stars >= s ? '#fbbf24' : '#d1d5db'} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="review-textarea"
                  rows={3}
                  placeholder="Chia sẻ cảm nhận của bạn..."
                  value={newReview.comment}
                  onChange={(e)=>setNewReview({...newReview, comment: e.target.value})}
                />
                <div className="review-actions">
                  <button className="review-cancel" onClick={handleCancelReview}>Hủy</button>
                  <button className="review-submit" onClick={handleSubmitReview}>Gửi đánh giá</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Section */}
        <div className="add-to-cart-section">
          {/* Tổng giá tiền ngay trên nút Mua ngay */}
          <div className="total-price-above-button">
            <span className="total-label">Tổng:</span>
            <span className="total-value">{(discountPrice * quantity).toLocaleString('vi-VN')}₫</span>
            <span className="unit-price">({discountPrice.toLocaleString('vi-VN')}₫/sp)</span>
          </div>
          
          <div className="purchase-bar">
            <button 
              className="quick-cart-btn"
              onClick={() => navigate('/cart')}
              aria-label="Giỏ hàng"
            >
              <div className="icon-wrap">
                <ShoppingCart size={18} />
                {(state.cart?.items?.length || 0) > 0 && (
                  <span className="quick-cart-badge">{state.cart.items.length}</span>
                )}
              </div>
            </button>
            <Button className="add-to-cart-btn" onClick={handleAddToCart}>
              Thêm vào giỏ
            </Button>
            <Button className="detail-buy-now-btn" onClick={handleBuyNow}>
              Mua ngay
            </Button>
          </div>
        </div>

        {/* Toast */}
        {toast.visible && (
          <div className={`um-toast ${toast.type}`} role="status" aria-live="polite">{toast.text}</div>
        )}
      </div>
    </Page>
  );
};

export default ProductDetail;
