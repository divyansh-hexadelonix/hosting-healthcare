import React, { useState, ChangeEvent } from 'react'
import './BrowseStays.css';
import hotelImg from './assets/hotel-swimming-pool.jpg';
import villaImg from './assets/Villa image 1.png';
import swimingpoolImg from './assets/Swiming_Pool_Villa.jpg';
import whitehouseImg from './assets/White-house-villa-image.png';
import houseviewImg from './assets/House-View-image.png';
import hotelviewpointImg from './assets/Hotel View Point.jpg';
import tropicalbeachresortImg from './assets/Tropical Beach Resort.jpg';
import sunsethotelImg from './assets/Sunset view hotel.jpg';


function BrowseStays() {
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

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [month, day, year] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const handleCheckInDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCheckInDate(e.target.value);
  };

  const handleCheckOutDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setCheckOutDate(e.target.value);
  };

  const handleSearch = (): void => {
    if (!location || !checkInDate || !checkOutDate) {
      alert('Please fill in all search fields: Location, Check-in Date, and Check-out Date');
      return;
    }

    const searchData = {
      location,
      checkInDate: formatDateDisplay(checkInDate),
      checkOutDate: formatDateDisplay(checkOutDate),
    };

    setSearchParams(searchData);
    console.log('Search Initiated:', searchData);
  };

  const handlePropertyClick = (property: any): void => {
    
    if (!searchParams.location || !searchParams.checkInDate || !searchParams.checkOutDate) {
      alert('Please search with location and dates first');
      return;
    }

    const bookingData = {
      property: property.hotelName,
      propertyId: property.id,
      propertyType: property.type,
      location: searchParams.location,
      checkInDate: searchParams.checkInDate,
      checkOutDate: searchParams.checkOutDate,
      price: property.price,
      rating: property.rating,
      reviews: property.reviews,
    };

    console.log('Property Selected for Booking:', bookingData);
  };

  const handleFilterToggle = (): void => {
    setShowFilterModal(!showFilterModal);
  };

  const handleFilterCheckboxChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    
    
    if (name === 'priceBelow' && checked) {
      setFilters(prevFilters => ({
        ...prevFilters,
        priceBelow: true,
        priceAbove: false,
      }));
    } else if (name === 'priceAbove' && checked) {
      setFilters(prevFilters => ({
        ...prevFilters,
        priceBelow: false,
        priceAbove: true,
      }));
    } else {
      
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: checked
      }));
    }
  };

  const applyFilters = (): void => {
    console.log('Filters applied:', filters);
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

  const properties = [
    {
      id: 1,
      image: hotelviewpointImg,
      city: 'Pune',
      hotelName: 'Luxury Hill Resort',
      capacity: 'Couples & Family',
      available: true,
      reviews: 428,
      rating: 4.8,
      price: '₹5,000',
      type: 'hotel',
    },
    {
      id: 2,
      image: whitehouseImg,
      city: 'Mumbai',
      hotelName: 'Sea View Mansion',
      capacity: 'Couples & Family',
      available: true,
      reviews: 612,
      rating: 4.9,
      price: '₹3,500',
      type: 'hotel',
    },
    {
      id: 3,
      image: villaImg,
      city: 'Hyderabad',
      hotelName: 'Charming Heritage Villa',
      capacity: 'Couples & Family',
      available: true,
      reviews: 356,
      rating: 4.7,
      price: '₹6,499',
      type: 'villa',
    },
    {
      id: 4,
      image: houseviewImg,
      city: 'Bangalore',
      hotelName: 'Modern Tech Hub Stay',
      capacity: 'Family',
      available: true,
      reviews: 289,
      rating: 4.6,
      price: '₹4,000',
      type: 'hotel',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop',
      city: 'Delhi',
      hotelName: 'Royal Palace Hotel',
      capacity: 'Couples & Family',
      available: true,
      reviews: 721,
      rating: 4.8,
      price: '₹5,000',
      type: 'hotel',
    },
    {
      id: 6,
      image: swimingpoolImg,
      city: 'Pune',
      hotelName: 'Green Valley Retreat',
      capacity: 'Couples & Family',
      available: true,
      reviews: 445,
      rating: 4.7,
      price: '₹6,000',
      type: 'villa',
    },
    {
      id: 7,
      image: tropicalbeachresortImg,
      city: 'Mumbai',
      hotelName: 'Beachfront Paradise',
      capacity: 'Couples',
      available: true,
      reviews: 834,
      rating: 4.9,
      price: '₹7,500',
      type: 'hotel',
    },
    {
      id: 8,
      image: hotelImg,
      city: 'Bangalore',
      hotelName: 'Elegant Garden Suite',
      capacity: 'Couples & Family',
      available: false,
      reviews: 567,
      rating: 4.8,
      price: '₹4,800',
      type: 'villa',
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      city: 'Hyderabad',
      hotelName: 'White House Park Stay Inn',
      capacity: 'Family',
      available: true,
      reviews: 392,
      rating: 4.7,
      price: '₹3,000',
      type: 'hotel',
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=400&fit=crop',
      city: 'Delhi',
      hotelName: 'Contemporary Loft',
      capacity: 'Couples',
      available: false,
      reviews: 276,
      rating: 4.5,
      price: '₹4,200',
      type: 'hotel',
    },
    {
      id: 11,
      image: sunsethotelImg,
      city: 'Goa, Vagator',
      hotelName: 'Sunset Valley, Villa',
      capacity: 'Couples & Family',
      available: true,
      reviews: 503,
      rating: 4.8,
      price: '₹8,000',
      type: 'villa',
    },
    {
      id: 12,
      image: whitehouseImg,
      city: 'Bangalore',
      hotelName: 'Premium Downtown Hotel',
      capacity: 'Family',
      available: true,
      reviews: 618,
      rating: 4.7,
      price: '₹5,200',
      type: 'hotel',
    },
  ];

    const filteredProperties = properties.filter((property) => {

    const cityMatch = searchParams.location 
      ? property.city.toLowerCase().includes(searchParams.location.toLowerCase())
      : true;

    if (!cityMatch) return false;

    // If no filters are selected, show all properties matching the city
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
    
    if (filters.priceBelow) {
      priceMatch = priceValue <= 5000;
    } else if (filters.priceAbove) {
      priceMatch = priceValue >= 5000;
    }

    return typeMatch && capacityMatch && priceMatch;
  });

  return (
    <div className='browse-container'>
  
      <div className='search-bar-section'>
        <div className='search-bar-wrapper'>

          <div className='search-input-group'>
            <label className='search-label'>Where are you going ?🏰</label>
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
              <span className='calendar-icon'>📅</span>
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
              <span className='calendar-icon'>📅</span>
            </div>
          </div>

          <button className='filter-btn' onClick={handleFilterToggle}>
            ⚙️ Filter
          </button>

          <button className='search-btn' onClick={handleSearch}>
            🔍︎ Search
          </button>
        </div>
      </div>

      {showFilterModal && (
        <div className='filter-modal-overlay' onClick={() => setShowFilterModal(false)}>
          <div className='filter-modal' onClick={(e) => e.stopPropagation()}>
            <div className='filter-modal-header'>
              <h2>Filter Stays</h2>
              <button className='close-btn' onClick={() => setShowFilterModal(false)}>✕</button>
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
                    <span>🏨 Hotels</span>
                  </label>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='villa'
                      checked={filters.villa}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span>🏰 Villa</span>
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
                    <span>💰 Below ₹5,000</span>
                  </label>

                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='priceAbove'
                      checked={filters.priceAbove}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span>💰 Above ₹5,000</span>
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
                    <span>👫 Couples</span>
                  </label>
                  <label className='checkbox-label'>
                    <input
                      type='checkbox'
                      name='family'
                      checked={filters.family}
                      onChange={handleFilterCheckboxChange}
                    />
                    <span>👨‍👩‍👧‍👦 Family</span>
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

      {searchParams.location && (
        <div className='search-info-bar'>
          <div className='search-info-content'>
            <span className='search-info-item'>
              <strong>Location:</strong> {searchParams.location}
            </span>
            <span className='search-info-item'>
              <strong>Check-in:</strong> {searchParams.checkInDate}
            </span>
            <span className='search-info-item'>
              <strong>Check-out:</strong> {searchParams.checkOutDate}
            </span>
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

      {filteredProperties.length > 0 ? (
        <div className='properties-grid'>
          {filteredProperties.map((property) => (
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
                <div className='property-badge'>
                  {property.available ? (
                    <span className='available'>Available</span>
                  ) : (
                    <span className='booked'>Booked</span>
                  )}
                </div>
              </div>

              <div className='property-content'>
                <h3 className='property-title'>{property.hotelName}</h3>
                
                <div className='property-location'>
                  <span className='city-badge'>{property.city}</span>
                </div>

                <div className='property-meta'>
                  <div className='meta-item'>
                    <span className='meta-label'>Guests:</span>
                    <span className='meta-value'>{property.capacity}</span>
                  </div>
                </div>

                <div className='rating-review-container'>
                  <div className='property-rating'>
                    <span className='star'>★</span>
                    <span className='rating-value'>{property.rating}</span>
                  </div>
                  <div className='property-reviews'>
                    <span className='reviews-count'>({property.reviews} reviews)</span>
                  </div>
                </div>

                <div className='property-footer'>
                  <div className='price-container'>
                    <span className='price-label'>Per Night:</span>
                    <span className='price-amount'>{property.price}</span>
                  </div>
                  <button 
                    className='pre-book-btn'
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePropertyClick(property);
                    }}
                  >
                    Pre-Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='no-data-container'>
          <div className='no-data-message'>
            <h2>No Properties Found</h2>
            <p>
              {searchParams.location 
                ? `Sorry, we couldn't find any properties in ${searchParams.location}.`
                : 'Please search with a location and dates to see available properties.'}
            </p>
            <button 
              className='new-search-btn'
              onClick={() => {
                setSearchParams({ location: '', checkInDate: '', checkOutDate: '' });
                setLocation('');
                setCheckInDate('');
                setCheckOutDate('');
              }}
            >
              Try New Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseStays;