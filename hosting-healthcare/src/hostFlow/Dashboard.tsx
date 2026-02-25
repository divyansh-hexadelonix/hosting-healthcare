import React, { useEffect, useState } from 'react';
import { 
  Zap,
  Check,
  BarChart2,
  Star,
  Filter,
  Search,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { propertiesData, mockBookingRequests } from '../data/propertiesData';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<string>("0.0");
  const [searchText, setSearchText] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [dateSort, setDateSort] = useState('newest');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hh_host_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const loadRequests = React.useCallback(() => {
    if (!user) return;

    const localRequests = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');

    const mocks = mockBookingRequests || [];
    const allRequests = [...localRequests, ...mocks].map((req: any) => ({
      ...req,
      hostName: req.hostName || 'David Beckham',
      hostEmail: req.hostEmail || 'david@gmail.com',
    }));

    const myRequests = allRequests.filter(
      (req: any) => req.hostEmail === user.email || req.hostName === user.name
    );

    setBookingRequests(myRequests);
  }, [user]);

  const calculateAverageRating = React.useCallback(() => {
    const savedReviews = localStorage.getItem('hh_reviews');
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : {};

    let totalRatingSum = 0;
    let count = 0;

    propertiesData.forEach((property: any) => {
      const localReviews = parsedReviews[property.id] || [];
      const staticReviews = property.reviewsList || [];
      const allReviews = [...localReviews, ...staticReviews];

      if (allReviews.length > 0) {
        const sum = allReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        totalRatingSum += (sum / allReviews.length);
        count++;
      } else {
        totalRatingSum += property.rating;
        count++;
      }
    });

    const avg = count > 0 ? (totalRatingSum / count).toFixed(1) : "0.0";
    setAverageRating(avg);
  }, []);

  // Load on mount and whenever user changes
  useEffect(() => {
    loadRequests();
    calculateAverageRating();
  }, [loadRequests, calculateAverageRating]);

  // Re-load when the tab regains focus or localStorage changes
  useEffect(() => {
    window.addEventListener('focus', loadRequests);
    window.addEventListener('storage', loadRequests);
    window.addEventListener('hh_requests_updated', loadRequests);
    window.addEventListener('focus', calculateAverageRating);
    window.addEventListener('storage', calculateAverageRating);
    return () => {
      window.removeEventListener('focus', loadRequests);
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener('hh_requests_updated', loadRequests);
      window.removeEventListener('focus', calculateAverageRating);
      window.removeEventListener('storage', calculateAverageRating);
    };
  }, [loadRequests, calculateAverageRating]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-dropdown-trigger')) {
        setIsDateDropdownOpen(false);
      }
      if (!target.closest('.property-dropdown-trigger')) {
        setIsPropertyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const filteredRequests = React.useMemo(() => {
    let result = [...bookingRequests];

    // 1. Search (Guest Name or Property)
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(req =>
        (req.guestName && req.guestName.toLowerCase().includes(lower)) ||
        (req.property && req.property.toLowerCase().includes(lower))
      );
    }

    // 2. Property Filter
    if (selectedProperty) {
      result = result.filter(req => req.property === selectedProperty);
    }

    // 3. Date Sort
    result.sort((a, b) => {
      const parseDate = (d: string) => {
        if (!d) return 0;
        const parts = d.split('-');
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        return new Date(d).getTime() || 0;
      };
      const tA = parseDate(a.moveIn);
      const tB = parseDate(b.moveIn);
      return dateSort === 'newest' ? tB - tA : tA - tB;
    });

    return result.slice(0, 5);
  }, [bookingRequests, searchText, selectedProperty, dateSort]);

  const uniqueProperties = React.useMemo(() => {
    return Array.from(new Set(bookingRequests.map(r => r.property).filter(Boolean))).sort();
  }, [bookingRequests]);

  const handleReset = () => {
    setSearchText('');
    setSelectedProperty('');
    setDateSort('newest');
  };

  const confirmedCount = React.useMemo(() => {
    return bookingRequests.filter(r => (r.status || '').toLowerCase() === 'accepted').length;
  }, [bookingRequests]);

  // Navigate to full booking detail page
  const handleViewDetails = (row: any) => {
    const matched = propertiesData.find(p => p.hotelName === row.property);
    navigate('/booking-detail', {
      state: {
        row: {
          ...row,
          propertyImage: matched?.image,
          propertyCity: matched?.city,
          propertyPrice: matched?.price,
        }
      }
    });
  };

  return (
    <div className="dashboard-content">
      
      <h2 className="section-title">Your Insights</h2>
      
      {/* Insights Grid */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon-circle bg-red">
            <Zap size={24} color="#ff5a5f" fill="#ff5a5f" />
          </div>
          <div className="insight-data">
            <h3>{bookingRequests.length}</h3>
            <p>Booking Requests</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon-circle bg-green">
            <Check size={24} color="#20c997" strokeWidth={3} />
          </div>
          <div className="insight-data">
            <h3>{user?.name === 'David Beckham' ? propertiesData.length : 0}</h3>
            <p>Listings</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon-circle bg-blue">
            <BarChart2 size={24} color="#339af0" />
          </div>
          <div className="insight-data">
            <h3>{confirmedCount}</h3>
            <p>Bookings Confirmed</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon-circle bg-yellow">
            <Star size={24} color="#fcc419" fill="#fcc419" />
          </div>
          <div className="insight-data">
            <h3>{averageRating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <h2 className="section-title">Booking Requests</h2>
        <button className="dashboard-view-all-btn" onClick={() => navigate('/bookings')}>
          View All
        </button>
      </div>

      {/* Table Toolbar */}
      <div className="table-toolbar table-toolbar--narrow">
        <div className="toolbar-left">
          <div className="filter-icon-box">
            <Filter size={18} color="#555" />
          </div>
          <span className="filter-label">Filter By</span>
          
          <div className="toolbar-divider"></div>
          
          {/* Date Dropdown */}
          <div className="toolbar-dropdown date-dropdown-trigger" onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}>
            <span>
              {dateSort === 'newest' ? 'Date' : 'Date: Oldest'}
            </span>
            <ChevronDown 
              size={16} 
              color="#888" 
              style={{ transform: isDateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
            />
            {isDateDropdownOpen && (
              <div className="dashboard-dropdown-menu">
                <div className={`dashboard-dropdown-item ${dateSort === 'newest' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setDateSort('newest'); setIsDateDropdownOpen(false); }}>Date: Newest</div>
                <div className={`dashboard-dropdown-item ${dateSort === 'oldest' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setDateSort('oldest'); setIsDateDropdownOpen(false); }}>Date: Oldest</div>
              </div>
            )}
          </div>

          <div className="toolbar-divider"></div>

          {/* Property Dropdown */}
          <div className="toolbar-dropdown property-dropdown-trigger" onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}>
            <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedProperty || 'Property'}
            </span>
            <ChevronDown 
              size={16} 
              color="#888" 
              style={{ transform: isPropertyDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
            />
            {isPropertyDropdownOpen && (
              <div className="dashboard-dropdown-menu dashboard-dropdown-menu--wide">
                <div className={`dashboard-dropdown-item ${selectedProperty === '' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedProperty(''); setIsPropertyDropdownOpen(false); }}>All Properties</div>
                {uniqueProperties.map(p => (
                  <div key={p} className={`dashboard-dropdown-item ${selectedProperty === p ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setSelectedProperty(p); setIsPropertyDropdownOpen(false); }}>{p}</div>
                ))}
              </div>
            )}
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-search">
            <Search size={18} color="#888" />
            <input type="text" placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
        </div>

        <button className="reset-filter-btn" onClick={handleReset}>
          <RotateCcw size={16} /> Reset Filter
        </button>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Move in Date</th>
              <th>Move out Date</th>
              <th>Property</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="guest-cell">
                      <img src={row.avatar} alt={row.guestName} className="guest-avatar" />
                      <span className="guest-name">{row.guestName}</span>
                    </div>
                  </td>
                  <td>{row.moveIn}</td>
                  <td>{row.moveOut}</td>
                  <td>{row.property}</td>
                  <td>
                    <button className="view-details-btn" onClick={() => handleViewDetails(row)}>View Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  No booking requests found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;