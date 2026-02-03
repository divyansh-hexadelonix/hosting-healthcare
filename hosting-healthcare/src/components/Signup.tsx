import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Signup.css';
import Logo from './assets/logo.png';

interface SignupFormData {
  name: string;
  email: string;
  licenseNumber: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Signup: React.FC = () => {
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

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Email regex: basic pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password strength: min 8 chars, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and include a letter and a number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, contactNumber: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Form Submitted Successfully:", formData);
    alert("Account created successfully!");
  };

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
            <input id="name" type="text" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
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
            <input id="licenseNumber" type="text" name="licenseNumber" placeholder="Medical License Number" value={formData.licenseNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <PhoneInput
              country={'gb'}
              value={formData.contactNumber}
              onChange={handlePhoneChange}
              containerClass="phone-input-container"
              inputClass="phone-input-field"
              buttonClass="phone-dropdown-btn"
            />
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
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="**********" value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="continue-btn">Continue</button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Login</a>
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

export default Signup;