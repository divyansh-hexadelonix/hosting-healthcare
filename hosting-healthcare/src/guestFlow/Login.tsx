import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../assets/AuthContext';
import './Login.css';
import Logo from '../assets/logo.png';

type loginScreen = 'login' | 'reset';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [screen, setScreen] = useState<loginScreen>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Mock Credentials 
  const MOCK_CREDENTIALS = {
    email: 'test@gmail.com',
    password: 'password123'
  };

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    // 1. Fetch registered users from "Mock Database" (localStorage)
    const storedUsers = localStorage.getItem('hh_users_db');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    // Check if mock user data exists in DB to merge persistence
    const persistedMockUser = users.find((u: any) => u.email === MOCK_CREDENTIALS.email);
    const persistedDavid = users.find((u: any) => u.email === 'david@gmail.com');

    // 2. Combine Hardcoded Mock User with Registered Users
    const allUsers = [
      ...users,
      {
        name: 'Dr. Craig Thomas',
        email: MOCK_CREDENTIALS.email,
        password: MOCK_CREDENTIALS.password,
        profileImage: 'https://img.freepik.com/free-photo/doctor-smiling-with-stethoscope_1154-36.jpg',
        contactNumber: '000 000 0000',
        medicalLicense: 'A029CJ200',
        // Merge persisted data if available
        wishlist: persistedMockUser?.wishlist || [],
        sentRequests: persistedMockUser?.sentRequests || [],
        cancelledRequests: persistedMockUser?.cancelledRequests || []
      },
      {
        name: 'David Beckham',
        email: 'david@gmail.com',
        password: 'password123',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        contactNumber: '000 000 0000',
        medicalLicense: 'A029CJ200',
        wishlist: persistedDavid?.wishlist || [],
        sentRequests: persistedDavid?.sentRequests || [],
        cancelledRequests: persistedDavid?.cancelledRequests || []
      }
    ];

    // 3. Find matching user
    const foundUser = allUsers.find(
      u => u.email === formData.email && u.password === formData.password
    );

    if (foundUser) {
      // 4. Success: Update Global State and Redirect
      login({
        name: foundUser.name,
        email: foundUser.email,
        profileImage: foundUser.profileImage,
        contactNumber: foundUser.contactNumber,
        medicalLicense: foundUser.medicalLicense,
        wishlist: foundUser.wishlist || [],
        sentRequests: foundUser.sentRequests || [],
        cancelledRequests: foundUser.cancelledRequests || []
      });
      alert(`Login Successful! Welcome back, ${foundUser.name}.`);
      navigate('/'); 
    } else {
      alert("Invalid credentials. Try test@gmail.com / password123 or david@gmail.com / password123");
    }
  };

  const handleResetRequest = (e: FormEvent) => {
    e.preventDefault();
    alert(`A password reset link has been sent to ${formData.email}`);
    setScreen('login');
  };

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="login-page-container">
      <div className="login-card">
        <header className="login-header">
          <img src={Logo} alt="Hosting Healthcare" className="logo-img" />
          {screen === 'login' ? (
            <>
              <h1>Hello Guest! Login Here.</h1>
              <p>Welcome back to the app.</p>
            </>
          ) : (
            <>
              <h1>Reset Your Password</h1>
              <p>We will email you a link to reset your password.</p>
            </>
          )}
        </header>

        {screen === 'login' ? (
          /* Login Form */
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Enter Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="test@gmail.com" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="**********" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="forgot-password-link">
              <span onClick={() => setScreen('reset')}>Forgot Password</span>
            </div>

            <button type="submit" className="submit-btn login-btn">Login</button>

            <div className="register-redirect">
              Don't have an account? <Link to = "/signup" className="highlight">Register Now</Link>
            </div>
          </form>
        ) : (
          /* Reset Password Form */
          <form className="login-form" onSubmit={handleResetRequest}>
            <div className="form-group">
              <label>Enter Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="Enter email address" 
                onChange={handleInputChange}
                required 
              />
            </div>

            <button type="submit" className="submit-btn reset-btn">Send Link</button>
            
            <div className="back-to-login">
              <span onClick={() => setScreen('login')}>← Back to Login</span>
            </div>
          </form>
        )}

        {screen === 'login' && (
          <div className="social-login-section">
            <div className="login-divider">
              <span>Or Continue With</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn" type="button">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="18"/> 
                Google
              </button>
              <button className="social-btn" type="button">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" width="18"/> 
                Apple
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;