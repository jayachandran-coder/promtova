import React, { createContext, useContext, useState, useEffect } from 'react';
import { userLogin, userRegister, getUserProfile } from '../services/api';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('userToken'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getUserProfile();
          setUser(res.data.data); // Backend returns { success: true, data: user }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await userLogin(email, password);
      const { token, ...userData } = res.data;
      localStorage.setItem('userToken', token);
      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await userRegister(userData);
      const { token, ...user } = res.data;
      localStorage.setItem('userToken', token);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <UserAuthContext.Provider value={{
      user,
      setUser,
      token,
      loading,
      login,
      register,
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      isAuthenticated: !!user
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error('useUserAuth must be used within a UserAuthProvider');
  return context;
};
