import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Heart, ArrowRight, Users, List, BarChart2, ArrowUpRight, ShieldCheck, Key, HousePlus, CircleCheck } from 'lucide-react';
import { useAuth } from '../assets/AuthContext';
import './HomepageNew.css';
import { propertiesData, PropertyDataType } from './data/propertiesData';
import laptopBg from '../assets/laptop-bg.png';
import heroBg from '../assets/hero-bg.png';
import doctorsImg from '../assets/doctors.jpg';
import ratingBg from '../assets/rating-bg.jpg';
import phoneCall from '../assets/phone-call.jpg';
import houseContract from '../assets/house-contract.jpg';
import roomImg from '../assets/room.jpg';
import appImg from '../assets/app-mockup.png';

const HomepageNew: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, toggleWishlist } = useAuth();

  // Search States
  const [location, setLocation] = useState('');
  
  // Results States
  const [searched, setSearched] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<PropertyDataType[]>([]);
  const [loading, setLoading] = useState(false);

  // Pricing Toggle State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
  }, []);

  // Search Logic
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearched(true);

    setTimeout(() => {
        const query = location.toLowerCase().trim();
        if (!query) {
            setFilteredProperties([]);
            setLoading(false);
            return;
        }
        const results = propertiesData.filter(p => 
            p.city.toLowerCase().includes(query) || 
            p.hotelName.toLowerCase().includes(query)
        );
        setFilteredProperties(results);
        setLoading(false);
    }, 500);
  };

  const handleWishlistClick = (e: React.MouseEvent, propertyId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      toggleWishlist(propertyId.toString());
    }
  };

  return (
    <div className="homepage">
      
      {!searched ? (
        <>
          {/* --- HERO SECTION CONTAINER --- */}
          <section className="hero-container">
            
            {/* LEFT COLUMN: Purple Hero + Stats */}
            <div className="hero-left-column">
                
                {/* Purple Hero Box */}
                <div className="hero-purple-box">
                    <div className="hero-content">
                        <h1>Find <span className="icon-house">🏠</span> Your Ideal <br /> Stay for Work & Rest <br /> With <span className="highlight-pill">Ease</span></h1>
                        <p>Discover comfortable, verified stays designed for doctors, travel nurses, and healthcare professionals. Whether you're on a short assignment or a long-term rotation.</p>
                        
                        {/* Search Bar (Embedded) */}
                        <form className="hero-search-form" onSubmit={handleSearch}>
                            <div className="hero-search-input-group">
                                <Search className="search-icon-small" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search address, city, location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="hero-search-btn">
                                Find a Stay
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="hero-stats-box">
                    <div className="stat-item">
                        <h3>15K+</h3>
                        <p>Verified Healthcare Guests</p>
                    </div>
                    <div className="stat-item">
                        <h3>135+</h3>
                        <p>Locations Covered</p>
                    </div>
                    <div className="stat-item">
                        <h3>20k+</h3>
                        <p>Listed Properties</p>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: Image */}
            <div className="hero-right-column">
                <img 
                    src={heroBg} 
                    alt="Luxury Interior" 
                    className="hero-main-image"
                />
            </div>
          </section>

          {/* --- WHY CHOOSE US / SPECIFICATIONS SECTION --- */}
          <section className="section-container why-choose-us-section">
            <div className="wcu-header">
                <h2>Why Choose Us</h2>
                <p>Find comfortable, verified stays designed for healthcare professionals. Enjoy safe, affordable, and well-equipped accommodations near your workplace—so you can focus on what truly matters.</p>
            </div>

            <div className="specifications-box">
                <div className="spec-header-row">
                    <h3>Specifications</h3>
                    <div className="spec-arrow-icon">
                        <ArrowUpRight size={24} color="#000" />
                    </div>
                </div>

                <div className="spec-grid">
                    {/* Item 1 */}
                    <div className="spec-card">
                        <div className="spec-icon-circle">
                            <Search size={24} color="#000" />
                        </div>
                        <h4>Safe & Verified Stays</h4>
                        <p>Your well-being is our top priority. All properties are verified and adhere to high safety and hygiene standards to ensure a secure and comfortable stay.</p>
                    </div>

                    {/* Item 2 */}
                    <div className="spec-card">
                        <div className="spec-icon-circle">
                            <List size={24} color="#000" />
                        </div>
                        <h4>Near Major Hospitals</h4>
                        <p>Our properties are strategically located near hospitals, clinics, and medical centers, making your commute quick and hassle-free.</p>
                    </div>

                    {/* Item 3 */}
                    <div className="spec-card">
                        <div className="spec-icon-circle">
                            <Users size={24} color="#000" />
                        </div>
                        <h4>Affordable & Flexible</h4>
                        <p>Secure your stay in just a few clicks. Our seamless process is designed to match your schedule, whether it’s a short assignment or a long-term relocation.</p>
                    </div>

                    {/* Item 4 */}
                    <div className="spec-card">
                        <div className="spec-icon-circle">
                            <BarChart2 size={24} color="#000" />
                        </div>
                        <h4>Connect with Trusted Hosts</h4>
                        <p>Enjoy fully furnished accommodations with essential amenities tailored for healthcare professionals, ensuring a restful and stress-free stay.</p>
                    </div>
                </div>
            </div>
          </section>

          {/* --- FEATURED STAYS --- */}
          <section className="section-container">
            <div className="section-header">
                 <h2>Discover Our Featured Stays</h2>
                 <p>Handpicked stays for comfort and convenience, designed exclusively for healthcare professionals.</p>
            </div>
           
            <div className="properties-grid">
              {propertiesData.slice(0, 4).map((property) => {
                const propertyReviews = localReviews[property.id] || [];
                const allReviews = [...propertyReviews, ...(property.reviewsList || [])];
                const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
                const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : property.rating;
                const reviewCount = allReviews.length > 0 ? allReviews.length : property.reviews;
                const isWishlisted = user?.wishlist?.includes(property.id.toString());

                return (
                <div key={property.id} className="property-card" onClick={() => navigate('/stay-details', { state: { propertyId: property.id } })}>
                  <div className="property-image-container">
                      <img src={property.image} alt={property.hotelName} className="property-image" />
                      <button className="wishlist-button" onClick={(e) => handleWishlistClick(e, property.id)}>
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
                      <h3 className="property-title">{property.hotelName}</h3>
                       <div className="price-container-inline">
                          <span className="price-amount">{property.price}</span>
                          <span className="price-label">/night</span>
                       </div>
                    </div>
                    <div className="property-location">
                      <MapPin size={14} color="#777" />
                      <span className="city-text">{property.city}</span>
                    </div>
                     <div className="property-meta">
                       <span className="meta-value">{property.capacity}</span>
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

            <div className="view-all-container">
                <button className="view-all-btn" onClick={() => navigate('/browseStays')}>
                    View All <ArrowRight size={20} />
                </button>
            </div>
          </section>

          {/* --- PROPERTY TO RENT SECTION --- */}
          <section className="section-container property-to-rent-section">
              <div className="rent-cta-banner">
                  <span className="rent-cta-text">Ready to List Your Property for Healthcare Professionals?</span>
                  <button className="rent-cta-btn">List Your Property</button>
              </div>

              <div className="rent-blue-background">
                  <div className="rent-content-constraint">
              {/* Header */}
              <div className="rent-header">
                  <h2>Have A Property To Rent?</h2>
                  <p>Turn your space into a trusted stay for healthcare professionals. List your property and connect with doctors, travel nurses, and medical staff looking for comfortable, accommodations near their workplace.</p>
              </div>

              {/* 4 Steps Grid */}
              <div className="rent-steps-grid">
                  
                  {/* Step 1 */}
                  <div className="rent-step-card">
                      <div className="step-image-container">
                          <img src={laptopBg} alt="List" className='step-image' />
                          <span className="step-badge">LIST</span>
                      </div>
                      <div className="step-footer">
                          <span className="step-number">1</span>
                          <p className="step-text">Add your property with photos, pricing, and details in just a few steps.</p>
                      </div>
                  </div>

                  {/* Step 2 */}
                  <div className="rent-step-card">
                      <div className="step-image-container">
                          <img src={phoneCall} alt="Connect" className='step-image' />
                          <span className="step-badge">CONNECT</span>
                      </div>
                      <div className="step-footer">
                          <span className="step-number">2</span>
                          <p className="step-text">Receive booking requests from verified doctors and healthcare professionals.</p>
                      </div>
                  </div>

                  {/* Step 3 */}
                  <div className="rent-step-card">
                      <div className="step-image-container">
                          <img src={ratingBg} alt="Approve" className='step-image' />
                          <span className="step-badge">APPROVE</span>
                      </div>
                      <div className="step-footer">
                          <span className="step-number">3</span>
                          <p className="step-text">Review guest details, set your preferences, and accept bookings on your terms.</p>
                      </div>
                  </div>

                  {/* Step 4 */}
                  <div className="rent-step-card">
                      <div className="step-image-container">
                          <img src={laptopBg} alt="Earn" className='step-image' />
                          <span className="step-badge">EARN</span>
                      </div>
                      <div className="step-footer">
                          <span className="step-number">4</span>
                          <p className="step-text">Get paid securely while providing a comfortable stay for medical workers.</p>
                      </div>
                  </div>

              </div>
                  </div>
              </div>
          </section>

          {/* --- MAXIMIZE POTENTIAL SECTION --- */}
          <section className="section-container maximize-potential-section">
              <div className="max-header">
                  <h2>Maximize Your Property’s Potential</h2>
                  <p>Turn your space into a trusted haven for healthcare professionals. With guaranteed security, flexible hosting options, and a seamless booking experience, earning from your property has never been easier.</p>
              </div>

              <div className="max-content-wrapper">
                  {/* Left Column: Image Collage */}
                  <div className="max-images-left">
                      <img src={doctorsImg} alt="Medical Team" className="max-img-top" />
                      <div className="max-img-row-bottom">
                          <img src={houseContract} alt="House contract" className="max-img-left" />
                          <img src={roomImg} alt="Bedroom" className="max-img-right" />
                      </div>
                  </div>

                  {/* Right Column: Features List */}
                  <div className="max-features-right">
                      <h3>Find a perfect home</h3>
                      <p className="max-subtitle">Turn your space into a trusted haven for healthcare professionals. With guaranteed security</p>
                      
                      <div className="max-features-list">
                          {/* Feature 1 */}
                          <div className="max-feature-item">
                              <div className="max-icon-circle">
                                  <HousePlus size={24} color="#6d28d9" />
                              </div>
                              <div className="max-feature-text">
                                  <h4>Flexible Hosting, Full Control</h4>
                                  <p>Decide when to rent, set your own rules, and accept bookings at your convenience.</p>
                              </div>
                          </div>

                          {/* Feature 2 */}
                          <div className="max-feature-item">
                              <div className="max-icon-circle">
                                  <Users size={24} color="#6d28d9" />
                              </div>
                              <div className="max-feature-text">
                                  <h4>Exclusive Healthcare Guests</h4>
                                  <p>Host verified medical professionals for a stress-free rental experience.</p>
                              </div>
                          </div>

                          {/* Feature 3 */}
                          <div className="max-feature-item">
                              <div className="max-icon-circle">
                                  <ShieldCheck size={24} color="#6d28d9" />
                              </div>
                              <div className="max-feature-text">
                                  <h4>Guaranteed Secure Payments</h4>
                                  <p>Receive hassle-free, timely payments with our secure transaction system.</p>
                              </div>
                          </div>

                          {/* Feature 4 */}
                          <div className="max-feature-item">
                              <div className="max-icon-circle">
                                  <Key size={24} color="#6d28d9" />
                              </div>
                              <div className="max-feature-text">
                                  <h4>Effortless Management</h4>
                                  <p>From listing to booking, our platform handles everything so you don't have to.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          {/* --- PRICING SECTION --- */}
          <section className="section-container pricing-section">
              <div className="pricing-header">
                  <h2>Your Plan, Your Way!</h2>
                  <p>Choose one option for now. You can explore others later.</p>
                  
                  {/* Toggle Switch */}
                  <div className="pricing-toggle-container">
                      <button 
                        className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                      >
                        MONTHLY
                      </button>
                      <button 
                        className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('yearly')}
                      >
                        YEARLY
                      </button>
                  </div>
              </div>

              <div className="pricing-card-container">
                  <div className="pricing-content-wrapper">
                      {/* Left: Plan Details */}
                      <div className="pricing-details-left">
                          <div className="pricing-header-row">
                              <div className="pricing-icon">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                      <linearGradient id="pricing-circle-gradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0.5" stopColor="#6d28d9" />
                                        <stop offset="0.5" stopColor="#E0C8FF" />
                                      </linearGradient>
                                    </defs>
                                    <circle cx="12" cy="12" r="12" fill="url(#pricing-circle-gradient)" />
                                  </svg>
                              </div>
                              <div className="pricing-plan-text">
                                  <span className="plan-label">For individuals</span>
                                  <h3 className="plan-name">Basic</h3>
                              </div>
                          </div>
                          <p className="plan-desc">Show social proof notifications to increase leads and sales.</p>
                          
                          <div className="plan-price-row">
                              <span className="price-value">$12.99</span>
                              <span className="price-period">/monthly</span>
                          </div>

                          <button className="get-started-btn">
                              Get started
                          </button>
                      </div>

                      {/* Right: Features List */}
                      <div className="pricing-features-right">
                          <h4>What’s included</h4>
                          <ul className="features-list">
                              <li><CircleCheck size={20} className="check-icon"/> All analytics features</li>
                              <li><CircleCheck size={20} className="check-icon"/> Up to 250,000 tracked visits</li>
                              <li><CircleCheck size={20} className="check-icon"/> Normal support</li>
                              <li><CircleCheck size={20} className="check-icon"/> Up to 3 team members</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </section>

          {/* --- DOWNLOAD APP SECTION --- */}
          <section className="section-container download-app-section">
              <div className="app-download-container">
                  <div className="app-content-left">
                      <h2>Get Started Anywhere,<br />Anytime <br />Download Our App!</h2>
                      <p>Manage your property or find the perfect stay with ease. Our app puts everything at your fingertips—browse listings, communicate with guests or hosts, and secure bookings effortlessly.</p>
                      
                      <div className="app-store-buttons">
                          <button className="store-btn">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" />
                          </button>
                          <button className="store-btn">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" />
                          </button>
                      </div>
                  </div>

                  <div className="app-image-right">
                      <img 
                        src={appImg}
                        alt="Mobile App" 
                        className="phone-mockup" 
                      />
                  </div>
              </div>
          </section>

        </>
      ) : (
        /* --- SEARCH RESULTS VIEW --- */
        <section className="results-section">
            <div className="results-header">
                <button className="back-link" onClick={() => { setSearched(false); setLocation(''); }}>← Back to Home</button>
                <h2>Properties in "{location}"</h2>
            </div>

            {loading ? (
                <div className="loading-state">Finding best stays for you...</div>
            ) : filteredProperties.length > 0 ? (
                <div className="properties-grid">
                    {filteredProperties.map(p => {
                        const propertyReviews = localReviews[p.id] || [];
                        const allReviews = [...propertyReviews, ...(p.reviewsList || [])];
                        const totalRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
                        const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : p.rating;
                        const reviewCount = allReviews.length > 0 ? allReviews.length : p.reviews;
                        const isWishlisted = user?.wishlist?.includes(p.id.toString());

                        return (
                        <div key={p.id} className="property-card" onClick={() => navigate('/stay-details', { state: { propertyId: p.id } })}>
                            <div className="property-image-container">
                                <img src={p.image} alt={p.hotelName} className="property-image" />
                                <button className="wishlist-button" onClick={(e) => handleWishlistClick(e, p.id)}>
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
            ) : (
                <div className="no-results">
                    <h3>No properties found in this location.</h3>
                    <p>Try searching for Pune, Mumbai, Delhi, or Hyderabad.</p>
                    <button className="reset-btn" onClick={() => { setSearched(false); setLocation(''); }}>Clear Search</button>
                </div>
            )}
        </section>
      )}
    </div>
  );
};

export default HomepageNew;