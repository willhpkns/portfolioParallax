import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PageTracker = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const trackPageView = async () => {
      // Skip tracking for admin routes
      if (location.pathname.startsWith('/admin') || isAuthenticated) {
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        await fetch(`${API_BASE_URL}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: window.location.href,
          }),
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    // Track the page view
    trackPageView();
  }, [location.pathname, isAuthenticated]); // Re-run when path or auth state changes

  return null; // This component doesn't render anything
};

export default PageTracker;
