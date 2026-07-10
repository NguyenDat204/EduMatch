import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';
import { getPageTitle } from '../lib/pageTitles';

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const pageTitle = getPageTitle(location.pathname);
    document.title = `${pageTitle} | EduMatch`;
    trackPageView(pagePath, pageTitle);
  }, [location.hash, location.pathname, location.search]);

  return null;
};
