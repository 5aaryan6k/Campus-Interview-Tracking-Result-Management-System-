import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Reports from './pages/Reports';

// Protected Route Guard
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ fontSize: '1.2rem' }}>Verifying officer credentials...</div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Main Layout Wrapper
const AppLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main className="main-content">
        {/* Adds padding offset to prevent content overlapping with fixed header */}
        <div style={{ height: 'var(--header-height)' }}></div>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard area */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetail />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>

            {/* Fallback redirects */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
