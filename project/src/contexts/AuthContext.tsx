import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aboutApi, projectApi, educationApi, experienceApi, skillsApi, settingsApi } from '../services/api';
import { analyticsApi } from '../services/analyticsApi';
import { pixelApi } from '../services/pixelApi';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const navigate = useNavigate();

  // Set tokens on all APIs
  const setApiTokens = useCallback((newToken: string | null) => {
    aboutApi.setToken(newToken);
    projectApi.setToken(newToken);
    educationApi.setToken(newToken);
    experienceApi.setToken(newToken);
    skillsApi.setToken(newToken);
    settingsApi.setToken(newToken);
    analyticsApi.setToken(newToken);
    pixelApi.setToken(newToken);
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (!refreshTokenValue || isRefreshing) {
      return false;
    }

    try {
      setIsRefreshing(true);
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setRefreshTokenValue(data.refreshToken);
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        setApiTokens(data.token);
        return true;
      } else {
        // Refresh token is invalid, logout user
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTokenValue, isRefreshing, setApiTokens]);

  // Initialize token state for APIs on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (currentToken && currentRefreshToken) {
      setToken(currentToken);
      setRefreshTokenValue(currentRefreshToken);
      setApiTokens(currentToken);
    }
  }, [setApiTokens]);

  useEffect(() => {
    if (token && refreshTokenValue) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshTokenValue);
      setIsAuthenticated(true);
      setApiTokens(token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setApiTokens(null);
    }
  }, [token, refreshTokenValue, setApiTokens]);

  // Auto-refresh token on expiration
  useEffect(() => {
    if (!token || !refreshTokenValue) return;

    // Set up automatic token refresh
    const checkTokenExpiry = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.expired) {
            // Token expired, try to refresh
            await refreshAccessToken();
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    };

    // Check token every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token, refreshTokenValue, refreshAccessToken]);

  const login = (newToken: string, newRefreshToken: string) => {
    setToken(newToken);
    setRefreshTokenValue(newRefreshToken);
  };

  const logout = useCallback(() => {
    setToken(null);
    setRefreshTokenValue(null);
    navigate('/admin');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      login, 
      logout, 
      refreshToken: refreshAccessToken 
    }}>
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
