import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aboutApi, projectApi, educationApi, experienceApi, skillsApi, settingsApi } from '../services/api';
import { analyticsApi } from '../services/analyticsApi';
import { pixelApi } from '../services/pixelApi';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const navigate = useNavigate();

  // Initialize token state for APIs on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      setToken(currentToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      // Set token on all content APIs
      aboutApi.setToken(token);
      projectApi.setToken(token);
      educationApi.setToken(token);
      experienceApi.setToken(token);
      skillsApi.setToken(token);
      settingsApi.setToken(token);
      analyticsApi.setToken(token); // Set token for analytics API
      pixelApi.setToken(token); // Set token for pixel API
    } else {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      // Clear token from all content APIs
      aboutApi.setToken(null);
      projectApi.setToken(null);
      educationApi.setToken(null);
      experienceApi.setToken(null);
      skillsApi.setToken(null);
      settingsApi.setToken(null);
      analyticsApi.setToken(null); // Clear token for analytics API
      pixelApi.setToken(null); // Clear token for pixel API
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    navigate('/admin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
