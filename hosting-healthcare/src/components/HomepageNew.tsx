import React, { useEffect, useState } from 'react'
import './HomepageNew.css';
import homepageImage from './assets/Crop bg image.png';
import frameImage from './assets/Frame image.png';
import detailsImg from './assets/Specification image.png';
import discoverImg from './assets/Discover image.png';
import propertyImg from './assets/Property image.png';
import propertytextImg from './assets/Property Rent image.png';
import listImg from './assets/List image.png';
import connectImg from './assets/Connect image.png';
import approveImg from './assets/Approve image.png';
import earnImg from './assets/Earn image.png';
import appImg from './assets/Advertisement image.png';
import { FaSearch } from "react-icons/fa";
import BrowseStays from './BrowseStays';


type Property = {
        id: number
        name: string
        type: string
        price: number
        rating: number
        reviews: number
        available: boolean
        guests?: string
        image?: string
        description?: string
    }

const mockDataByCity: { [key: string]: Property[] } = {
  pune: [
    { id: 1, name: 'Pune Central Hotel', type: 'Hotel', price: 2500, rating: 4.5, reviews: 124, available: true, guests: 'Couples', image: propertyImg, description: 'Central location, free breakfast.' },
    { id: 2, name: 'Luxury Villa Koregaon', type: 'Villa', price: 8500, rating: 4.8, reviews: 56, available: false, guests: 'Family', image: propertyImg, description: 'Private pool and garden.' },
    { id: 3, name: 'Budget Stay Wakad', type: 'Hotel', price: 1200, rating: 4.0, reviews: 220, available: true, guests: 'Couples', image: propertyImg, description: 'Affordable, great for short stays.' }
  ],
  mumbai: [
    { id: 4, name: 'Mumbai Beachfront Hotel', type: 'Hotel', price: 3500, rating: 4.6, reviews: 200, available: true, guests: 'Families', image: propertyImg, description: 'Sea view, luxury stay.' },
    { id: 5, name: 'Downtown Mumbai Villa', type: 'Villa', price: 6000, rating: 4.7, reviews: 89, available: true, guests: 'Couples', image: propertyImg, description: 'Modern architecture, business hub.' }
  ],
  bangalore: [
    { id: 6, name: 'Bangalore Tech Park Hotel', type: 'Hotel', price: 2200, rating: 4.3, reviews: 150, available: true, guests: 'Couples', image: propertyImg, description: 'Near tech parks, WiFi.' },
    { id: 7, name: 'Luxury Bangalore Villa', type: 'Villa', price: 7500, rating: 4.9, reviews: 78, available: false, guests: 'Family', image: propertyImg, description: 'Premium amenities, garden.' }
  ],
  delhi: [
    { id: 8, name: 'Delhi Central Hotel', type: 'Hotel', price: 2800, rating: 4.4, reviews: 180, available: true, guests: 'Families', image: propertyImg, description: 'Market area, shopping nearby.' },
    { id: 9, name: 'Delhi Heritage Villa', type: 'Villa', price: 5500, rating: 4.5, reviews: 64, available: true, guests: 'Couples', image: propertyImg, description: 'Historical site nearby.' }
  ],
   hyderabad: [
    { id: 10, name: 'Hyderabad Hotel Royal Inn', type: 'Hotel', price: 3000, rating: 4.5, reviews: 200, available: true, guests: 'Families', image: propertyImg, description: 'Central location, great for sightseeing.' },
    { id: 11, name: 'Hyderabad Home Tridasa, Villa', type: 'Villa', price: 8000, rating: 4.8, reviews: 150, available: true, guests: 'Couples, Families', image: propertyImg, description: 'Luxurious amenities with Pool and garden.' },
    { id: 12, name: 'Hyderabad Emaar Boulder Hills, Villa', type: 'Villa', price: 12000, rating: 4.8, reviews: 172, available: true, guests: 'Couples, Families', image: propertyImg, description: 'Luxurious amenities with Private Pool and garden.' }
  ]
}

  function HomepageNew() {
      const [city, setCity] = useState<string>('')
      const [properties, setProperties] = useState<Property[]>([])
      const [loading, setLoading] = useState<boolean>(false)
      const [error, setError] = useState<string | null>(null)
      const [searched, setSearched] = useState<boolean>(false)
      const [showBrowseStays, setShowBrowseStays] = useState<boolean>(false)

      if (showBrowseStays) return <BrowseStays />

  async function fetchProperties(queryCity: string) {
    setLoading(true)
    setError(null)
    try {
      const cityKey = queryCity.toLowerCase().trim()
      const res = await fetch(`https://example.com/api/properties?city=${encodeURIComponent(queryCity)}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length) {
          setProperties(data)
          return
        }
      }
      if (mockDataByCity[cityKey]) {
        setProperties(mockDataByCity[cityKey])
      } else {
        setProperties([])
        setError(`No properties found for "${queryCity}". Try: Pune, Mumbai, Bangalore, Delhi`)
      }
    } catch (e) {
      const cityKey = queryCity.toLowerCase().trim()
      if (mockDataByCity[cityKey]) {
        setProperties(mockDataByCity[cityKey])
      } else {
        setProperties([])
        setError(`No properties found for "${queryCity}". Try: Pune, Mumbai, Bangalore, Delhi`)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent | null = null) {
    if (e) e.preventDefault()
    if (city.trim()) {
      setSearched(true)
      fetchProperties(city)
    }
  }

  function handleCityClick(cityName: string) {
    setCity(cityName)
    setSearched(true)
    fetchProperties(cityName)
  }

  function togglePrebook(id: number) {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, available: !p.available } : p))
  } 
return (
    <div className='Homepage'>
      {!searched && (
        <>
          <div className='Left-search-panel' style={{ backgroundImage: `url(${homepageImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className='panel-overlay' />
            <div className='search-panel-content'>
              <h2 className='panel-title'>Find Your Ideal Stay For Work</h2>
              <p className='panel-subtitle'>Book hotels, Villas & more in India</p>
              <form className='panel-search-form' onSubmit={handleSearch}>
                <input 
                  type='text'
                  placeholder='Enter city name' 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className='panel-search-input'
                />
                <button type='submit' className='panel-search-btn'>Find Stay</button>
              </form>
              <div className='popular-cities'>
                <p className='popular-label'>Popular Cities:</p>
                <div className='city-tags'>
                  <button type='button' onClick={() => handleCityClick('Pune')} className='city-tag'>Pune</button>
                  <button type='button' onClick={() => handleCityClick('Mumbai')} className='city-tag'>Mumbai</button>
                  <button type='button' onClick={() => handleCityClick('Bangalore')} className='city-tag'>Bangalore</button>
                  <button type='button' onClick={() => handleCityClick('Delhi')} className='city-tag'>Delhi</button>
                  <button type='button' onClick={() => handleCityClick('Hyderabad')} className='city-tag'>Hyderabad</button>
            </div>
            </div>
          </div>
      </div>
          <div className='Right-img'>
            <img src={homepageImage} alt='Homepage' />
          </div>
          <div className='Rating-img'>
            <img src={frameImage} alt='Frame image' />
          </div>
          <div className='Details-img'>
            <img src={detailsImg} alt="Details" />
          </div> 
          <div className='Text-img'>
            <img src={discoverImg} alt="Discover" />
          </div>
          <div className='property-img'>
            <img src={propertyImg} alt="Property" />
          </div>
          <div>
            <button type="button" onClick={() => setShowBrowseStays(true)} className="Blue-btn"> View All  → </button>
          </div>
          <div className='Property-text-img'>
            <img src={propertytextImg} alt="Property Text" />
          </div>
          <div className='Step-image'>
            <img src={listImg} alt="List Image 1" />
            <img src={connectImg} alt="Connect Image 2" />
            <img src={approveImg} alt="Approve Image 3" />
            <img src={earnImg} alt="Earn Image 4" />
          </div>
        </>
      )} 

      {/* Search Bar Section */}
      <section className='search-section'>
        <form className='search-bar' onSubmit={handleSearch}>
          <input 
            type='text'
            aria-label='city' 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            placeholder='Search city' 
            className='search-input'
          />
          <button type='submit' className='search-btn'>Search Properties</button>
        </form>
        {error && <div className='fetch-error'>{error}</div>}
      </section>

      {searched && (
        <>
          <section className='results-section'>
            {loading ? (
              <div className='loading'>Loading properties…</div>
            ) : (
              <div className='results-container'>
                {properties.length > 0 ? (
                  <>
                    <h2 className='results-title'>Properties in {city}</h2>
                    <div className='results-grid'>
                      {properties.map(p => (
                        <article key={p.id} className='property-card'>
                          <div className='card-img'>
                            <img src={p.image ?? propertyImg} alt={p.name} />
                          </div>
                          <div className='card-body'>
                            <h3 className='card-title'>{p.name}</h3>
                            <div className='card-meta'>
                              <span className='type'>{p.type}</span>
                              <span className='guests'>{p.guests}</span>
                            </div>
                            <p className='card-desc'>{p.description}</p>
                            <div className='card-bottom'>
                              <div className='price'>₹{p.price} / night</div>
                              <div className='rating'>⭐ {p.rating} <span className='reviews'>({p.reviews})</span></div>
                            </div>
                            <div className='card-actions'>
                              <button className={`book-btn ${p.available ? '' : 'disabled'}`} onClick={() => togglePrebook(p.id)}>
                                {p.available ? 'Pre-book' : 'Pre-booked'}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className='no-results'>No properties found. Try another search!</div>
                )}
              </div>
            )}
            <button className='back-btn' onClick={() => { setSearched(false); setCity(''); setProperties([]); }}>
              ← Back to Home
            </button>
          </section>
        </>
      )}

      {!searched && (
        <section className='featured-section'>
          <h2 className='featured-title'>Featured Properties</h2>
          <div className='featured-grid'>
            {[
              { id: 1, name: 'Pune Central Hotel', type: 'Hotel', price: 2500, rating: 4.5, reviews: 124, guests: 'Couples', description: 'Central location, free breakfast.', city: 'Pune' },
              { id: 4, name: 'Mumbai Beachfront Hotel', type: 'Hotel', price: 3500, rating: 4.6, reviews: 200, guests: 'Families', description: 'Sea view, luxury stay.', city: 'Mumbai' },
              { id: 6, name: 'Bangalore Tech Park Hotel', type: 'Hotel', price: 2200, rating: 4.3, reviews: 150, guests: 'Couples', description: 'Near tech parks, WiFi.', city: 'Bangalore' },
              { id: 8, name: 'Delhi Central Hotel', type: 'Hotel', price: 2800, rating: 4.4, reviews: 180, guests: 'Families', description: 'Market area, shopping nearby.', city: 'Delhi' }
            ].map(p => (
              <div key={p.id} className='featured-card'>
                <div className='featured-card-img'>
                  <img src={propertyImg} alt={p.name} />
                  <span className='featured-badge'>{p.type}</span>
                </div>
                <div className='featured-card-body'>
                  <h3 className='featured-card-title'>{p.name}</h3>
                  <p className='featured-card-desc'>{p.description}</p>
                  <div className='featured-card-meta'>
                    <span className='featured-guests'>👥 {p.guests}</span>
                    <span className='featured-rating'>⭐ {p.rating}</span>
                  </div>
                  <div className='featured-card-footer'>
                    <div className='featured-price'>₹{p.price}/night</div>
                    <button type='button' className='featured-view-btn' onClick={() => handleCityClick(p.city)}>View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!searched && (
        <div className='App-img'>
          <img src={appImg} alt="Advertisement" />
        </div>
      )}
    </div>
  )
};

export default HomepageNew;

