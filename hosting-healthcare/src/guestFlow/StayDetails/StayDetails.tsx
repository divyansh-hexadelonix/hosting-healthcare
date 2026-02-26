import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Wifi, Waves, BedDouble, Car, Cigarette, ChevronDown, ChevronUp, LayoutGrid, Check, X, Calendar, Wind, WashingMachine, UtensilsCrossed, ShoppingBasket, Bath } from 'lucide-react';
import ReviewModal from './ReviewModal'; 
import { useAuth } from '../../assets/AuthContext';
import './StayDetails.css';

interface BlockedRange {
  type: 'booked' | 'unavailable';
  start: Date;
  end: Date;
}

const parseFlexDate = (s: string): Date | null => {
  if (!s) return null;
  try {
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    if (parts[0].length === 4) return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  } catch { return null; }
};

const getBlockedRanges = (hotelName: string): BlockedRange[] => {
  const ranges: BlockedRange[] = [];
  try {
    const requests: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    requests.forEach((r) => {
      if (r.property !== hotelName) return;
      if ((r.status || '').toLowerCase() !== 'accepted') return;
      const s = parseFlexDate(r.moveIn);
      const e = parseFlexDate(r.moveOut);
      if (s && e) {
        s.setHours(0, 0, 0, 0);
        e.setHours(0, 0, 0, 0);
        ranges.push({ type: 'booked', start: s, end: e });
      }
    });
  } catch {}
  try {
    const overrides: Record<string, any> = JSON.parse(localStorage.getItem('hh_property_overrides') || '{}');
    if (overrides[hotelName]?.blockedDates) {
      Object.keys(overrides[hotelName].blockedDates).forEach((dateStr) => {
        if (overrides[hotelName].blockedDates[dateStr] === 'Unavailable') {
          const d = parseFlexDate(dateStr);
          if (d) {
            d.setHours(0, 0, 0, 0);
            ranges.push({ type: 'unavailable', start: d, end: d });
          }
        }
      });
    }
  } catch {}
  return ranges;
};

const isDateBlocked = (date: Date, ranges: BlockedRange[]): BlockedRange | null => {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  return ranges.find((r) => d >= r.start && d <= r.end) || null;
};

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  ac: Wind,
  laundry: WashingMachine,
  kitchen: UtensilsCrossed,
  kitchen_essentials: ShoppingBasket,
  washroom: Bath,
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wifi",
  parking: "Free Parking",
  ac: "Air Conditioner",
  laundry: "Laundry",
  kitchen: "Kitchen",
  kitchen_essentials: "Kitchen Essential",
  washroom: "Washroom Essential",
};

// StayDetails Component

const StayDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, sendBookingRequest, properties } = useAuth(); 
  const { propertyId } = location.state || {};

  const property = properties.find(p => p.id === propertyId);

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

  // Blocked ranges from MyListing's status engine
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);

  useEffect(() => {
    if (property?.propertyName) {
      setBlockedRanges(getBlockedRanges(property.propertyName));
    }
    const handler = () => {
      if (property?.propertyName) setBlockedRanges(getBlockedRanges(property.propertyName));
    };
    window.addEventListener('hh_requests_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('hh_requests_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, [property?.propertyName]);

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

    // Don't allow clicking blocked dates
    const blocked = isDateBlocked(clickedDate, blockedRanges);
    if (blocked) return;

    // Don't allow past dates
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;

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
    setIsMonthDropdownOpen(false);
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
    let start = checkInDate;
    let end = checkOutDate;
    if (start > end) [start, end] = [end, start];
    setBookingForm({ ...bookingForm, checkIn: formatDate(start), checkOut: formatDate(end) });
    setIsCalendarOpen(false);
    setIsMonthDropdownOpen(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [propertyId, property, navigate]);

  const currentRating = useMemo(() => {
    if (reviews.length === 0) return property?.rating || 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews, property]);

  const handleMessageHost = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate('/inbox', {
      state: {
        openConvWith: property?.hostEmail,
        hostName: property?.hostName,
        hostAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      }
    });
  };

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
    const sharedBookingId = 'BK-' + Date.now();
    const newRequest = {
      id: sharedBookingId,
      guestName: user?.name || 'Guest User',
      avatar: user?.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg',
      moveIn: bookingForm.checkIn,
      moveOut: bookingForm.checkOut,
      property: property?.propertyName || '',
      status: 'Pending',
      hostName: property?.hostName || '',
      hostEmail: property?.hostEmail || '',
      timestamp: new Date().toISOString(),
      guestFacilityName: bookingForm.facilityName,
      guestContactName: bookingForm.contactName,
      guestContactNumber: bookingForm.contactNumber,
    };
    const existingRequests = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    localStorage.setItem('hh_host_requests', JSON.stringify([newRequest, ...existingRequests]));
    window.dispatchEvent(new Event('hh_requests_updated'));
    sendBookingRequest({
      bookingId: sharedBookingId,
      propertyId: property?.id || 0,
      propertyName: property?.propertyName || '',
      image: property?.image || '',
      city: property?.city || '',
      checkInDate: bookingForm.checkIn,
      checkOutDate: bookingForm.checkOut,
      price: property?.price || ''
    });
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
      navigate('/my-bookings'); 
    }, 1250);
  };

  const handleShowAllPhotos = () => {
    if (property) navigate('/gallery', { state: { propertyId: property.id } });
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

  if (!property) return <div className="loading-container">Loading property details...</div>;

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="details-page-container">
      <div className="details-header">
        <h1 className="details-title">{property.propertyName}</h1>
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
            <h2>{property.propertyName}, {property.city}</h2>
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
            <button className="message-host-btn" onClick={handleMessageHost}>Message Host</button>
          </div>
          <hr className="divider" />
          <div className="about-section"><h3>About this place</h3><p>{property.propertyDescription || "No description available for this property."}</p></div>
          <hr className="divider" />
          <div className="amenities-section">
            <h3>What this place offers</h3>
            <div className="amenities-grid">
              {(property.propertyOffers || []).map(key => {
                const Icon = AMENITY_ICONS[key];
                const label = AMENITY_LABELS[key];
                if (!Icon) return null;
                return (
                  <div key={key} className="amenity-item"><Icon size={20}/> {label}</div>
                );
              })}
              {(!property.propertyOffers || property.propertyOffers.length === 0) && <div className="amenity-item">No amenities listed</div>}
            </div>
          </div>
          <hr className="divider" />
          <div className="map-section">
            <h3>Where you will be</h3>
            <div className="map-placeholder">
              <img src="https://mt1.google.com/vt/lyrs=m&x=131&y=131&z=8" alt="Map" className="map-img"/>
              <button className="view-map-btn">View larger map</button>
            </div>
            <h4>{property.city}, {property.state}, {property.country}</h4>
            <p className="map-desc">Located on {property.propertyAddress}, Zip Code: {property.zipCode}.</p>
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
                        <Star size={12} fill="#FFC107" color="none"/>
                        <span>({review.rating})</span>
                      </div>
                    </div>
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

      {/* --- SUCCESS POPUP --- */}
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
              <div className="legend-item"><span className="dot orange"></span> Booked</div>
              <div className="legend-item"><span className="dot green"></span> Selected</div>
            </div>

            {/* Month Selector */}
            <div
              className="calendar-month-selector"
              style={{position: 'relative', cursor: 'pointer'}}
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
            >
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
                    <div
                      key={m}
                      onClick={() => handleMonthSelect(i)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: viewDate.getMonth() === i ? '#f0f0f0' : 'white',
                        color: '#333'
                      }}
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
                if (dayObj.type === 'prev' || dayObj.type === 'next') {
                  return <div key={index} className="calendar-day faded">{dayObj.day}</div>;
                }

                const d = dayObj.date!;
                const isPast = d < today;
                const blockedRange = isDateBlocked(d, blockedRanges);
                const isSelected = checkInDate && d.getTime() === checkInDate.getTime();
                const isSelectedEnd = checkOutDate && d.getTime() === checkOutDate.getTime();
                const isInRange = checkInDate && checkOutDate && d > checkInDate && d < checkOutDate;

                let cls = "sd-calendar-day";
                let title = "";

                if (blockedRange?.type === 'booked') {
                  if (isPast) {
                    cls += " cal-booked-past";
                    title = "Past Booking";
                  } else {
                    cls += " cal-booked-range";
                    title = "Already Booked";
                  }
                } else if (isPast) {
                  cls += " past";
                } else if (blockedRange?.type === 'unavailable') {
                  cls += " cal-unavailable";
                  title = "Unavailable";
                } else if (isSelected || isSelectedEnd) {
                  cls += " booked"; 
                } else if (isInRange) {
                  cls += " booked";
                } else {
                  cls += " available";
                }

                return (
                  <div
                    key={index}
                    className={cls}
                    title={title}
                    onClick={() => handleDateClick(dayObj)}
                    style={cls.includes('cal-booked-past') ? { backgroundColor: 'rgba(255, 165, 0, 0.5)', cursor: 'not-allowed', color: '#fff' } : {}}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
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