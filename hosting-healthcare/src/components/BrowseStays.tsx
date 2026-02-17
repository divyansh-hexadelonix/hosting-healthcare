import React, { useState, ChangeEvent, useEffect, MouseEvent } from 'react'
import { MapPin, Calendar, SlidersHorizontal, Search, X, Building2, Home, Banknote, Users, Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './assets/AuthContext';
import './BrowseStays.css';
import { propertiesData as properties } from './data/propertiesData';


function BrowseStays() {
  const navigate = useNavigate();
  const { user, isAuthenticated, toggleWishlist } = useAuth(); 
  
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkInDate: '',
    checkOutDate: '',
  });
  const [filters, setFilters] = useState({
    hotel: false,
    villa: false,
    priceBelow: false,
    priceAbove: false,
    couples: false,
    family: false,
  });

  const [localReviews, setLocalReviews] = useState<Record<string, any[]>>({});

  const isFilterActive = Object.values(filters).some(value => value === true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedReviews = localStorage.getItem('hh_reviews');
    if (savedReviews) {
      try {
        setLocalReviews(JSON.parse(savedReviews));
      } catch (error) {
        console.error("Failed to parse reviews from local storage", error);
      }
    }
  }, []);

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-'); // Standard date input format is YYYY-MM-DD
    return `${month}/${day}/${year}`;
  };

  const handleCheckInDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCheckInDate(e.target.value);
  };

  const handleCheckOutDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCheckOutDate(e.target.value);
  };

  const handleSearch = (): void => {
    // Optional: make search fields required
    // if (!location) { alert('Please enter a location'); return; }

    const searchData = {
      location,
      checkInDate: checkInDate ? formatDateDisplay(checkInDate) : '',
      checkOutDate: checkOutDate ? formatDateDisplay(checkOutDate) : '',
    };

    setSearchParams(searchData);
  };

  // --- NEW FUNCTION: Handle Wishlist Click ---
  const handleWishlistClick = (e: MouseEvent, propertyId: number) => {
    e.stopPropagation(); // Prevents triggering the main card click

    if (!isAuthenticated) {
      navigate('/login');
    } else {
      toggleWishlist(propertyId.toString());
    }
  };

  // --- UPDATED FUNCTION: Handle Main Card Click ---
  const handlePropertyClick = (property: any): void => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Navigate to stay details page with data
    navigate('/stay-details', {
      state: {
        propertyId: property.id,
        // Pass other relevant data if needed by the details page quickly
        // propertyData: property 
      }
    });
    
    console.log('Navigating to details for:', property.hotelName);
  };

  const handleFilterToggle = (): void => {
    setShowFilterModal(!showFilterModal);
  };

  const handleFilterCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    
    if (name === 'priceBelow' && checked) {
      setFilters(prevFilters => ({ ...prevFilters, priceBelow: true, priceAbove: false }));
    } else if (name === 'priceAbove' && checked) {
      setFilters(prevFilters => ({ ...prevFilters, priceBelow: false, priceAbove: true }));
    } else {
      setFilters(prevFilters => ({ ...prevFilters, [name]: checked }));
    }
  };

  const applyFilters = (): void => {
    setShowFilterModal(false);
  };

  const clearFilters = (): void => {
    setFilters({
      hotel: false,
      villa: false,
      priceBelow: false,
      priceAbove: false,
      couples: false,
      family: false,
    });
  };


  const filteredProperties = properties.filter((property) => {
    // Location Filtering
    const cityMatch = searchParams.location 
      ? property.city.toLowerCase().includes(searchParams.location.toLowerCase())
      : true;

    if (!cityMatch) return false;

    // Check Filters
    const hasFilters = Object.values(filters).some(value => value);
    if (!hasFilters) return true;
    
    const typeMatch = 
      (filters.hotel && property.type === 'hotel') ||
      (filters.villa && property.type === 'villa') ||
      (!filters.hotel && !filters.villa);

    const capacityMatch =
      (filters.couples && property.capacity.includes('Couples')) ||
      (filters.family && property.capacity.includes('Family')) ||
      (!filters.couples && !filters.family);

    const priceValue = parseInt(property.price.replace(/[₹,]/g, ''));
    let priceMatch = true;
    if (filters.priceBelow) priceMatch = priceValue <= 5000;
    else if (filters.priceAbove) priceMatch = priceValue >= 5000;

    return typeMatch && capacityMatch && priceMatch;
  });

  return (
    <div className='browse-container'>
      {/* ... Search Bar Section (Unchanged) ... */}
       <div className='search-bar-section'>
        <div className='search-bar-wrapper'>

          <div className='search-input-group'>
            <label className='search-label'>Where are you going ? <MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></label>
            <input
              type='text'
              className='search-input'
              placeholder='Search destinations...'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Check-in Date */}
          <div className='search-input-group check-date-group'>
            <label className='search-label'>Check in date</label>
            <div className='date-input-wrapper'>
              <input
                type='date'
                className='search-input date-input'
                value={checkInDate}
                onChange={handleCheckInDateChange}
              />
              <span className='calendar-icon'><Calendar size={18} /></span>
            </div>
          </div>

          {/* Check-out Date */}
          <div className='search-input-group check-date-group'>
            <label className='search-label'>Check out date</label>
            <div className='date-input-wrapper'>
              <input
                type='date'
                className='search-input date-input'
                value={checkOutDate}
                onChange={handleCheckOutDateChange}
              />
              <span className='calendar-icon'><Calendar size={18} /></span>
            </div>
          </div>

          <button 
            className={`filter-btn ${isFilterActive ? 'active' : ''}`} 
            onClick={handleFilterToggle}
          >
            <SlidersHorizontal size={18} /> Filter
          </button>

          <button className='search-btn' onClick={handleSearch}>
            <Search size={18} /> Search
          </button>
        </div>
      </div>

      {/* ... Filter Modal (Unchanged) ... */}
       {showFilterModal && (
        <div className='filter-modal-overlay' onClick={() => setShowFilterModal(false)}>
          <div className='filter-modal' onClick={(e) => e.stopPropagation()}>
            <div className='filter-modal-header'>
              <h2>Filter Stays</h2>
              <button className='close-btn' onClick={() => setShowFilterModal(false)}><X size={24} /></button>
            </div>

            <div className='filter-modal-content'>
          
              <div className='filter-section'>
                <h3 className='filter-section-title'>Property Type</h3>
                <div className='checkbox-group'>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='hotel'
                      checked={filters.hotel}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span><Building2 size={16} /> Hotels</span>
                  </label>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='villa'
                      checked={filters.villa}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span><Home size={16} /> Villa</span>
                  </label>
                </div>
              </div>

              {/* Price Section */}
              <div className='filter-section'>
                <h3 className='filter-section-title'>Price Range</h3>
                <div className='checkbox-group'>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='priceBelow'
                      checked={filters.priceBelow}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span><Banknote size={16} /> Below $5,000</span>
                  </label>

                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='priceAbove'
                      checked={filters.priceAbove}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span><Banknote size={16} /> Above $5,000</span>
                  </label>
                </div>
              </div>

              <div className='filter-section'>
                <h3 className='filter-section-title'>Guest Type</h3>
                <div className='checkbox-group'>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='couples'
                      checked={filters.couples}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span><Users size={16} /> Couples</span>
                  </label>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='family'
                      checked={filters.family}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span><Users size={16} /> Family</span>
                  </label>
                </div>
              </div>
            </div>

            <div className='filter-modal-footer'>
              <button className='clear-filters-btn' onClick={clearFilters}>
                Clear All
              </button>
              <button className='apply-filters-btn' onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='browse-header'>
        <h1>Explore Amazing Stays</h1>
        <p>Discover the perfect accommodation for your next getaway</p>
      </div>

      {/* ... Search Info Bar (Unchanged) ... */}
      {searchParams.location && (
        <div className='search-info-bar'>
          <div className='search-info-content'>
            <span className='search-info-item'>
              <strong>Location:</strong> {searchParams.location}
            </span>
            {/* Only show dates if selected */}
            {searchParams.checkInDate && (
               <span className='search-info-item'>
               <strong>Check-in:</strong> {searchParams.checkInDate}
             </span>
            )}
             {searchParams.checkOutDate && (
            <span className='search-info-item'>
              <strong>Check-out:</strong> {searchParams.checkOutDate}
            </span>
             )}
            <button className='clear-search-btn' onClick={() => {
              setSearchParams({ location: '', checkInDate: '', checkOutDate: '' });
              setLocation('');
              setCheckInDate('');
              setCheckOutDate('');
            }}>
              Clear Search
            </button>
          </div>
        </div>
      )}

      {/* === UPDATED PROPERTIES GRID === */}
      {filteredProperties.length > 0 ? (
        <div className='properties-grid'>
          {filteredProperties.map((property) => {
             // Check if this property is in the logged-in user's wishlist
             const isWishlisted = user?.wishlist?.includes(property.id.toString());

             // Calculate dynamic rating and reviews count
             const propertyReviews = localReviews[property.id] || [];
             const allReviews = [...propertyReviews, ...(property.reviewsList || [])];
             const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
             const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : property.rating;
             const reviewCount = allReviews.length > 0 ? allReviews.length : property.reviews;

             return (
            <div 
              key={property.id} 
              className='property-card'
              onClick={() => handlePropertyClick(property)}
            >
              <div className='property-image-container'>
                <img 
                  src={property.image} 
                  alt={property.hotelName}
                  className='property-image'
                />
                {/* Removed Badge */}
                
                {/* Added Wishlist Heart Button */}
                <button 
                  className="wishlist-button"
                  onClick={(e) => handleWishlistClick(e, property.id)}
                >
                  <Heart 
                    size={24} 
                    color={isWishlisted ? "#FF385C" : "#333"} 
                    fill={isWishlisted ? "#FF385C" : "transparent"} 
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              <div className='property-content'>
                {/* Re-arranged content for cleaner look */}
                <div className="property-header-row">
                   <h3 className='property-title'>{property.hotelName}</h3>
                   <div className='price-container-inline'>
                      <span className='price-amount'>{property.price}</span>
                      <span className='price-label'>/night</span>
                   </div>
                </div>
                
                <div className='property-location'>
                  <MapPin size={14} color="#777" />
                  <span className='city-text'>{property.city}</span>
                </div>

                 <div className='property-meta'>
                   <span className='meta-value'>{property.capacity}</span>
                 </div>

                <div className='rating-review-container'>
                  <div className='property-rating'>
                    <span className='star'><Star size={14} fill="currentColor" /></span>
                    <span className='rating-value'>{avgRating}</span>
                  </div>
                  <span className='reviews-dot'>•</span>
                  <div className='property-reviews'>
                    <span className='reviews-count'>{reviewCount} reviews</span>
                  </div>
                </div>

                {/* Removed Footer and Pre-book button */}
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className='no-data-container' style={{textAlign: 'center', padding: '40px'}}>
            <h2>No Properties Found</h2>
            <p>Try adjusting your search or filters.</p>
            <button 
              className='new-search-btn clear-search-btn' // reusing style
              style={{margin: '20px auto', display: 'block'}}
              onClick={() => {
                setSearchParams({ location: '', checkInDate: '', checkOutDate: '' });
                setLocation('');
                setCheckInDate('');
                setCheckOutDate('');
                clearFilters();
              }}
            >
              Show All Properties
            </button>
        </div>
      )}
    </div>
  );
}

export default BrowseStays;