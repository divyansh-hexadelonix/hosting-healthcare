import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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
import GuestInbox from './guestFlow/Guestinbox';
import HostLayout from './hostFlow/Layout';
import Dashboard from './hostFlow/Dashboard';
import BookingDetail from './hostFlow/BookingDetail';
import Bookings from './hostFlow/Bookings';
import Pricing from './hostFlow/Pricing';
import HostInbox from './hostFlow/Hostinbox';
import HostLogin from './hostFlow/hostLogin';
import HostSignup from './hostFlow/hostSignup';
import HostOTPVerification from './hostFlow/hostOTPverification';
import HostMyProfile from './hostFlow/hostMyProfile';
import MyListing from './hostFlow/MyListing';


const GuestLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest Flow Routes */}
          <Route element={<GuestLayout />}>
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
            <Route path="/inbox" element={<GuestInbox />} />
          </Route>

          {/* Host Flow Routes */}
          <Route path="/host-login" element={<HostLogin />} />
          <Route path="/host-signup" element={<HostSignup />}/>
          <Route path="/host-otp-verification" element={<HostOTPVerification />} />
          <Route element={<HostLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-listings" element={<MyListing />} />
            <Route path="/booking-detail" element={<BookingDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/host-inbox" element={<HostInbox />} />
            <Route path="/host-my-profile" element={<HostMyProfile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
  

export default App;