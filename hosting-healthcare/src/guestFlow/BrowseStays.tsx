import React, { useState, ChangeEvent, useEffect, MouseEvent } from 'react'
import { MapPin, Calendar, SlidersHorizontal, Search, X, Building2, Home, Banknote, Users, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../assets/AuthContext';
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

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of properties per page

  const isFilterActive = Object.values(filters).some(value => value === true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const savedReviews = localStorage.getItem('hh_reviews');
    if (savedReviews) {
      try {
        setLocalReviews(JSON.parse(savedReviews));
      } catch (error) {
        console.error("Failed to parse reviews", error);
      }
    }
  }, []);

  const handleSearch = () => {
    setSearchParams({ location, checkInDate, checkOutDate });
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const clearSearch = () => {
    setLocation('');
    setCheckInDate('');
    setCheckOutDate('');
    setSearchParams({ location: '', checkInDate: '', checkOutDate: '' });
    setCurrentPage(1);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.checked });
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({
      hotel: false,
      villa: false,
      priceBelow: false,
      priceAbove: false,
      couples: false,
      family: false,
    });
    setCurrentPage(1);
  };

  // --- FILTERING LOGIC ---
  const filteredProperties = properties.filter((property) => {
    // 1. Search Bar Filtering
    const searchLocationLower = searchParams.location.toLowerCase();
    const matchesSearch = searchParams.location === '' || 
      property.city.toLowerCase().includes(searchLocationLower) ||
      property.hotelName.toLowerCase().includes(searchLocationLower);

    // 2. Checkbox Filtering
    if (!isFilterActive) return matchesSearch;

    // Type Filter
    const matchesType = (filters.hotel && property.type === 'hotel') || 
                        (filters.villa && property.type === 'villa') || 
                        (!filters.hotel && !filters.villa);

    // Price Filter (Simple logic based on string check for demo)
    const priceVal = parseInt(property.price.replace(/[^0-9]/g, ''));
    const matchesPrice = (filters.priceBelow && priceVal < 4000) ||
                         (filters.priceAbove && priceVal >= 4000) ||
                         (!filters.priceBelow && !filters.priceAbove);

    // Capacity Filter
    const matchesCapacity = (filters.couples && property.capacity.includes('Couples')) ||
                            (filters.family && property.capacity.includes('Family')) ||
                            (!filters.couples && !filters.family);

    return matchesSearch && matchesType && matchesPrice && matchesCapacity;
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='browse-container'>
      
      {/* Search Bar Section */}
      <section className='search-bar-section'>
        <div className='search-bar-wrapper'>
          <div className='search-input-group'>
            <label className='search-label'>Where are you going?*</label>
            <div className='input-icon-wrapper'>
              <MapPin size={18} className='input-icon'/>
              <input 
                type="text" 
                placeholder="Location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className='search-input-group check-date-group'>
            <label className='search-label'>Move in date</label>
            <div className='input-icon-wrapper'>
              <input 
                type="date" 
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
          </div>

          <div className='search-input-group check-date-group'>
            <label className='search-label'>Move out date</label>
            <div className='input-icon-wrapper'>
              <input 
                type="date" 
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>

          <button className='filter-btn' onClick={() => setShowFilterModal(true)}>
            <SlidersHorizontal size={20} />
            <span className="filter-text">Filters</span>
            {isFilterActive && <span className="filter-badge"></span>}
          </button>

          <button className='search-btn' onClick={handleSearch}>
            <Search size={20} />
            Search
          </button>
        </div>
      </section>

      {/* Active Search/Filter Info */}
      {(searchParams.location || isFilterActive) && (
        <div className='search-info-bar'>
          <div className='search-info-content'>
            <span>
              <strong>{filteredProperties.length}</strong> properties found
              {searchParams.location && <> in <strong>"{searchParams.location}"</strong></>}
            </span>
            {searchParams.location && (
               <button className='clear-search-btn' onClick={clearSearch}>Clear Search <X size={14}/></button>
            )}
            {isFilterActive && (
               <button className='clear-search-btn' onClick={clearFilters}>Clear Filters <X size={14}/></button>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className='filter-modal-overlay'>
          <div className='filter-modal'>
            <div className='filter-header'>
              <h3>Filters</h3>
              <button onClick={() => setShowFilterModal(false)}><X size={24}/></button>
            </div>
            
            <div className='filter-body'>
              <div className='filter-section'>
                <h4>Property Type</h4>
                <label className="checkbox-container">
                  <input type="checkbox" name="hotel" checked={filters.hotel} onChange={handleFilterChange} />
                  <span className="checkmark"></span>
                  <Building2 size={18} className="checkbox-icon" /> Hotel
                </label>
                <label className="checkbox-container">
                  <input type="checkbox" name="villa" checked={filters.villa} onChange={handleFilterChange} />
                  <span className="checkmark"></span>
                  <Home size={18} className="checkbox-icon" /> Villa
                </label>
              </div>

              <div className='filter-section'>
                <h4>Price Range</h4>
                <label className="checkbox-container">
                  <input type="checkbox" name="priceBelow" checked={filters.priceBelow} onChange={handleFilterChange} />
                  <span className="checkmark"></span>
                  <Banknote size={18} className="checkbox-icon" /> Below $4,000
                </label>
                <label className="checkbox-container">
                  <input type="checkbox" name="priceAbove" checked={filters.priceAbove} onChange={handleFilterChange} />
                  <span className="checkmark"></span>
                  <Banknote size={18} className="checkbox-icon" /> $4,000 & Above
                </label>
              </div>

              <div className='filter-section'>
                <h4>Capacity</h4>
                <label className="checkbox-container">
                  <input type="checkbox" name="couples" checked={filters.couples} onChange={handleFilterChange} />
                  <span className="checkmark"></span>
                  <Users size={18} className="checkbox-icon" /> Couples
                </label>
                <label className="checkbox-container">
                  <input type="checkbox" name="family" checked={filters.family} onChange={handleFilterChange} />
                  <span className="checkmark"></span>
                  <Users size={18} className="checkbox-icon" /> Family
                </label>
              </div>
            </div>

            <div className='filter-footer'>
              <button className='clear-filters-link' onClick={clearFilters}>Clear all</button>
              <button className='apply-btn' onClick={() => setShowFilterModal(false)}>Show {filteredProperties.length} stays</button>
            </div>
          </div>
        </div>
      )}

      {/* Property Grid */}
      {filteredProperties.length > 0 ? (
        <>
        <div className='browse-grid'>
        {currentProperties.map((p) => {
          const propertyReviews = localReviews[p.id] || [];
          const allReviews = [...propertyReviews, ...(p.reviewsList || [])];
          
          let avgRating = p.rating;
          let reviewCount = p.reviews;

          if (allReviews.length > 0) {
             const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
             avgRating = parseFloat((total / allReviews.length).toFixed(1));
             reviewCount = allReviews.length;
          }

          const isWishlisted = user?.wishlist?.includes(p.id.toString());

          return (
            <div key={p.id} className="property-card" onClick={() => navigate('/stay-details', { state: { propertyId: p.id } })}>
              <div className="property-image-container">
                <img src={p.image} alt={p.hotelName} className="property-image" />
                <button 
                  className="wishlist-button" 
                  onClick={(e) => { e.stopPropagation(); if (!isAuthenticated) navigate('/login'); else toggleWishlist(p.id.toString()); }}
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
          );
        })}
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button 
              className="pagination-btn prev"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              className="pagination-btn next"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
        </>
      ) : (
        <div className='no-data-container' style={{textAlign: 'center', padding: '40px'}}>
            <h2>No Properties Found</h2>
            <p>Try adjusting your search or filters.</p>
            <button 
              className='new-search-btn clear-search-btn' 
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