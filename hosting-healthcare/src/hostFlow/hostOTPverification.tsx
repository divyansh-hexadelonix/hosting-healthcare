import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './hostOTPverification.css';
import Logo from '../assets/logo.png';

interface LocationState {
  phoneNumber: string;
  email: string;
  formData?: any;
}

const HostOTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Redirect if no phone number provided
  useEffect(() => {
    if (!state?.phoneNumber) {
      navigate('/host-signup');
    }
  }, [state, navigate]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Only process if pasted data is 4 digits
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus the last input
      inputRefs.current[3]?.focus();
    }
  };

  // Verify OTP & CREATE USER
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // --- LOGIC FOR PERSISTENCE ---
      // 1. Create User Object
      const newUser = {
        name: state.formData.name,
        email: state.formData.email,
        password: state.formData.password, // Storing for mock login purposes
        contactNumber: state.formData.contactNumber,
        medicalLicense: state.formData.licenseNumber,
        profileImage: "https://img.freepik.com/free-photo/doctor-offering-medical-advice-virtual-appointment_23-2149309824.jpg?w=100", // Default Avatar
        role: 'host'
      };

      // 2. Save to localStorage "Database"
      const existingUsersStr = localStorage.getItem('hh_users_db');
      let existingUsers = [];
      try {
        existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];
        if (!Array.isArray(existingUsers)) existingUsers = [];
      } catch (error) {
        existingUsers = [];
      }
      existingUsers.push(newUser);
      localStorage.setItem('hh_users_db', JSON.stringify(existingUsers));

      // 3. Auto Login
      localStorage.setItem('hh_host_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('hh_host_user_updated'));

      // Success - navigate to home (Header will update automatically)
      alert('OTP Verified! Account created successfully.');
      navigate('/dashboard');
      
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      // Simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Resending OTP to:', state.phoneNumber);
      
      // Reset timer and OTP
      setTimeLeft(30);
      setCanResend(false);
      setOtp(['', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
      
      alert('OTP has been resent to your phone number');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <img src={Logo} alt="Hosting Healthcare Logo" className="otp-logo-img" />
          <h1 className="otp-title">OTP Verification</h1>
          <p className="otp-description">
            Enter the verification code we just sent on your email address.
          </p>
        </div>

        <div className="otp-form">
          <label className="otp-label">Enter OTP</label>
          
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {inputRefs.current[index] = el;}}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`otp-input ${error ? 'otp-input-error' : ''}`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <p className="otp-error-text">{error}</p>}

          <button 
            type="button" 
            className="verify-otp-btn"
            onClick={handleVerifyOTP}
            disabled={isVerifying || otp.join('').length !== 4}
          >
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="otp-timer">
            {formatTime(timeLeft)}
          </div>

          <div className="otp-resend">
            <button 
              type="button"
              className={`resend-link ${canResend ? 'active' : 'disabled'}`}
              onClick={handleResendOTP}
              disabled={!canResend}
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HostOTPVerification;