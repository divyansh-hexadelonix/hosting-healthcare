import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Frown, AlertCircle, Heart, Star, Clock, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import { useAuth } from '../assets/AuthContext';
import { propertiesData } from '../data/propertiesData';
import './MyBookings.css';

type TabType = 'upcoming' | 'sent' | 'cancelled';

type RequestStatus = 'Pending' | 'Accepted' | 'Rejected';

const getRequestStatus = (
  bookingId: string,
  hotelName: string,
  guestName: string
): RequestStatus => {
  try {
    // 1. Check guest notifications first — most authoritative (keyed by bookingId)
    const notifs: any[] = JSON.parse(localStorage.getItem('hh_guest_notifications') || '[]');
    const notif = notifs.find(n => n.bookingId === bookingId);
    if (notif) return notif.type === 'accepted' ? 'Accepted' : 'Rejected';

    // 2. Fall back to hh_host_requests — match by exact bookingId (id field)
    const hostReqs: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    const match = hostReqs.find(r => String(r.id) === String(bookingId));
    if (match) return match.status === 'Accepted' ? 'Accepted' : 'Pending';

    return 'Pending';
  } catch { return 'Pending'; }
};

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, withdrawBookingRequest, toggleWishlist } = useAuth();

  // Allow navigating to a specific tab via router state
  const defaultTab = (location.state as any)?.defaultTab as TabType | undefined;
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab || 'upcoming');

  // Track live status of each sent request
  const [requestStatuses, setRequestStatuses] = useState<Record<string, RequestStatus>>({});
  
  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<string | null>(null);

  // Cancel Booking Modal State (for accepted bookings)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

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

  // Reload request statuses whenever hh_host_requests or hh_guest_notifications change
  useEffect(() => {
    const loadStatuses = () => {
      if (!user) return;
      const statuses: Record<string, RequestStatus> = {};
      (user.sentRequests || []).forEach(req => {
        statuses[req.bookingId] = getRequestStatus(req.bookingId, req.hotelName, user.name);
      });
      setRequestStatuses(statuses);
    };
    loadStatuses();
    window.addEventListener('hh_requests_updated', loadStatuses);
    window.addEventListener('hh_guest_notifications_updated', loadStatuses);
    window.addEventListener('storage', loadStatuses);
    return () => {
      window.removeEventListener('hh_requests_updated', loadStatuses);
      window.removeEventListener('hh_guest_notifications_updated', loadStatuses);
      window.removeEventListener('storage', loadStatuses);
    };
  }, [user]);

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

  const handleCancelBookingClick = (id: string) => {
      setCancelTargetId(id);
      setShowCancelModal(true);
  };

  const confirmCancelBooking = () => {
    if (!cancelTargetId || !user) return;

    const req = (user.sentRequests || []).find(r => r.bookingId === cancelTargetId);

    // 1. Remove from hh_host_requests (so it disappears from Upcoming Bookings tab)
    try {
      const hostReqs: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
      const updated = hostReqs.filter(r => String(r.id) !== String(cancelTargetId));
      localStorage.setItem('hh_host_requests', JSON.stringify(updated));
      window.dispatchEvent(new Event('hh_requests_updated'));
    } catch {}

    // 2. Write cancellation notification for the host
    try {
      if (req) {
        const hostReqs: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
        const hostReq = hostReqs.find(r => String(r.id) === String(cancelTargetId));
        const cancelNotifs: any[] = JSON.parse(localStorage.getItem('hh_host_cancel_notifications') || '[]');
        cancelNotifs.unshift({
          bookingId: cancelTargetId,
          guestName: user.name,
          guestAvatar: user.profileImage || '',
          hotelName: req.hotelName,
          hostEmail: hostReq?.hostEmail || 'david@gmail.com',
          hostName: hostReq?.hostName || 'David Beckham',
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('hh_host_cancel_notifications', JSON.stringify(cancelNotifs));
        window.dispatchEvent(new Event('hh_host_cancel_notifications_updated'));
      }
    } catch {}

    // 3. Move to cancelled tab in AuthContext (same as withdraw)
    withdrawBookingRequest(cancelTargetId);

    setShowCancelModal(false);
    setCancelTargetId(null);
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

                          {/*-- Status banner --*/}
                          {(() => {
                            const status = requestStatuses[req.bookingId] || 'Pending';
                            return (
                              <div className={`req-status-banner req-status-banner--${status.toLowerCase()}`}>
                                {status === 'Accepted' && <><CheckCircle2 size={14} /> Request accepted</>}
                                {status === 'Rejected' && <><XCircle size={14} /> Request rejected</>}
                                {status === 'Pending'  && <><Hourglass size={14} /> Pending review</>}
                              </div>
                            );
                          })()}

                          {/*-- Action button (changes based on status) --*/}
                          {(() => {
                            const status = requestStatuses[req.bookingId] || 'Pending';
                            if (status === 'Rejected') {
                              return (
                                <button className="action-btn withdraw-btn withdraw-btn--disabled" disabled>
                                  Withdraw Request
                                </button>
                              );
                            }
                            if (status === 'Accepted') {
                              return (
                                <button
                                  className="action-btn cancel-booking-btn"
                                  style={{ marginTop: 'auto' }}
                                  onClick={(e) => { e.stopPropagation(); handleCancelBookingClick(req.bookingId); }}
                                >
                                  Cancel Booking
                                </button>
                              );
                            }
                            // Pending
                            return (
                              <button
                                className="action-btn withdraw-btn"
                                style={{ marginTop: 'auto' }}
                                onClick={(e) => { e.stopPropagation(); handleWithdrawClick(req.bookingId); }}
                              >
                                Withdraw Request
                              </button>
                            );
                          })()}
                      </div>
                  </div>
              )})}
          </div>
      );
  };

  const renderCancelled = () => {
      const requests = user.cancelledRequests || [];

      return (
          <>
              <div className="cancelled-info-note">
                  <span className="info-icon"><Clock size={18}/></span>
                  <span>Cancelled requests are automatically removed after <strong>24 hours</strong>.</span>
              </div>
              {requests.length === 0 ? <EmptyState msg="No cancelled booking requests." /> : (
                  <div className="bookings-grid">
                      {requests.map(req => {
                          const p = propertiesData.find(prop => prop.id === req.propertyId);
                          const isWishlisted = user.wishlist?.includes(req.propertyId.toString());

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
                          );
                      })}
                  </div>
              )}
          </>
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

        {/* Cancel Booking Confirmation Modal */}
        {showCancelModal && (
            <div className="modal-overlay">
                <div className="confirm-modal">
                    <div className="modal-icon-wrapper">
                       <AlertCircle size={40} color="#ef4444" />
                    </div>
                    <h3>Cancel this booking?</h3>
                    <p className="confirm-modal-sub">The host will be notified of your cancellation.</p>
                    <div className="confirm-actions">
                        <button className="confirm-btn no" onClick={() => setShowCancelModal(false)}>No, Keep It</button>
                        <button className="confirm-btn yes confirm-btn--danger" onClick={confirmCancelBooking}>Yes, Cancel</button>
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