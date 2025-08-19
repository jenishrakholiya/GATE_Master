// File: frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import ChallengeListPage from './pages/ChallengeListPage';
import ChallengeAttemptPage from './pages/ChallengeAttemptPage';
import ChallengeResultPage from './pages/ChallengeResultPage';
import LeaderboardPage from './pages/LeaderboardPage';
import InformationZonePage from './pages/InformationZonePage';
import MaterialZonePage from './pages/MaterialZonePage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify/:uidb64/:token" element={<EmailVerificationPage />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/information" element={<InformationZonePage />} />
              
              {/* Private/Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/practice" element={<PracticeZonePage />} />
                <Route path="/practice/quiz/:subject" element={<QuizPage />} />
                <Route path="/challenges" element={<ChallengeListPage />} />
                <Route path="/challenge/attempt/:attemptId" element={<ChallengeAttemptPage />} />
                <Route path="/challenge/result/:attemptId" element={<ChallengeResultPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/materials" element={<MaterialZonePage />} /> 
              </Route>

              {/* Fallback for any other route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;