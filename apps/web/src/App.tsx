import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ItineraryDetailPage from '@/pages/ItineraryDetailPage';
import PublicItinerariesPage from '@/pages/PublicItinerariesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/public" element={<PublicItinerariesPage />} />
          <Route path="/itinerary/:id" element={<ItineraryDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

