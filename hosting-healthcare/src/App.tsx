import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Footer from './components/Footer';
import Header from './components/Header';
import Login from './components/Login';
import OTPVerification from './components/OTPverification';



function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-verification" element={<OTPVerification />}/>
        {/* Other routes can be added here */}
      </Routes>
      <Footer/>
    </Router>
  );
}
  

export default App;