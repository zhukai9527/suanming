import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import WuxingAnalysisPage from './pages/WuxingAnalysisPage';
import BaziDetailsPage from './pages/BaziDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute>
                  <AnalysisPage />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/wuxing" element={
                <ProtectedRoute>
                  <WuxingAnalysisPage />
                </ProtectedRoute>
              } />
              <Route path="/bazi" element={
                <ProtectedRoute>
                  <BaziDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/bazi-details" element={
                <ProtectedRoute>
                  <BaziDetailsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;