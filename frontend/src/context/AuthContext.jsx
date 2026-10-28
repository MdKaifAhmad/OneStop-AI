import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('onestop_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check current user on initial load
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.warn('Token expired or invalid, logging out guest state');
        localStorage.removeItem('onestop_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('onestop_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setIsAuthModalOpen(false);
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await API.post('/auth/signup', { name, email, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('onestop_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setIsAuthModalOpen(false);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('onestop_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
