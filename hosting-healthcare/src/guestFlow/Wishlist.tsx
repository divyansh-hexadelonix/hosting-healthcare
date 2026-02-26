import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Frown } from 'lucide-react';
import { useAuth } from '../assets/AuthContext';
import { propertiesData } from '../data/propertiesData';
import './Wishlist.css';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, toggleWishlist } = useAuth();

  const [localReviews, setLocalReviews] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const savedReviews = localStorage.getItem('hh_reviews');
    if (savedReviews) {
      try {
        setLocalReviews(JSON.parse(savedReviews));
      } catch (error) {
        console.error("Failed to parse reviews from local storage", error);
      }
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const wishlistedProperties = propertiesData.filter((property) =>
    user?.wishlist?.includes(String(property.id))
  );

  const handleCardClick = (propertyId: number | string) => {
    navigate('/stay-details', { state: { propertyId } });
  };

  const handleRemoveClick = (e: React.MouseEvent, propertyId: number | string) => {
    e.stopPropagation(); 
    toggleWishlist(propertyId.toString());
  };

  if (!isAuthenticated) {
     return null; 
  }

  return (
    <div className="wishlist-page-wrapper">
      <div className="wishlist-container">
        <div className="wishlist-header-strip">
          <h1>My Wishlist</h1>
        </div>

        <div className="wishlist-content-body">
          {wishlistedProperties.length > 0 ? (
            <div className="wishlist-grid">
              {wishlistedProperties.map((property) => {
                // Calculate dynamic rating
                const propertyReviews = localReviews[property.id] || [];
                const allReviews = [...propertyReviews, ...(property.reviewsList || [])];
                const totalRating = allReviews.reduce((acc, r) => acc + Number(r.rating), 0);
                const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : Number(property.rating);
                const reviewCount = allReviews.length > 0 ? allReviews.length : property.reviews;
                return (
                <div
                  key={property.id}
                  className="wishlist-card"
                  onClick={() => handleCardClick(property.id)}
                >
                  <div className="wishlist-image-container">
                    <img
                      src={property.image}
                      alt={property.propertyName}
                      className="wishlist-image"
                    />
                    <button
                      className="wishlist-remove-btn"
                      onClick={(e) => handleRemoveClick(e, property.id)}
                      title="Remove from wishlist"
                    >
                      <Heart
                        size={24}
                        color="#FF385C"
                        fill="#FF385C"
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>

                  <div className="wishlist-card-content">
                    <div className="wishlist-card-header">
                      <h3 className="wishlist-title">{property.propertyName}</h3>
                      <div className="wishlist-price-box">
                        <span className="wishlist-price">{property.price}</span>
                        <span className="wishlist-price-label">/night</span>
                      </div>
                    </div>

                    <div className="wishlist-location">
                      <MapPin size={14} color="#777" />
                      <span>{property.city}</span>
                    </div>

                    <div className="wishlist-meta">
                        <span>{property.capacity}</span>
                    </div>

                    <div className="wishlist-rating-row">
                      <div className="wishlist-rating">
                        <Star size={14} fill="#ff9f00" color="#ff9f00" />
                        <span className="rating-val">{avgRating}</span>
                      </div>
                      <span className="dot">•</span>
                      <span className="review-txt">{reviewCount} reviews</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          ) : (

            <div className="empty-wishlist-state">
              <Frown size={64} color="#ccc" />
              <h2>Your wishlist is empty</h2>
              <p>Find stays you love and save them here to review later.</p>
              <button onClick={() => navigate('/browseStays')} className="browse-btn">
                Browse Stays
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;