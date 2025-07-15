import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import InstructorDashboard from './pages/instructor/dashboard';
import StudentDashboard from './pages/student/dashboard';
import ResponsiveChatbot from './components/Chatbot';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        if (!token || !userJson || userJson === 'undefined') {
          console.log('No valid token or user data found in localStorage');
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(userJson);
        console.log('User from localStorage:', user);

        if (requiredRole && user.role !== requiredRole) {
          console.log('User role does not match required role');
          setIsAuthorized(false);
        } else {
          console.log('User is authorized');
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUserStatus = () => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');

      if (token && userJson && userJson !== 'undefined') {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
          setShowChatbot(userData.role === 'student');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
          setShowChatbot(false);
        }
      } else {
        setUser(null);
        setShowChatbot(false);
      }
    };

    checkUserStatus();

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkUserStatus();
      }
    };

    const handleLoginEvent = () => {
      setTimeout(checkUserStatus, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleLoginEvent);
    window.addEventListener('userLogout', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLoginEvent);
      window.removeEventListener('userLogout', handleLoginEvent);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Instructor Routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Static Pages */}
          <Route path="/about" element={<StaticPage title="About Page" />} />
          <Route path="/contact" element={<StaticPage title="Contact Page" />} />
          <Route path="/help" element={<StaticPage title="Help Center" />} />
          <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
          <Route path="/terms" element={<StaticPage title="Terms of Service" />} />
          <Route path="/faq" element={<StaticPage title="FAQ" />} />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
                <h1 className="mb-4 text-4xl font-bold">404</h1>
                <p className="mb-6 text-xl">Page not found</p>
                <a
                  href="/"
                  className="px-4 py-2 transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Go to Home
                </a>
              </div>
            }
          />
        </Routes>

        {/* Chatbot visible only for student users */}
        {showChatbot && user && <ResponsiveChatbot />}
      </div>
    </Router>
  );
}

// Reusable static page component
const StaticPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-screen text-white">
    {title}
  </div>
);

export default App;
