import React, { useState, FormEvent } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import Logo from './assets/logo.png'; 
import './Footer.css';

const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Subscribing email:', email);
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-logo">
            <img src={Logo} alt="Hosting Healthcare" className="logo-img" />
          </div>
          <div className="footer-socials">
            <span>Follow Us</span>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><Facebook size={20} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer"><Twitter size={20} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Middle Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="col-title">Subscribe</h3>
            <form className="subscribe-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your e-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <button type="submit" className="send-btn">
                Send <ArrowRight size={16} />
              </button>
            </form>
            <p className="subscribe-note">
              Subscribe to our newsletter to receive our weekly feed.
            </p>
          </div>

          <div className="footer-col">
            <h3 className="col-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/pricing">Pricing Plans</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="col-title">Contact Us</h3>
            <p className="contact-info">example@hostinghealthcare.com</p>
            <p className="contact-info">(123) 456-7890</p>
          </div>

          <div className="footer-col">
            <h3 className="col-title">Our Address</h3>
            <p className="contact-info">99 Fifth Avenue, 3rd Floor</p>
            <p className="contact-info">San Francisco, CA 1980</p>
          </div>

          <div className="footer-col">
            <h3 className="col-title">Get the app</h3>
            <div className="app-buttons">
              <a href="https://apple.com/app-store" className="app-btn" target="_blank" rel="noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" className="app-icon" />
                <div className="btn-content">
                  <span className="btn-label">Download on the</span>
                  <span className="btn-store">Apple Store</span>
                </div>
              </a>
              <a href="https://play.google.com" className="app-btn" target="_blank" rel="noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" alt="Google Play" className="app-icon" />
                <div className="btn-content">
                  <span className="btn-label">Get it on</span>
                  <span className="btn-store">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p>Copyright © 2025. Hosting Healthcare</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;