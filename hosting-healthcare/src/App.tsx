import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomepageNew from './components/HomepageNew';   
import BrowseStays from './components/BrowseStays'; 
import Signup from './components/Signup';
import Footer from './components/Footer';
import Header from './components/Header';
import Login from './components/Login';
import OTPVerification from './components/OTPverification';
import { AuthProvider } from './components/assets/AuthContext';
import MyProfile from './components/myProfile';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<HomepageNew />} />
          <Route path='/browseStays' element={<BrowseStays />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verification" element={<OTPVerification />}/>
          <Route path="/my-profile" element={<MyProfile />} />
          {/* Other routes can be added here */}
        </Routes>
        <Footer/>
      </Router>
    </AuthProvider>
  );
}
  

export default App;