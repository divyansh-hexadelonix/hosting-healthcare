import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Wifi, Waves, BedDouble, Car, Cigarette, ChevronDown, LayoutGrid, Check } from 'lucide-react';
import { propertiesData } from '../data/propertiesData';
import ReviewModal from './ReviewModal'; 
import { useAuth } from '../assets/AuthContext';
import './StayDetails.css';

const StayDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get user info and functions from context
  const { user, isAuthenticated, sendBookingRequest } = useAuth(); 
  const { propertyId } = location.state || {};

  const property = propertiesData.find(p => p.id === propertyId);

  // State for Reviews & Modal
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('hh_reviews');
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : {};
    const propertyReviews = parsedReviews[propertyId] || [];
    return [...propertyReviews, ...(property?.reviewsList || [])];
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // State for Success Popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Booking Form State 
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    facilityName: '',
    contactName: '',
    contactNumber: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [propertyId, property, navigate]);

  const currentRating = useMemo(() => {
    if (reviews.length === 0) return property?.rating || 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews, property]);

  if (!property) return <div className="loading-container">Loading property details...</div>;

  // Booking Logic
  const handleBookRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
        alert("Please login to send a request.");
        navigate('/login');
        return;
    }

    if (!bookingForm.checkIn || !bookingForm.checkOut) {
        alert("Please select check-in and check-out dates.");
        return;
    }

    // Call the function from AuthContext to save this request
    sendBookingRequest({
        propertyId: property.id,
        hotelName: property.hotelName,
        image: property.image,
        city: property.city,
        checkInDate: bookingForm.checkIn,
        checkOutDate: bookingForm.checkOut,
        price: property.price
    });

    setShowSuccessPopup(true);

    // Auto-close and redirect after 1.25s
    setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/my-bookings'); 
    }, 1250);
  };

  const handleShowAllPhotos = () => {
    navigate('/gallery', { 
      state: { propertyId: property.id } 
    });
  };

  // Review Logic with User Auth Data
  const handleReviewSubmit = (rating: number, text: string) => {
    const reviewerName = user?.name || "Guest User";
    const reviewerImage = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=random`;

    const newReview = {
      id: Date.now(),
      name: reviewerName, 
      rating: rating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      text: text,
      img: reviewerImage
    };

    setReviews([newReview, ...reviews]);

    const savedReviews = localStorage.getItem('hh_reviews');
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : {};
    const existingPropertyReviews = parsedReviews[propertyId] || [];
    parsedReviews[propertyId] = [newReview, ...existingPropertyReviews];
    localStorage.setItem('hh_reviews', JSON.stringify(parsedReviews));

    setIsReviewModalOpen(false);
  };

  return (
    <div className="details-page-container">
      
      <div className="details-header">
        <h1 className="details-title">{property.hotelName}</h1>
      </div>

      {/* Photo Grid */}
      <div className="photo-grid">
        <div className="photo-main">
            <img src={property.image} alt="Main View" />
        </div>
        <div className="photo-secondary">
            <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Room View" />
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kitchen" />
            <img src="https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Living Area" />
            <div className="photo-overlay-container">
                <img src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Exterior" />
            </div>
        </div>
        
        <button className="show-photos-btn" onClick={handleShowAllPhotos}>
            <span className="grid-icon"><LayoutGrid size={16} /></span> Show all photos
        </button>
      </div>

      <div className="details-content-wrapper">
        
        <div className="details-left-col">
            <div className="property-subtitle-section">
                <h2>{property.hotelName}, {property.city}</h2>
                <div className="rating-row">
                    <Star size={16} fill="#FFC107" color="#FFC107"/>
                    <span><b>{currentRating}</b> · {reviews.length} reviews</span>
                </div>
            </div>

            <hr className="divider" />

            <div className="host-section">
                <div className="host-info">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Host" className="host-avatar" />
                    <div>
                        <h3 className="host-name">David Beckham</h3>
                        <span className="host-badge">Host</span>
                    </div>
                </div>
                <button className="message-host-btn">Message Host</button>
            </div>

            <hr className="divider" />

            <div className="about-section">
                <h3>About this place</h3>
                <p>Come and stay in this superb Grand Canyon Horseshoe Bend, in the heart of the historic center of Bordeaux. Spacious and bright, in a real Bordeaux building in exposed stone, you will enjoy all the charms of the city thanks to its ideal location. Close to many shops, bars and restaurants, you can access the apartment by tram A and C and bus routes 27 and 44.</p>
            </div>

            <hr className="divider" />

            <div className="amenities-section">
                <h3>What this place offers</h3>
                <div className="amenities-grid">
                    <div className="amenity-item"><Wifi size={20}/> Fast wifi - 100 Mbps</div>
                    <div className="amenity-item"><Waves size={20}/> Swimming Pool</div>
                    <div className="amenity-item"><BedDouble size={20}/> Double Bed</div>
                    <div className="amenity-item"><Car size={20}/> Free Parking</div>
                    <div className="amenity-item"><Cigarette size={20}/> Smoking room</div>
                </div>
            </div>

            <hr className="divider" />

            <div className="map-section">
                <h3>Where you will be</h3>
                <div className="map-placeholder">
                    <img src="https://mt1.google.com/vt/lyrs=m&x=131&y=131&z=8" alt="Map Placeholder" className="map-img"/>
                    <button className="view-map-btn">View larger map</button>
                </div>
                <h4>{property.city}, United States</h4>
                <p className="map-desc">Located on a quiet suburban street.</p>
            </div>

            <hr className="divider" />

            <div className="reviews-section">
                <h3>Ratings & Reviews</h3>
                <div className="reviews-grid">
                    {reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <img src={review.img} alt={review.name} />
                                <div>
                                    <h4>{review.name}</h4>
                                    <div className="review-stars">
                                       {[...Array(5)].map((_, i) => (
                                         <Star key={i} size={12} fill={i < Math.floor(review.rating) ? "#FFC107" : "#eee"} color="none"/>
                                       ))}
                                       <span style={{marginLeft:'4px', fontSize:'12px', color:'#777'}}>{review.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="review-text">{review.text}</p>
                        </div>
                    ))}
                </div>
                <div className="reviews-actions">
                     <button className="see-all-reviews">See All Reviews <ChevronDown size={16}/></button>
                     <button 
                        className="write-review-btn" 
                        onClick={() => setIsReviewModalOpen(true)}
                     >
                        Write a Review
                     </button>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN - Booking Widget */}
        <div className="details-right-col">
            <div className="booking-card">
                <div className="booking-header">
                    <span className="booking-price">{property.price}</span>
                    <span className="booking-period">/ night</span>
                </div>

                <div className="booking-form" onSubmit={handleBookRequest}>
                    {/* Date Picker Inputs */}
                    <div className="date-picker-trigger" style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                        <div style={{flex:1}}>
                             <label className="booking-input-label">Check-in</label>
                             <input 
                               type="date" 
                               className="date-input-field" 
                               value={bookingForm.checkIn} 
                               onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})} 
                             />
                        </div>
                        <div style={{flex:1}}>
                             <label className="booking-input-label">Check-out</label>
                             <input 
                               type="date" 
                               className="date-input-field" 
                               value={bookingForm.checkOut} 
                               onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})} 
                             />
                        </div>
                    </div>

                    <label className="booking-label">Enter Facility Details:</label>
                    
                    <div className="input-group">
                        <label>Name of the Facility</label>
                        <input type="text" placeholder="Enter Name of Facility" value={bookingForm.facilityName} onChange={(e) => setBookingForm({...bookingForm, facilityName: e.target.value})} />
                    </div>

                    <div className="input-group">
                        <label>Work Assignment Verification Contact Name</label>
                        <input type="text" placeholder="Daniel Thomas" value={bookingForm.contactName} onChange={(e) => setBookingForm({...bookingForm, contactName: e.target.value})} />
                    </div>

                    <div className="input-group">
                        <label>Work Assignment Verification Contact Number</label>
                        <input type="text" placeholder="000 000 0000" value={bookingForm.contactNumber} onChange={(e) => setBookingForm({...bookingForm, contactNumber: e.target.value})} />
                    </div>

                    <button className="send-request-btn" onClick={handleBookRequest}>
                        Send Request
                    </button>
                    
                    <p className="charge-note">You won't be charged yet</p>
                </div>
            </div>
        </div>

      </div>

      {/* --- RENDER MODAL --- */}
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        hostName="David Beckham"
      />

      {/* --- SUCCESS POPUP WIDGET --- */}
      {showSuccessPopup && (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <div className="success-icon-container">
                    <Check size={40} color="white" strokeWidth={3} />
                </div>
                <h3 className="success-title">Your Booking Request has<br/>been sent!</h3>
            </div>
        </div>
      )}

    </div>
  );
};

export default StayDetails;