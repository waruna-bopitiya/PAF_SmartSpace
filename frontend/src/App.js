import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Resources from './pages/Resources';
import Bookings from './pages/Bookings';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthSuccess from './pages/AuthSuccess';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 1. Public Routes - Mewa ProtectedRoute ekakin cover karanne na */}
          <Route path="/login" element={<Login />} />
          
          {/* Google Login iwara wela token eka save karanna ena path eka */}
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            }
          />

          {/* 2. Protected Routes - Mewa authenticated ayaata witharay */}
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

          {/* 3. Catch-all - Wena ona path ekakata giyoth root (/) ekata yawanna */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;