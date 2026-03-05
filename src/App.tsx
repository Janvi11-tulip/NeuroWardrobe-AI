import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';

// Lazy load pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignUpPage = React.lazy(() => import('./pages/SignUpPage'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WardrobePage = React.lazy(() => import('./pages/WardrobePage'));
const StylistPage = React.lazy(() => import('./pages/StylistPage'));
const ShoppingPage = React.lazy(() => import('./pages/ShoppingPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/wardrobe" element={
          <ProtectedRoute>
            <Layout>
              <WardrobePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/stylist" element={
          <ProtectedRoute>
            <Layout>
              <StylistPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/shopping" element={
          <ProtectedRoute>
            <Layout>
              <ShoppingPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </React.Suspense>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
