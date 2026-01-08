import { login as apiLogin } from './api';

// Handle admin login
export const login = async (username, password) => {
  try {
    console.log('🔐 Auth: Starting login process');
    
    // Call the login API endpoint
    const response = await apiLogin({ username, password });
    
    console.log('✅ Auth: Login response received:', response);
    
    // The apiLogin function already stores the token, so we just return success
    if (response.success && response.access_token) {
      console.log('✅ Auth: Login successful');
      return true;
    }
    
    console.log('❌ Auth: Login failed - no success flag');
    return false;
  } catch (error) {
    console.error('❌ Auth: Login failed:', error.message);
    throw error; // Re-throw to let the component handle it
  }
};

// Check if user is authenticated
export const checkAuth = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return false;
  }
  
  // Optional: Check token expiration if your token has that info
  const tokenData = parseJwt(token);
  if (tokenData && tokenData.exp && tokenData.exp * 1000 < Date.now()) {
    logout();
    return false;
  }
  
  return true;
};

// Parse JWT token (helper function)
export const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Get current authenticated user info
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('authUser');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Logout
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};

export default { login, checkAuth, getCurrentUser, logout };