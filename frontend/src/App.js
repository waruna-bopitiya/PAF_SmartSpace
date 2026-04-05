import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import AuthSuccess from './pages/AuthSuccess'; // AuthSuccess component eka import karanna
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Mewa ProtectedRoute ekakin cover karanne na */}
          <Route path="/login" element={<Login />} />
          
          {/* Google Login eken passe token eka save karana thana (Meka Public thiyenna ona) */}
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* Protected Routes - Mewa okkoma authentication ona */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Layout>
                  <Resources />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bookings />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tickets />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Wena ona path ekaka giyoth Home (Dashboard) ekata redirect karanna */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;