import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Footer from './components/Footer';
import Header from './components/Header';



function App() {  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<Signup />} />
        {/* Other routes can be added here */}
      </Routes>
      <Footer/>
    </Router>
  );
}
  

export default App;
