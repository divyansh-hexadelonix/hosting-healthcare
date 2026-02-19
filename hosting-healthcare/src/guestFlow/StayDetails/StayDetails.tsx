import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Wifi, Waves, BedDouble, Car, Cigarette, ChevronDown, ChevronUp, LayoutGrid, Check, X, Calendar } from 'lucide-react';
import { propertiesData } from '../data/propertiesData';
import ReviewModal from './ReviewModal'; 
import { useAuth } from '../../assets/AuthContext';
import './StayDetails.css';

const StayDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, sendBookingRequest } = useAuth(); 
  const { propertyId } = location.state || {};

  const property = propertiesData.find(p => p.id === propertyId);

  // --- REVIEWS STATE ---
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('hh_reviews');
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : {};
    const propertyReviews = parsedReviews[propertyId] || [];
    return [...propertyReviews, ...(property?.reviewsList || [])];
  });
  
  // --- MODAL STATES ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); 

  // --- BOOKING FORM STATE ---
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    facilityName: '',
    contactName: '',
    contactNumber: ''
  });

  // --- CALENDAR LOGIC ---
  const [viewDate, setViewDate] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    for (let i = startOffset - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, type: 'prev', date: null });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, type: 'current', date: new Date(year, month, i) });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, type: 'next', date: null });
    }
    
    return days;
  }, [viewDate]);

  const handleDateClick = (dayObj: any) => {
    if (dayObj.type !== 'current' || !dayObj.date) return;
    
    const clickedDate = dayObj.date;
    
    if (!checkInDate || (checkInDate && checkOutDate)) {
        setCheckInDate(clickedDate);
        setCheckOutDate(null);
        return;
    }

    if (clickedDate.getTime() === checkInDate.getTime()) {
        setCheckInDate(null);
        return;
    }

    if (clickedDate < checkInDate) {
        setCheckInDate(clickedDate);
    } else {
        setCheckOutDate(clickedDate);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);
    setIsMonthDropdownOpen(false);
  };

  const handleOpenCalendar = () => {
    if (bookingForm.checkIn) {
        const [d, m, y] = bookingForm.checkIn.split('-').map(Number);
        setCheckInDate(new Date(y, m - 1, d));
    } else {
        setCheckInDate(null);
    }
    if (bookingForm.checkOut) {
        const [d, m, y] = bookingForm.checkOut.split('-').map(Number);
        setCheckOutDate(new Date(y, m - 1, d));
    } else {
        setCheckOutDate(null);
    }
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    if (!checkInDate && !checkOutDate) {
         setBookingForm(prev => ({ ...prev, checkIn: '', checkOut: '' }));
    }

    setCheckInDate(null);
    setCheckOutDate(null);
    setIsCalendarOpen(false);
  };

  const handleCalendarContinue = () => {
    if (!checkInDate || !checkOutDate) {
        alert("Please select a check-in and check-out date.");
        return;
    }

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    let startStr = '';
    let endStr = '';

    let start = checkInDate;
    let end = checkOutDate;
    if (start > end) {
        [start, end] = [end, start];
    }
    startStr = formatDate(start);
    endStr = formatDate(end);

    setBookingForm({
        ...bookingForm,
        checkIn: startStr,
        checkOut: endStr
    });
    setIsCalendarOpen(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [propertyId, property, navigate]);

  const currentRating = useMemo(() => {
    if (reviews.length === 0) return property?.rating || 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews, property]);

  if (!property) return <div className="loading-container">Loading property details...</div>;

  const handleBookRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
        alert("Please login to send a request.");
        navigate('/login');
        return;
    }
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
        alert("Please select dates using the calendar.");
        return;
    }
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
    setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/my-bookings'); 
    }, 1250);
  };

  const handleShowAllPhotos = () => {
    navigate('/gallery', { state: { propertyId: property.id } });
  };

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

      <div className="photo-grid">
        <div className="photo-main"><img src={property.image} alt="Main View" /></div>
        <div className="photo-secondary">
            <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="1" />
            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="2" />
            <img src="https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="3" />
            <div className="photo-overlay-container">
                <img src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="4" />
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
                    <div><h3 className="host-name">David Beckham</h3><span className="host-badge">Host</span></div>
                </div>
                <button className="message-host-btn">Message Host</button>
            </div>
            <hr className="divider" />
            <div className="about-section"><h3>About this place</h3><p>Come and stay in this superb Grand Canyon Horseshoe Bend...</p></div>
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
                <div className="map-placeholder"><img src="https://mt1.google.com/vt/lyrs=m&x=131&y=131&z=8" alt="Map" className="map-img"/><button className="view-map-btn">View larger map</button></div>
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
                                <div><h4>{review.name}</h4><div className="review-stars"><Star size={12} fill="#FFC107" color="none"/><span>({review.rating})</span></div></div>
                            </div>
                            <p className="review-text">{review.text}</p>
                        </div>
                    ))}
                </div>
                <div className="reviews-actions">
                     <button className="see-all-reviews">See All Reviews <ChevronDown size={16}/></button>
                     <button className="write-review-btn" onClick={() => setIsReviewModalOpen(true)}>Write a Review</button>
                </div>
            </div>
        </div>

        <div className="details-right-col">
            <div className="booking-card">
                <div className="booking-header">
                    <span className="booking-price">{property.price}</span>
                    <span className="booking-period">/ night</span>
                </div>

                <div className="booking-form" onSubmit={handleBookRequest}>
                    {/* TRIGGER FOR CUSTOM CALENDAR */}
                    <div className="date-picker-trigger" style={{marginBottom: '20px'}}>
                         <label className="booking-input-label">Select Date</label>
                         <div className="fake-input" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <span>
                                {bookingForm.checkIn || bookingForm.checkOut 
                                    ? `${bookingForm.checkIn} - ${bookingForm.checkOut}` 
                                    : 'Move-in - Move-out'}
                            </span>
                            <Calendar size={20} onClick={handleOpenCalendar} style={{cursor: 'pointer'}} />
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

                    <button className="send-request-btn" onClick={handleBookRequest}>Send Request</button>
                    <p className="charge-note">You won't be charged yet</p>
                </div>
            </div>
        </div>
      </div>

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

      {/* --- CUSTOM CALENDAR MODAL --- */}
      {isCalendarOpen && (
        <div className="calendar-modal-overlay">
            <div className="calendar-modal">
                <div className="calendar-header">
                    <h3>Property Availability</h3>
                    <button className="calendar-close-btn" onClick={handleCloseCalendar}><X size={24}/></button>
                </div>
                
                <div className="calendar-legend">
                    <div className="legend-item"><span className="dot purple"></span> Available</div>
                    <div className="legend-item"><span className="dot red"></span> Unavailable</div>
                    <div className="legend-item"><span className="dot green"></span> Book</div>
                </div>

                {/* Month Selector */}
                <div className="calendar-month-selector" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}>
                    <span>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span> 
                    {isMonthDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    
                    {isMonthDropdownOpen && (
                        <div className="month-dropdown" style={{
                            position: 'absolute', top: '100%', left: '0', background: 'white', 
                            border: '1px solid #ddd', borderRadius: '8px', zIndex: 10, 
                            maxHeight: '200px', overflowY: 'auto', width: '100%', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left'
                        }} onClick={(e) => e.stopPropagation()}>
                            {months.map((m, i) => (
                                <div key={m} 
                                    onClick={() => handleMonthSelect(i)}
                                    style={{padding: '8px 12px', cursor: 'pointer', backgroundColor: viewDate.getMonth() === i ? '#f0f0f0' : 'white', color: '#333'}}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Days Header */}
                <div className="calendar-days-header">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

                {/* Date Grid */}
                <div className="calendar-grid">
                    {calendarDays.map((dayObj, index) => {
                        let className = "calendar-day";
                        if (dayObj.type === 'prev' || dayObj.type === 'next') className += " faded";
                        else if (dayObj.type === 'current') {
                            const d = dayObj.date;
                            if (d) {
                                if (checkInDate && d.getTime() === checkInDate.getTime()) className += " booked";
                                else if (checkOutDate && d.getTime() === checkOutDate.getTime()) className += " booked";
                                else if (checkInDate && checkOutDate && d > checkInDate && d < checkOutDate) className += " booked";
                                else className += " available";
                            }
                        }
                        
                        return (
                            <div 
                                key={index} 
                                className={className}
                                onClick={() => handleDateClick(dayObj)}
                            >
                                {dayObj.day}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="calendar-footer">
                    <button className="cal-btn cancel" onClick={handleCloseCalendar}>Cancel</button>
                    <button className="cal-btn continue" onClick={handleCalendarContinue}>Continue</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default StayDetails;