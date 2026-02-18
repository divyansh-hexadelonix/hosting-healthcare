import React, { useState, useEffect, useRef } from 'react';
import { Menu, UserCircle, LogOut, Inbox, Heart, Calendar } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../assets/AuthContext';
import Logo from '../assets/logo.png';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          <button className="list-property-btn">List Your Property</button>
          
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
                      <li onClick={() => navigate('/my-bookings')}>
                        <Calendar size={18} /> My Bookings
                      </li>
                      <li onClick={() => navigate('/inbox')}>
                        <Inbox size={18} /> Inbox
                      </li>
                      <li onClick={() => navigate('/wishlist')}>
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
                    <Link to="/post-property" className="dropdown-item">Post a Property</Link>
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