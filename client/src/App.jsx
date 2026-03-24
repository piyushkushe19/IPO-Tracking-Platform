import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import useAuthStore from './hooks/useAuthStore';
import wsService from './services/websocket';

// Eagerly loaded
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Lazy loaded pages
const DashboardPage     = lazy(() => import('./pages/DashboardPage'));
const IPOListingsPage   = lazy(() => import('./pages/IPOListingsPage'));
const IPODetailPage     = lazy(() => import('./pages/IPODetailPage'));
const PortfolioPage     = lazy(() => import('./pages/PortfolioPage'));
const WatchlistPage     = lazy(() => import('./pages/WatchlistPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-700/40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, token, refreshUser } = useAuthStore();

  // Initialize WebSocket + auth on app start
  useEffect(() => {
    wsService.connect();
    if (token) refreshUser();
    return () => wsService.disconnect();
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login"    element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />

        {/* Main layout */}
        <Route element={<Layout />}>
          <Route path="/"      element={<DashboardPage />} />
          <Route path="/ipos"  element={<IPOListingsPage />} />
          <Route path="/ipos/:id" element={<IPODetailPage />} />

          {/* Protected */}
          <Route path="/portfolio" element={
            <ProtectedRoute><PortfolioPage /></ProtectedRoute>
          } />
          <Route path="/watchlist" element={
            <ProtectedRoute><WatchlistPage /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={
            <div className="flex flex-col items-center py-24 text-center">
              <div className="text-6xl mb-4">404</div>
              <h2 className="font-display text-xl font-bold text-white">Page not found</h2>
              <p className="text-gray-500 text-sm mt-2 mb-6">The page you're looking for doesn't exist</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}
