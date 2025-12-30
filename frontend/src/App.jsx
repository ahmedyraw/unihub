import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';
import { USER_ROLES } from './utils/constants';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';

// Lazy load other pages for better performance
import { lazy, Suspense } from 'react';

const EventDetails = lazy(() => import('./pages/EventDetails'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const EditEvent = lazy(() => import('./pages/EditEvent'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const CreateBlog = lazy(() => import('./pages/CreateBlog'));
const EditBlog = lazy(() => import('./pages/EditBlog'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Badges = lazy(() => import('./pages/Badges'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const MyEvents = lazy(() => import('./pages/MyEvents'));
const MyBlogs = lazy(() => import('./pages/MyBlogs'));
const EventApprovals = lazy(() => import('./pages/EventApprovals'));
const BlogApprovals = lazy(() => import('./pages/BlogApprovals'));
const Reports = lazy(() => import('./pages/Reports'));
const EventRequests = lazy(() => import('./pages/EventRequests'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminUniversities = lazy(() => import('./pages/AdminUniversities'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <ScrollToTop />
              <main className="flex-grow-1">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:id" element={<BlogDetails />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/badges" element={<Badges />} />

                  {/* Protected Routes - All Authenticated Users */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/new"
                    element={
                      <ProtectedRoute>
                        <CreateEvent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditEvent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blogs/new"
                    element={
                      <ProtectedRoute>
                        <CreateBlog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blogs/:id/edit"
                    element={
                      <ProtectedRoute>
                        <EditBlog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-events"
                    element={
                      <ProtectedRoute>
                        <MyEvents />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-blogs"
                    element={
                      <ProtectedRoute>
                        <MyBlogs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:id"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Supervisor & Admin Routes */}
                  <Route
                    path="/event-requests"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN]}>
                        <EventRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/approvals"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN]}>
                        <EventApprovals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/blogs/approvals"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN]}>
                        <BlogApprovals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN]}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Routes */}
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/universities"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                        <AdminUniversities />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Not Found */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <BackToTop />
          </div>
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
