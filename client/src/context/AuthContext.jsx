import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  //import.meta.env.VITE_API_URL || "https://campus-interview-tracking-result.onrender.com";
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.data);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data);
        setLoading(false);
        return true;
      } else {
        setError(data.message || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Server error, please try again later');
      setLoading(false);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setToken(data.data.token);
        setUser(data.data);
        setLoading(false);
        return true;
      } else {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Server error, please try again later');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
