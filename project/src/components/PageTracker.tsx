import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTracker = () => {
  const location = useLocation();
  const lastTrackedPath = useRef(location.pathname);

  useEffect(() => {
    const trackPageView = async () => {
      // Don't track if it's the same path (prevents double tracking on initial load)
      if (lastTrackedPath.current === location.pathname) {
        return;
      }

      lastTrackedPath.current = location.pathname;

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
  }, [location.pathname]); // Re-run when path changes

  return null; // This component doesn't render anything
};

export default PageTracker;
