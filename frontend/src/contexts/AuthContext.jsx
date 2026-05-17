import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [adminId, setAdminId] = useState(() => localStorage.getItem('adminId'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!token;

  const login = async (adminId, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/admin/login', { adminId, password });
      const { token, adminId: returnedId } = res.data;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminId', returnedId);
      setToken(token);
      setAdminId(returnedId);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setToken(null);
    setAdminId(null);
    window.location.href = '/admin/login';
  };

  const verifyToken = async () => {
    if (!token) return false;
    try {
      await api.get('/admin/profile');
      return true;
    } catch {
      logout();
      return false;
    }
  };

  // Called from Settings page after credential update
  const refreshCredentials = (newToken, newAdminId) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminId', newAdminId);
    setToken(newToken);
    setAdminId(newAdminId);
  };

  return (
    <AuthContext.Provider value={{
      token,
      adminId,
      isAuthenticated,
      isLoading,
      error,
      setError,
      login,
      logout,
      verifyToken,
      refreshCredentials
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
