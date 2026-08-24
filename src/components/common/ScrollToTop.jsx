import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Automatically reset scroll position to top section whenever route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
