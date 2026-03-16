import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import useAuthStore from './store/authStore';

// Existing pages
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Login from './pages/Login';
import Register from './pages/Register';

// New pages (lazy-loaded for performance)
const Wallet = lazy(() => import('./pages/Wallet'));
const Markets = lazy(() => import('./pages/Markets'));
const Futures = lazy(() => import('./pages/Futures'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Analytics = lazy(() => import('./pages/Analytics'));
const CopyTrading = lazy(() => import('./pages/CopyTrading'));
const Mobile = lazy(() => import('./pages/Mobile'));
const Settings = lazy(() => import('./pages/Settings'));
const Airdrop = lazy(() => import('./pages/Airdrop'));
const Admin = lazy(() => import('./pages/Admin'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppRoutes() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="trade/:pair" element={<PageTransition><Trade /></PageTransition>} />
          <Route path="login" element={user ? <Navigate to="/" replace /> : <PageTransition><Login /></PageTransition>} />
          <Route path="register" element={user ? <Navigate to="/" replace /> : <PageTransition><Register /></PageTransition>} />
          <Route path="markets" element={<PageTransition><Suspense fallback={<LoadingFallback />}><Markets /></Suspense></PageTransition>} />
          <Route path="futures" element={<ProtectedRoute><PageTransition><Suspense fallback={<LoadingFallback />}><Futures /></Suspense></PageTransition></ProtectedRoute>} />
          <Route path="portfolio" element={<ProtectedRoute><PageTransition><Suspense fallback={<LoadingFallback />}><Portfolio /></Suspense></PageTransition></ProtectedRoute>} />
          <Route path="wallet" element={<ProtectedRoute><PageTransition><Suspense fallback={<LoadingFallback />}><Wallet /></Suspense></PageTransition></ProtectedRoute>} />
          <Route path="analytics" element={<PageTransition><Suspense fallback={<LoadingFallback />}><Analytics /></Suspense></PageTransition>} />
          <Route path="copy-trading" element={<PageTransition><Suspense fallback={<LoadingFallback />}><CopyTrading /></Suspense></PageTransition>} />
          <Route path="mobile" element={<PageTransition><Suspense fallback={<LoadingFallback />}><Mobile /></Suspense></PageTransition>} />
          <Route path="settings" element={<ProtectedRoute><PageTransition><Suspense fallback={<LoadingFallback />}><Settings /></Suspense></PageTransition></ProtectedRoute>} />
          <Route path="airdrop" element={<PageTransition><Suspense fallback={<LoadingFallback />}><Airdrop /></Suspense></PageTransition>} />
          <Route path="admin" element={<ProtectedRoute><PageTransition><Suspense fallback={<LoadingFallback />}><Admin /></Suspense></PageTransition></ProtectedRoute>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
