import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const EventParticipationRequests = lazy(() => import('./pages/EventParticipationRequests'));
const MyEventRequests = lazy(() => import('./pages/MyEventRequests'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminUniversities = lazy(() => import('./pages/AdminUniversities'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const OAuth2Redirect = lazy(() => import('./pages/OAuth2Redirect'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const Contact = lazy(() => import('./pages/Contact'));
const Support = lazy(() => import('./pages/Support'));
const Chat = lazy(() => import('./pages/Chat'));

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
              {/* Global animated background */}
              <div className="spirit-container">
                <div className="spirit"></div>
                <div className="spirit"></div>
                <div className="spirit"></div>
                <div className="spirit"></div>
              </div>
              <Navbar />
              <ScrollToTop />
              <main className="flex-grow-1" style={{ minHeight: 'calc(100vh - 200px)' }}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:id" element={<BlogDetails />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/badges" element={<Badges />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/guidelines" element={<Guidelines />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/support" element={<Support />} />

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
                  <Route
                    path="/participation-requests"
                    element={
                      <ProtectedRoute>
                        <EventParticipationRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-event-requests"
                    element={
                      <ProtectedRoute>
                        <MyEventRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />

                  {/* Supervisor & Admin Routes */}
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
