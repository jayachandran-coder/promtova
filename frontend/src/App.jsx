import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserAuthProvider } from './contexts/UserAuthContext';
import { DonateProvider } from './contexts/DonateContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import DonateModal from './components/DonateModal';
import ScrollToTop from './components/ScrollToTop';
import useAdminShortcut from './hooks/useAdminShortcut';

// ── Lazy-loaded pages for code splitting & faster initial load ────────────────
const HomePage            = lazy(() => import('./pages/HomePage'));
const ExplorePage         = lazy(() => import('./pages/ExplorePage'));
const RequestsPage        = lazy(() => import('./pages/RequestsPage'));
const RequestDetailPage   = lazy(() => import('./pages/RequestDetailPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const SavedPromptsPage    = lazy(() => import('./pages/SavedPromptsPage'));
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const DonatePage          = lazy(() => import('./pages/DonatePage'));
const CategoryPromptsPage = lazy(() => import('./pages/CategoryPromptsPage'));
const AdminLoginPage      = lazy(() => import('./pages/AdminLoginPage'));

// ── Loading fallback ──────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

// ── JWT-based Admin Route Guard ───────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { isAuthenticated, verifyToken } = useAuth();
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (isAuthenticated) {
        const ok = await verifyToken();
        setValid(ok);
      }
      setChecked(true);
    };
    check();
  }, [isAuthenticated]);

  if (!checked) return <PageLoader />;
  if (!isAuthenticated || !valid) return <Navigate to="/admin/login" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <UserAuthProvider>
      <DonateProvider>
        <Router>
          <ScrollToTop />
          <ShortcutWrapper>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
            <DonateModal />
          </ShortcutWrapper>
        </Router>
      </DonateProvider>
    </UserAuthProvider>
  </AuthProvider>
);

// ── Routes ────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Main Application */}
    <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
    <Route path="/explore" element={<MainLayout><ExplorePage /></MainLayout>} />
    <Route path="/saved" element={<MainLayout><SavedPromptsPage /></MainLayout>} />
    <Route path="/requests" element={<MainLayout><RequestsPage /></MainLayout>} />
    <Route path="/requests/:id" element={<MainLayout><RequestDetailPage /></MainLayout>} />
    <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
    <Route path="/donate" element={<MainLayout><DonatePage /></MainLayout>} />
    <Route path="/category/:categoryName" element={<MainLayout><CategoryPromptsPage /></MainLayout>} />

    {/* User Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Admin */}
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/admin" element={<AdminRoute><AdminDashboardWrapper /></AdminRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const AdminDashboardWrapper = () => {
  const { logout } = useAuth();
  return <AdminLayout onLogout={logout} />;
};

const ShortcutWrapper = ({ children }) => {
  useAdminShortcut();
  return children;
};

export default App;
