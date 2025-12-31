import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import websocketService from '../services/websocketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const userData = await authService.checkSession();
      setUser(userData);
      
      // Connect to WebSocket if session is valid
      websocketService.connect(() => {
        console.log('WebSocket connected after session check');
      });
    } catch (error) {
      // Session invalid or expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      
      // Connect to WebSocket
      websocketService.connect(() => {
        console.log('WebSocket connected after login');
      });
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const userData = await authService.register(data);
      // Don't set user or connect WebSocket - user needs to verify email first
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    websocketService.disconnect();
    await authService.logout();
    setUser(null);
    localStorage.clear();
    window.location.href = '/#/login';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAuthenticated,
    checkSession,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
