// File: frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Layout from './components/Layout'; 
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import DashboardPage from './pages/DashboardPage';
import PracticeZonePage from './pages/PracticeZonePage';
import QuizPage from './pages/QuizPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}> {/* Wrap all routes in the Layout component */}
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify/:uidb64/:token" element={<EmailVerificationPage />} />
            <Route path="/" element={<LandingPage />} />

            {/* Private/Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/practice" element={<PracticeZonePage />} />
              <Route path="/practice/quiz/:subject" element={<QuizPage />} />
            </Route>

            {/* Fallback for any other route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;