import React, { useState, useEffect, useRef } from 'react';
import { Menu, UserCircle } from 'lucide-react';
import Logo from './assets/logo.png';
import './Header.css';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="header-logo">
          <img src={Logo} alt="Hosting Healthcare" className="logo-img" />
        </div>

        {/* Navigation Links */}
        <nav className="header-nav">
          <a href="/" className="nav-item active">Home</a>
          <a href="/browse" className="nav-item">Browse Stays</a>
          <a href="/about" className="nav-item">About Us</a>
          <a href="/contact" className="nav-item">Contact Us</a>
        </nav>

        {/* Action Buttons */}
        <div className="header-actions">
          <button className="list-property-btn">List Your Property</button>
          
          <div className="profile-menu-container" ref={dropdownRef}>
            <button 
              className={`profile-toggle ${isDropdownOpen ? 'active' : ''}`} 
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
            >
              <Menu size={20} className="menu-icon" />
              <UserCircle size={32} className="user-icon" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <a href="/login" className="dropdown-item">Login</a>
                <a href="/signup" className="dropdown-item">Signup</a>
                <div className="dropdown-divider"></div>
                <a href="/post-property" className="dropdown-item">Post a Property</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;