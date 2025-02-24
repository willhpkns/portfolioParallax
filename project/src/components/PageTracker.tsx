import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      // Only skip admin routes
      if (location.pathname.startsWith('/admin')) {
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        await fetch(`${API_BASE_URL}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            page: window.location.href,
          }),
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]); // Only re-run when path changes

  return null;
};

export default PageTracker;
