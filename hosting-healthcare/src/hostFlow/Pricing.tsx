import React, { useState, useEffect } from 'react';
import { CircleCheck } from 'lucide-react';
import './Pricing.css';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h2>Your Plan, Your Way!</h2>
        <p>Choose one option for now. You can explore others later.</p>
        
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
              <span className="price-value">${billingCycle === 'monthly' ? '12.99' : '129.99'}</span>
              <span className="price-period">/{billingCycle === 'monthly' ? 'monthly' : 'yearly'}</span>
            </div>

            <button className="get-started-btn">
              Get started
            </button>
          </div>

          {/* Right: Features List for Basic Plan */}
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
    </div>
  );
};

export default Pricing;
