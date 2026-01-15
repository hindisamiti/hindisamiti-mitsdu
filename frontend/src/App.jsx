import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { checkAuth } from './utils/auth';

// Import pages
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import './index.css'; // Import global styles
// Protected route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);

  React.useEffect(() => {
    const verifyAuth = async () => {
      const auth = await checkAuth();
      setIsAuthenticated(auth);
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin-login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:blogId" element={<BlogDetails />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;