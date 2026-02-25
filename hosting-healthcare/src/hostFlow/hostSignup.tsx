import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './hostSignup.css';
import Logo from '../assets/logo.png';

interface SignupFormData {
  name: string;
  email: string;
  licenseNumber: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  licenseNumber?: string;
  contactNumber?: string;
  password?: string;
  confirmPassword?: string;
}

const HostSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    licenseNumber: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // License number validation
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "Medical License Number is required.";
    }

    // Contact number validation
    if (!formData.contactNumber || formData.contactNumber.length < 10) {
      newErrors.contactNumber = "Please enter a valid contact number.";
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and include a letter and a number.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contactNumber: value }));
    
    // Clear contact number error
    if (errors.contactNumber) {
      setErrors(prev => ({ ...prev, contactNumber: undefined }));
    }
  };

  const sendOTP = async (phoneNumber: string): Promise<void> => {
    // Simulate sending OTP via SMS/Email
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`OTP sent to ${phoneNumber}`);
        console.log('Generated OTP: 1234 (for demo purposes)');
        resolve();
      }, 1000);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to create account
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send OTP
      await sendOTP(formData.contactNumber);

      console.log("Form Submitted Successfully:", formData);

      // Navigate to OTP verification page with state
      navigate('/host-otp-verification', {
        state: {
          phoneNumber: formData.contactNumber,
          email: formData.email,
          formData: formData
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="signup-container">
      <div className="signup-card">
        <header className="header">
          <div className="logo">
            <img src={Logo} alt="Hosting Healthcare Logo" className='logo-img' />
          </div>
          <h1>Hello Guest! Login Here.</h1>
          <p>Create an account to continue!</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Enter Name</label>
            <input 
              id="name" 
              type="text" 
              name="name" 
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter your name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Enter Email</label>
            <input 
              id="email" 
              type="email" 
              name="email" 
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter email address" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">Medical License Number</label>
            <input 
              id="licenseNumber" 
              type="text" 
              name="licenseNumber" 
              className={errors.licenseNumber ? 'input-error' : ''}
              placeholder="Medical License Number" 
              value={formData.licenseNumber} 
              onChange={handleChange} 
              required 
            />
            {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <PhoneInput
              country={'gb'}
              value={formData.contactNumber}
              onChange={handlePhoneChange}
              containerClass="phone-input-container"
              inputClass={`phone-input-field ${errors.contactNumber ? 'input-error' : ''}`}
              buttonClass="phone-dropdown-btn"
            />
            {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className={errors.password ? 'input-error' : ''}
                placeholder="**********" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                className={errors.confirmPassword ? 'input-error' : ''}
                placeholder="**********" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="continue-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/host-login" className='link-action'>Login</Link>
        </div>

        <div className="divider"><span>Or Continue With</span></div>

        <div className="social-login">
          <button className="social-btn" type="button">
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="18"/> Google
          </button>
          <button className="social-btn" type="button">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width="18"/> Apple
          </button>
        </div>
      </div>
    </div>
  );
};


export default HostSignup;