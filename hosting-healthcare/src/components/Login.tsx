import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css';
import Logo from './assets/logo.png';

type loginScreen = 'login' | 'reset';

const Login: React.FC = () => {
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
    if (formData.email === MOCK_CREDENTIALS.email && formData.password === MOCK_CREDENTIALS.password) {
      alert("Login Successful! Welcome back.");
    } else {
      alert("Invalid credentials. Try test@gmail.com / password123");
    }
  };

  const handleResetRequest = (e: FormEvent) => {
    e.preventDefault();
    alert(`A password reset link has been sent to ${formData.email}`);
    setScreen('login');
  };

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
              <button className="social-btn">
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="18"/> 
                Google
              </button>
              <button className="social-btn">
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