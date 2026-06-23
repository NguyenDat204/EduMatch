import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { identifyAnalyticsUser, initAnalytics, trackPageView } from '../services/analytics';
import { useAuth } from '../hooks/useAuth';

export const AnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    trackPageView(path);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const userId = user?._id || user?.email;
    if (!userId) return;

    identifyAnalyticsUser(userId, {
      role: user.role,
      is_pro: !!user.isPro,
      grade: user.academicInfo?.grade,
    });
  }, [user]);

  return null;
};
