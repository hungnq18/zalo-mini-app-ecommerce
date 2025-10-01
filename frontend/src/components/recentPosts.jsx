import React from 'react';
import { useApp } from '../context/AppContext';
import '../css/recentPosts.scss';

const RecentPosts = () => {
  const { state } = useApp();

  // Generate posts from database promotions
  const posts = state.promotions.slice(0, 3).map((promotion, index) => ({
    id: promotion.id,
    title: promotion.title,
    subtitle: promotion.subtitle,
    description: promotion.description,
    image: promotion.image,
    buttonText: "Xem ngay",
    type: promotion.type || "promotion"
  }));

  // Show loading state if no promotions
  if (state.loading.promotions || posts.length === 0) {
    return (
      <div className="recent-posts-container">
        <div className="recent-posts-header">
          <h2>Bài viết gần đây</h2>
          <p className="recent-posts-note">
            (*) Quan tâm ZaloOA để nhận thông tin khuyến mãi.
          </p>
        </div>
        
        <div className="recent-posts-loading">
          <div className="recent-posts-scroll">
            <div className="recent-posts-list">
              {[1, 2, 3].map((index) => (
                <div key={index} className="recent-post-card">
                  <div className="post-image">
                    <div className="skeleton"></div>
                  </div>
                  <div className="post-content">
                    <div className="skeleton post-title"></div>
                    <div className="skeleton post-description"></div>
                    <div className="skeleton post-button"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-posts-container">
      <div className="recent-posts-header">
        <h2>Bài viết gần đây</h2>
        <p className="recent-posts-note">
          (*) Quan tâm ZaloOA để nhận thông tin khuyến mãi.
        </p>
      </div>
      
      <div className="recent-posts-scroll">
        <div className="recent-posts-list">
          {posts.map((post) => (
            <div key={post.id} className="recent-post-card">
              <div className="post-image">
                <img 
                  src={post.image} 
                  alt={post.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="post-image-fallback" style={{display: 'none'}}>
                  <span>📰</span>
                </div>
              </div>
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                {post.subtitle && (
                  <h4 className="post-subtitle">{post.subtitle}</h4>
                )}
                <p className="post-description">{post.description}</p>
                <button className="post-button">
                  {post.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentPosts;
