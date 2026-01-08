import React, { createContext, useState, useEffect } from 'react';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        // In a real app, you would check the token validity with the server
        const token = localStorage.getItem('adminToken');
        const userData = localStorage.getItem('adminUser');
        
        if (token && userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedInStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll use a mock implementation
      
      // This is where you would make a fetch/axios request to your backend
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // });
      // const data = await response.json();
      
      // Mock implementation for development
      // In production, replace with actual API call
      if (username === 'admin' && password === 'password') {
        const mockUser = { id: 1, username: 'admin', role: 'admin' };
        const mockToken = 'mock-jwt-token-would-come-from-backend';
        
        // Store auth data in localStorage
        localStorage.setItem('adminToken', mockToken);
        localStorage.setItem('adminUser', JSON.stringify(mockUser));
        
        setCurrentUser(mockUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setCurrentUser(null);
  };

  // Auth context value
  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;