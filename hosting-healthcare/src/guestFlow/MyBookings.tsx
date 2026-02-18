import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Frown, AlertCircle, Heart, Star } from 'lucide-react';
import { useAuth } from '../assets/AuthContext';
import { propertiesData } from './data/propertiesData';
import './MyBookings.css';

type TabType = 'upcoming' | 'sent' | 'cancelled';

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, withdrawBookingRequest, toggleWishlist } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  
  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<string | null>(null);

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
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) return null;

  // --- Logic ---
  const handleWithdrawClick = (id: string) => {
      setTargetBookingId(id);
      setShowWithdrawModal(true);
  };

  const confirmWithdraw = () => {
      if (targetBookingId) {
          withdrawBookingRequest(targetBookingId);
          setShowWithdrawModal(false);
          setTargetBookingId(null);
      }
  };

  // --- Renderers ---
  const renderUpcoming = () => {
      // Filter wishlist from propertiesData
      const wishlisted = propertiesData.filter(p => user.wishlist?.includes(p.id.toString()));
      
      if (wishlisted.length === 0) return <EmptyState msg="No upcoming bookings saved." />;

      return (
          <div className="bookings-grid">
              {wishlisted.map(p => {
                  // Calculate dynamic rating
                  const propertyReviews = localReviews[p.id] || [];
                  const allReviews = [...propertyReviews, ...(p.reviewsList || [])];
                  const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
                  const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : p.rating;
                  const reviewCount = allReviews.length > 0 ? allReviews.length : p.reviews;
                  return (
                  <div key={p.id} className="property-card" onClick={() => navigate('/stay-details', {state:{propertyId:p.id}})}>
                      <div className="property-image-container">
                        <img src={p.image} alt={p.hotelName} className="property-image" />
                        <button 
                            className="wishlist-button"
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id.toString()); }}
                        >
                            <Heart size={24} fill="#FF385C" color="#FF385C" strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="property-content">
                          <div className="property-header-row">
                            <h3 className="property-title">{p.hotelName}</h3>
                            <div className="price-container-inline">
                                <span className="price-amount">{p.price}</span>
                                <span className="price-label">/night</span>
                            </div>
                          </div>
                          <div className="property-location">
                              <MapPin size={14} color="#777" />
                              <span className="city-text">{p.city}</span>
                          </div>
                          <div className="property-meta">
                              <span className="meta-value">{p.capacity}</span>
                          </div>
                          <div className="rating-review-container">
                              <div className="property-rating">
                                  <span className="star"><Star size={14} fill="#ff9f00" color="#ff9f00" /></span>
                                  <span className="rating-value">{avgRating}</span>
                              </div>
                              <span className="reviews-dot">•</span>
                              <div className="property-reviews">
                                  <span className="reviews-count">{reviewCount} reviews</span>
                              </div>
                          </div>
                      </div>
                  </div>
              )})}
          </div>
      );
  };

  const renderSentRequests = () => {
      const requests = user.sentRequests || [];
      if (requests.length === 0) return <EmptyState msg="No booking requests sent." />;

      return (
          <div className="bookings-grid">
              {requests.map(req => {
                  const p = propertiesData.find(prop => prop.id === req.propertyId);
                  const isWishlisted = user.wishlist?.includes(req.propertyId.toString());
                  
                  // Calculate dynamic rating if property exists
                  const propertyReviews = p ? (localReviews[p.id] || []) : [];
                  const allReviews = p ? [...propertyReviews, ...(p.reviewsList || [])] : [];
                  const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
                  const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : (p?.rating || 0);
                  const reviewCount = allReviews.length > 0 ? allReviews.length : (p?.reviews || 0);

                  return (
                  <div key={req.bookingId} className="property-card">
                      <div className="property-image-container">
                        <img src={req.image} alt={req.hotelName} className="property-image" />
                        <button 
                            className="wishlist-button"
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(req.propertyId.toString()); }}
                        >
                            <Heart 
                                size={24} 
                                color={isWishlisted ? "#FF385C" : "#333"} 
                                fill={isWishlisted ? "#FF385C" : "transparent"} 
                                strokeWidth={1.5}
                            />
                        </button>
                      </div>
                      <div className="property-content">
                          <div className="property-header-row">
                              <h3 className="property-title">{req.hotelName}</h3>
                              <div className="price-container-inline">
                                  <span className="price-amount">{req.price}</span>
                                  <span className="price-label">/night</span>
                              </div>
                          </div>
                          <div className="property-location">
                              <MapPin size={14} color="#777" />
                              <span className="city-text">{req.city}</span>
                          </div>
                          {p && (
                              <div className="rating-review-container">
                                  <div className="property-rating">
                                      <span className="star"><Star size={14} fill="#ff9f00" color="#ff9f00" /></span>
                                      <span className="rating-value">{avgRating}</span>
                                  </div>
                                  <span className="reviews-dot">•</span>
                                  <div className="property-reviews">
                                      <span className="reviews-count">{reviewCount} reviews</span>
                                  </div>
                              </div>
                          )}
                      <button 
                        className="action-btn withdraw-btn"
                        style={{marginTop: 'auto'}}
                        onClick={(e) => { e.stopPropagation(); handleWithdrawClick(req.bookingId); }}
                      >
                          Withdraw Request
                      </button>
                      </div>
                  </div>
              )})}
          </div>
      );
  };

  const renderCancelled = () => {
      const requests = user.cancelledRequests || [];
      if (requests.length === 0) return <EmptyState msg="No cancelled booking requests." />;

      return (
          <div className="bookings-grid">
              {requests.map(req => {
                  const p = propertiesData.find(prop => prop.id === req.propertyId);
                  const isWishlisted = user.wishlist?.includes(req.propertyId.toString());

                  // Calculate dynamic rating if property exists
                  const propertyReviews = p ? (localReviews[p.id] || []) : [];
                  const allReviews = p ? [...propertyReviews, ...(p.reviewsList || [])] : [];
                  const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
                  const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : (p?.rating || 0);
                  const reviewCount = allReviews.length > 0 ? allReviews.length : (p?.reviews || 0);

                  return (
                  <div key={req.bookingId} className="property-card">
                      <div className="property-image-container">
                        <img src={req.image} alt={req.hotelName} className="property-image" />
                        <button 
                            className="wishlist-button"
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(req.propertyId.toString()); }}
                        >
                            <Heart 
                                size={24} 
                                color={isWishlisted ? "#FF385C" : "#333"} 
                                fill={isWishlisted ? "#FF385C" : "transparent"} 
                                strokeWidth={1.5}
                            />
                        </button>
                      </div>
                      <div className="property-content">
                          <div className="property-header-row">
                              <h3 className="property-title">{req.hotelName}</h3>
                              <div className="price-container-inline">
                                  <span className="price-amount">{req.price}</span>
                                  <span className="price-label">/night</span>
                              </div>
                          </div>
                          <div className="property-location">
                              <MapPin size={14} color="#777" />
                              <span className="city-text">{req.city}</span>
                          </div>
                          {p && (
                              <div className="rating-review-container">
                                  <div className="property-rating">
                                      <span className="star"><Star size={14} fill="#ff9f00" color="#ff9f00" /></span>
                                      <span className="rating-value">{avgRating}</span>
                                  </div>
                                  <span className="reviews-dot">•</span>
                                  <div className="property-reviews">
                                      <span className="reviews-count">{reviewCount} reviews</span>
                                  </div>
                              </div>
                          )}
                      <button className="action-btn cancelled-btn" disabled>
                          Request Cancelled
                      </button>
                      </div>
                  </div>
              )})}
          </div>
      );
  };

  return (
    <div className="my-bookings-page">
        <h1 className="page-title">My Bookings</h1>
        
        <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
                Upcoming Booking
            </button>
            <button className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
                Sent Requests
            </button>
            <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
                Cancelled Request
            </button>
        </div>
        <div className="tabs-line"></div>

        <div className="tab-content-container">
            {activeTab === 'upcoming' && renderUpcoming()}
            {activeTab === 'sent' && renderSentRequests()}
            {activeTab === 'cancelled' && renderCancelled()}
        </div>

        {/* Withdraw Confirmation Modal */}
        {showWithdrawModal && (
            <div className="modal-overlay">
                <div className="confirm-modal">
                    <div className="modal-icon-wrapper">
                       <AlertCircle size={40} color="#FF9800" />
                    </div>
                    <h3>Are you sure you wanna withdraw?</h3>
                    <div className="confirm-actions">
                        <button className="confirm-btn no" onClick={() => setShowWithdrawModal(false)}>No</button>
                        <button className="confirm-btn yes" onClick={confirmWithdraw}>Yes</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const EmptyState = ({msg}: {msg:string}) => (
    <div className="empty-state"><Frown size={40} color="#ccc"/><p>{msg}</p></div>
);

export default MyBookings;