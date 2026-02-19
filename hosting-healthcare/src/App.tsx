import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomepageNew from './guestFlow/HomepageNew';   
import BrowseStays from './guestFlow/BrowseStays'; 
import Signup from './guestFlow/Signup';
import Footer from './guestFlow/Footer';
import Header from './guestFlow/Header';
import Login from './guestFlow/Login';
import OTPVerification from './guestFlow/OTPverification';
import { AuthProvider } from './assets/AuthContext';
import MyProfile from './guestFlow/myProfile';
import Wishlist from './guestFlow/Wishlist';
import StayDetails from './guestFlow/StayDetails/StayDetails';
import Gallery from './guestFlow/StayDetails/Gallery';
import MyBookings from './guestFlow/MyBookings';
import Inbox from './guestFlow/Inbox';

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
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/stay-details" element={<StayDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/inbox" element={<Inbox />} />
          {/* Other routes can be added here */}
        </Routes>
        <Footer/>
      </Router>
    </AuthProvider>
  );
}
  

export default App;