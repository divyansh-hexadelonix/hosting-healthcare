import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, UserCircle, LogOut, Inbox, Heart, Calendar, Bell, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../assets/AuthContext';
import { useTotalUnread } from '../shared/useUnreadMessages';
import Logo from '../assets/logo.png';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Total unread messages for the current user
  const totalUnread = useTotalUnread(user?.email, 'guest');

  // Guest notification system 
  interface GuestNotification {
    id: string;
    guestEmail: string;
    type: 'accepted' | 'rejected';
    hotelName: string;
    timestamp: string;
    read: boolean;
  }

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [guestNotifs, setGuestNotifs] = useState<GuestNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const formatRelativeTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins   = Math.floor(diff / 60000);
    const hours  = Math.floor(diff / 3600000);
    const days   = Math.floor(diff / 86400000);
    const months = Math.floor(diff / (86400000 * 30));
    if (months >= 1) return `${months}mo ago`;
    if (days >= 1)   return `${days}d ago`;
    if (hours >= 1)  return `${hours}h ago`;
    if (mins >= 1)   return `${mins}m ago`;
    return 'Just now';
  };

  const getGroupLabel = (iso: string): string | null => {
    const date = new Date(iso);
    const now  = new Date();
    const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const ts               = date.getTime();
    if (ts >= startOfToday)     return null;
    if (ts >= startOfYesterday) return 'Yesterday';
    const daysAgo = Math.floor((startOfToday - ts) / 86400000);
    if (daysAgo < 7) return date.toLocaleDateString('en-GB', { weekday: 'long' });
    const sameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
  };

  const loadGuestNotifs = useCallback(() => {
    if (!user?.email) return;
    const all: GuestNotification[] = JSON.parse(localStorage.getItem('hh_guest_notifications') || '[]');
    const mine = all.filter(n => n.guestEmail === user.email);
    mine.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setGuestNotifs(mine);
  }, [user?.email]);

  useEffect(() => { loadGuestNotifs(); }, [loadGuestNotifs]);

  useEffect(() => {
    window.addEventListener('hh_guest_notifications_updated', loadGuestNotifs);
    window.addEventListener('storage', loadGuestNotifs);
    return () => {
      window.removeEventListener('hh_guest_notifications_updated', loadGuestNotifs);
      window.removeEventListener('storage', loadGuestNotifs);
    };
  }, [loadGuestNotifs]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setIsNotifOpen(false);
    };
    if (isNotifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isNotifOpen]);

  const markAllGuestNotifsRead = () => {
    const all: GuestNotification[] = JSON.parse(localStorage.getItem('hh_guest_notifications') || '[]');
    const updated = all.map(n => n.guestEmail === user?.email ? { ...n, read: true } : n);
    localStorage.setItem('hh_guest_notifications', JSON.stringify(updated));
    loadGuestNotifs();
  };

  const markOneGuestNotifRead = (id: string) => {
    const all: GuestNotification[] = JSON.parse(localStorage.getItem('hh_guest_notifications') || '[]');
    const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('hh_guest_notifications', JSON.stringify(updated));
    loadGuestNotifs();
  };

  const handleViewNotif = (n: GuestNotification) => {
    markOneGuestNotifRead(n.id);
    setIsNotifOpen(false);
    navigate('/my-bookings', { state: { defaultTab: 'sent' } });
  };

  const unreadNotifCount = guestNotifs.filter(n => !n.read).length;
  const unreadNotifs = guestNotifs.filter(n => !n.read);
  const readNotifs   = guestNotifs.filter(n => n.read);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Helper to navigate to profile and close menu
  const goToProfile = () => {
    navigate('/my-profile');
    setIsDropdownOpen(false);
  };

  // Helper to determine active class
  const getNavLinkClass = (path: string) => {
    return location.pathname === path ? "nav-item active" : "nav-item";
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img src={Logo} alt="Hosting Healthcare" className="logo-img" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <Link to="/" className={getNavLinkClass('/')}>Home</Link>
          <Link to="/browseStays" className={getNavLinkClass('/browseStays')}>Browse Stays</Link>
          <Link to="/about" className={getNavLinkClass('/about')}>About Us</Link>
          <Link to="/contact" className={getNavLinkClass('/contact')}>Contact Us</Link>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button className="list-property-btn" onClick={() => window.open('/host-login', '_blank')}>
            List Your Property
          </button>

          {/* Guest Notification Bell */}
          {isAuthenticated && (
            <div className="header-notif-wrapper" ref={notifRef}>
              <button
                className={`header-notif-btn ${unreadNotifCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsNotifOpen(prev => !prev)}
                aria-label="Notifications"
              >
                <Bell size={20} color="#555" />
                {unreadNotifCount > 0 && (
                  <span className="header-notif-badge">{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="header-notif-modal">
                  {/* Header */}
                  <div className="header-notif-modal-header">
                    <div className="header-notif-modal-header-left">
                      <h3 className="header-notif-modal-title">Notifications</h3>
                      {unreadNotifCount > 0 && (
                        <span className="header-notif-header-count">{unreadNotifCount}</span>
                      )}
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button className="header-notif-mark-all" onClick={markAllGuestNotifsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="header-notif-modal-body">

                    {guestNotifs.length === 0 && (
                      <div className="header-notif-empty">
                        <div className="header-notif-empty-icon">
                          <Bell size={26} color="#c4b5fd" />
                        </div>
                        <p className="header-notif-empty-title">You're all caught up!</p>
                        <p className="header-notif-empty-sub">Booking updates will appear here.</p>
                      </div>
                    )}

                    {unreadNotifs.length > 0 && (
                      <div className="header-notif-group">
                        <div className="header-notif-group-label">
                          <span>New</span>
                          <span className="header-notif-group-pill">{unreadNotifs.length}</span>
                        </div>
                        {unreadNotifs.map(n => (
                          <div
                            key={n.id}
                            className="header-notif-item header-notif-item--unread"
                            onClick={() => handleViewNotif(n)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="header-notif-unread-dot" />
                            <div className={`header-notif-icon-wrap header-notif-icon-wrap--${n.type}`}>
                              {n.type === 'accepted' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                            </div>
                            <div className="header-notif-content">
                              <p className="header-notif-text">
                                Your booking for <strong>{n.hotelName}</strong> was{' '}
                                <strong className={`header-notif-status--${n.type}`}>
                                  {n.type === 'accepted' ? 'accepted' : 'rejected'}
                                </strong>.
                              </p>
                              <div className="header-notif-meta-row">
                                <span className="header-notif-time">{formatRelativeTime(n.timestamp)}</span>
                                <button
                                  className="header-notif-view-btn"
                                  onClick={e => { e.stopPropagation(); handleViewNotif(n); }}
                                >
                                  View →
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {readNotifs.length > 0 && (
                      <div className={`header-notif-group ${unreadNotifs.length > 0 ? 'header-notif-group--bordered' : ''}`}>
                        {unreadNotifs.length === 0 && (
                          <div className="header-notif-group-label"><span>Earlier</span></div>
                        )}
                        {(() => {
                          let lastLabel: string | null = '__init__';
                          return readNotifs.map(n => {
                            const label = getGroupLabel(n.timestamp);
                            const showLabel = label !== lastLabel;
                            lastLabel = label;
                            return (
                              <React.Fragment key={n.id}>
                                {showLabel && label && (
                                  <div className="header-notif-date-sep">{label}</div>
                                )}
                                <div
                                  className="header-notif-item"
                                  onClick={() => handleViewNotif(n)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className={`header-notif-icon-wrap header-notif-icon-wrap--${n.type} header-notif-icon-wrap--muted`}>
                                    {n.type === 'accepted' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                                  </div>
                                  <div className="header-notif-content">
                                    <p className="header-notif-text header-notif-text--read">
                                      Your booking for <strong>{n.hotelName}</strong> was{' '}
                                      {n.type === 'accepted' ? 'accepted' : 'rejected'}.
                                    </p>
                                    <div className="header-notif-meta-row">
                                      <span className="header-notif-time">{formatRelativeTime(n.timestamp)}</span>
                                      <button
                                        className="header-notif-view-btn"
                                        onClick={e => { e.stopPropagation(); handleViewNotif(n); }}
                                      >
                                        View →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="profile-menu-container" ref={dropdownRef}>
            <button 
              className={`profile-toggle ${isDropdownOpen ? 'active' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Menu size={20} className="menu-icon" />
              {isAuthenticated && user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="header-avatar-small" />
              ) : (
                <UserCircle size={32} className="user-icon" />
              )}
              {/* Unread message badge on profile toggle */}
              {isAuthenticated && totalUnread > 0 && (
                <span className="header-msg-badge">{totalUnread > 9 ? '9+' : totalUnread}</span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {isAuthenticated && user ? (
                  // --- LOGGED IN VIEW  ---
                  <div className="auth-dropdown-content">
                    <div 
                      className="user-profile-header" 
                      onClick={goToProfile}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Use uploaded image or fallback */}
                      <img 
                        src={user.profileImage || "https://ui-avatars.com/api/?background=random&name=" + user.name} 
                        alt={user.name} 
                        className="dropdown-avatar" 
                      />
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                    
                    <ul className="dropdown-links">
                      <li onClick={() => { navigate('/my-bookings'); setIsDropdownOpen(false); }}>
                        <Calendar size={18} /> My Bookings
                      </li>
                      <li onClick={() => { navigate('/inbox'); setIsDropdownOpen(false); }} className="dropdown-link-inbox">
                        <Inbox size={18} /> Inbox
                        {totalUnread > 0 && (
                          <span className="dropdown-msg-badge">{totalUnread > 9 ? '9+' : totalUnread}</span>
                        )}
                      </li>
                      <li onClick={() => { navigate('/wishlist'); setIsDropdownOpen(false); }}>
                        <Heart size={18} /> Wishlist
                      </li>
                    </ul>

                    <div className="dropdown-divider"></div>

                    <div className="sign-out-btn" onClick={handleLogout}>
                      <LogOut size={18} /> Sign Out
                    </div>
                  </div>
                ) : (
                  // --- GUEST VIEW ---
                  <div className="guest-dropdown-content">
                    <Link to="/login" className="dropdown-item">Login</Link>
                    <Link to="/signup" className="dropdown-item">Signup</Link>
                    <div className="dropdown-divider"></div>
                    <Link to="/host-login" className="dropdown-item" target="_blank">Post a Property</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;