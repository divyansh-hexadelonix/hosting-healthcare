import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, Search, RotateCcw, ChevronDown } from 'lucide-react';
import { propertiesData, mockBookingRequests } from '../data/propertiesData';
import './Bookings.css';

//Filter toolbar 
interface ToolbarProps {
  searchText: string;
  setSearchText: (v: string) => void;
  selectedProperty: string;
  setSelectedProperty: (v: string) => void;
  dateSort: string;
  setDateSort: (v: string) => void;
  uniqueProperties: string[];
  onReset: () => void;
}

const FilterToolbar: React.FC<ToolbarProps> = ({
  searchText, setSearchText,
  selectedProperty, setSelectedProperty,
  dateSort, setDateSort,
  uniqueProperties, onReset,
}) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [propOpen, setPropOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.bk-date-trigger')) setDateOpen(false);
      if (!t.closest('.bk-prop-trigger'))  setPropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="bk-toolbar">
      <div className="bk-toolbar-left">
        <div className="bk-filter-icon">
          <Filter size={17} color="#555" />
        </div>
        <span className="bk-filter-label">Filter By</span>
        <div className="bk-divider" />

        <div
          className="bk-dropdown bk-date-trigger"
          onClick={() => setDateOpen(!dateOpen)}
        >
          <span>{dateSort === 'newest' ? 'Date' : 'Date: Oldest'}</span>
          <ChevronDown
            size={15}
            color="#888"
            style={{ transform: dateOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
          {dateOpen && (
            <div className="bk-dropdown-menu">
              {['newest', 'oldest'].map(opt => (
                <div
                  key={opt}
                  className={`bk-dropdown-item ${dateSort === opt ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setDateSort(opt); setDateOpen(false); }}
                >
                  Date: {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bk-divider" />

        <div
          className="bk-dropdown bk-prop-trigger"
          onClick={() => setPropOpen(!propOpen)}
        >
          <span className="bk-prop-label">{selectedProperty || 'Property'}</span>
          <ChevronDown
            size={15}
            color="#888"
            style={{ transform: propOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
          {propOpen && (
            <div className="bk-dropdown-menu bk-dropdown-menu--wide">
              <div
                className={`bk-dropdown-item ${selectedProperty === '' ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setSelectedProperty(''); setPropOpen(false); }}
              >
                All Properties
              </div>
              {uniqueProperties.map(p => (
                <div
                  key={p}
                  className={`bk-dropdown-item ${selectedProperty === p ? 'active' : ''}`}
                  onClick={e => { e.stopPropagation(); setSelectedProperty(p); setPropOpen(false); }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bk-divider" />

        <div className="bk-search">
          <Search size={16} color="#aaa" />
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <button className="bk-reset-btn" onClick={onReset}>
        <RotateCcw size={14} />
        Reset Filter
      </button>
    </div>
  );
};

//Booking Requests Table 
interface TableProps {
  rows: any[];
  onViewDetails: (row: any) => void;
  emptyMsg?: string;
}

const BookingTable: React.FC<TableProps & { showStatus?: boolean }> = ({ rows, onViewDetails, emptyMsg, showStatus }) => (
  <div className="bk-table-container">
    <table className="bk-table">
      <thead>
        <tr>
          <th>Guest Name</th>
          <th>Move in Date</th>
          <th>Move out Date</th>
          <th>Property</th>
          {showStatus && <th>Status</th>}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? rows.map(row => (
          <tr key={row.id}>
            <td>
              <div className="bk-guest-cell">
                <img
                  src={row.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={row.guestName}
                  className="bk-avatar"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://randomuser.me/api/portraits/lego/1.jpg'; }}
                />
                <span className="bk-guest-name">{row.guestName}</span>
              </div>
            </td>
            <td>{row.moveIn}</td>
            <td>{row.moveOut}</td>
            <td>{row.property}</td>
            {showStatus && (
              <td>
                <span className={`bk-status-badge bk-status-badge--${(row.status || 'pending').toLowerCase()}`}>
                  {row.status || 'Pending'}
                </span>
              </td>
            )}
            <td>
              <button className="bk-view-btn" onClick={() => onViewDetails(row)}>
                View Details
              </button>
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan={showStatus ? 6 : 5} className="bk-empty-row">
              {emptyMsg || 'No records found.'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

//Main Bookings Page 
const Bookings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Tab: 0 = Booking Requests, 1 = Upcoming Bookings
  const initialTab = (location.state as any)?.tab ?? 0;
  const [activeTab, setActiveTab] = useState<0 | 1>(initialTab);

  const [allRequests, setAllRequests] = useState<any[]>([]);

  // Filter state-Booking Requests tab
  const [brSearch, setBrSearch] = useState('');
  const [brProperty, setBrProperty] = useState('');
  const [brDateSort, setBrDateSort] = useState('newest');

  // Filter state-Upcoming Bookings tab
  const [ubSearch, setUbSearch] = useState('');
  const [ubProperty, setUbProperty] = useState('');
  const [ubDateSort, setUbDateSort] = useState('newest');

  useEffect(() => {
    const stored = localStorage.getItem('hh_host_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Load requests from localStorage + mocks
  const loadRequests = React.useCallback(() => {
    if (!user) return;
    const local: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    const mocks = (mockBookingRequests || []).map((r: any) => ({
      ...r,
      hostName: r.hostName || 'David Beckham',
      hostEmail: r.hostEmail || 'david@gmail.com',
    }));
    const merged = [...local, ...mocks].map((r: any) => ({
      ...r,
      hostName: r.hostName || 'David Beckham',
      hostEmail: r.hostEmail || 'david@gmail.com',
    }));
    const mine = merged.filter(
      (r: any) => r.hostEmail === user.email || r.hostName === user.name
    );
    setAllRequests(mine);
  }, [user]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  useEffect(() => {
    window.addEventListener('focus', loadRequests);
    window.addEventListener('storage', loadRequests);
    window.addEventListener('hh_requests_updated', loadRequests);
    return () => {
      window.removeEventListener('focus', loadRequests);
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener('hh_requests_updated', loadRequests);
    };
  }, [loadRequests]);

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // Booking Requests = all pending 
  const bookingRequests = useMemo(
    () => allRequests.filter(r => {
      const s = (r.status || 'Pending').toLowerCase();
      return s !== 'accepted' && s !== 'cancelled';
    }),
    [allRequests]
  );

  // Upcoming Bookings = accepted only
  const upcomingBookings = useMemo(
    () => allRequests.filter(r => (r.status || '').toLowerCase() === 'accepted'),
    [allRequests]
  );

  // Apply filter+sort helper
  const applyFilter = (data: any[], search: string, property: string, sort: string) => {
    let result = [...data];
    if (search) {
      const lo = search.toLowerCase();
      result = result.filter(r =>
        (r.guestName && r.guestName.toLowerCase().includes(lo)) ||
        (r.property  && r.property.toLowerCase().includes(lo))
      );
    }
    if (property) result = result.filter(r => r.property === property);
    result.sort((a, b) => {
      const parse = (d: string) => {
        if (!d) return 0;
        const p = d.split('-');
        return p.length === 3
          ? new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime()
          : new Date(d).getTime() || 0;
      };
      return sort === 'newest' ? parse(b.moveIn) - parse(a.moveIn) : parse(a.moveIn) - parse(b.moveIn);
    });
    return result;
  };

  const filteredBookingRequests = useMemo(
    () => applyFilter(bookingRequests, brSearch, brProperty, brDateSort),
    [bookingRequests, brSearch, brProperty, brDateSort]
  );

  const filteredUpcoming = useMemo(
    () => applyFilter(upcomingBookings, ubSearch, ubProperty, ubDateSort),
    [upcomingBookings, ubSearch, ubProperty, ubDateSort]
  );

  const uniquePropertiesBR = useMemo(
    () => Array.from(new Set(bookingRequests.map(r => r.property).filter(Boolean))).sort(),
    [bookingRequests]
  );
  const uniquePropertiesUB = useMemo(
    () => Array.from(new Set(upcomingBookings.map(r => r.property).filter(Boolean))).sort(),
    [upcomingBookings]
  );

  const handleViewDetails = (row: any) => {
    const matched = propertiesData.find(p => p.hotelName === row.property);
    navigate('/booking-detail', {
      state: {
        row: {
          ...row,
          propertyImage: matched?.image,
          propertyCity: matched?.city,
          propertyPrice: matched?.price,
        },
      },
    });
  };

  return (
    <div className="bk-page">
      {/*-- Tabs --*/}
      <div className="bk-tabs">
        <button
          className={`bk-tab ${activeTab === 0 ? 'bk-tab--active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          Booking Request
        </button>
        <button
          className={`bk-tab ${activeTab === 1 ? 'bk-tab--active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Upcoming Bookings
        </button>
      </div>

      {/*-- Booking Requests Tab --*/}
      {activeTab === 0 && (
        <>
          <FilterToolbar
            searchText={brSearch}
            setSearchText={setBrSearch}
            selectedProperty={brProperty}
            setSelectedProperty={setBrProperty}
            dateSort={brDateSort}
            setDateSort={setBrDateSort}
            uniqueProperties={uniquePropertiesBR}
            onReset={() => { setBrSearch(''); setBrProperty(''); setBrDateSort('newest'); }}
          />
          <BookingTable
            rows={filteredBookingRequests}
            onViewDetails={handleViewDetails}
            emptyMsg="No pending booking requests found."
          />
        </>
      )}

      {/*-- Upcoming Bookings Tab --*/}
      {activeTab === 1 && (
        <>
          <FilterToolbar
            searchText={ubSearch}
            setSearchText={setUbSearch}
            selectedProperty={ubProperty}
            setSelectedProperty={setUbProperty}
            dateSort={ubDateSort}
            setDateSort={setUbDateSort}
            uniqueProperties={uniquePropertiesUB}
            onReset={() => { setUbSearch(''); setUbProperty(''); setUbDateSort('newest'); }}
          />
          <BookingTable
            rows={filteredUpcoming}
            onViewDetails={handleViewDetails}
            showStatus
            emptyMsg="No upcoming bookings yet. Accept a booking request to see it here."
          />
        </>
      )}
    </div>
  );
};

export default Bookings;