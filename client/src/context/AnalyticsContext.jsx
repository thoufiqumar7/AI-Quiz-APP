import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  fetchGlobalLeaderboard,
  fetchMonthlyLeaderboard,
  fetchWeeklyLeaderboard,
} from '../services/leaderboardService';
import {
  fetchAnalyticsDashboard,
  fetchAnalyticsHistory,
  fetchAnalyticsPerformance,
  fetchAnalyticsTopics,
} from '../services/analyticsService';

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [topics, setTopics] = useState(null);
  const [leaderboards, setLeaderboards] = useState({
    global: null,
    weekly: null,
    monthly: null,
  });
  const [loading, setLoading] = useState({
    dashboard: false,
    performance: false,
    history: false,
    topics: false,
    leaderboard: false,
  });

  const [errors, setErrors] = useState({});

  const setLoadingKey = useCallback((key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setErrorKey = useCallback((key, value) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoadingKey('dashboard', true);
    setErrorKey('dashboard', '');
    try {
      const data = await fetchAnalyticsDashboard();
      setDashboard(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load dashboard analytics.';
      setErrorKey('dashboard', message);
      throw error;
    } finally {
      setLoadingKey('dashboard', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadPerformance = useCallback(async () => {
    setLoadingKey('performance', true);
    setErrorKey('performance', '');
    try {
      const data = await fetchAnalyticsPerformance();
      setPerformance(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load performance analytics.';
      setErrorKey('performance', message);
      throw error;
    } finally {
      setLoadingKey('performance', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadHistory = useCallback(async () => {
    setLoadingKey('history', true);
    setErrorKey('history', '');
    try {
      const data = await fetchAnalyticsHistory();
      setHistory(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load analytics history.';
      setErrorKey('history', message);
      throw error;
    } finally {
      setLoadingKey('history', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadTopics = useCallback(async (params = {}) => {
    setLoadingKey('topics', true);
    setErrorKey('topics', '');
    try {
      const data = await fetchAnalyticsTopics(params);
      setTopics(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load topic analytics.';
      setErrorKey('topics', message);
      throw error;
    } finally {
      setLoadingKey('topics', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadLeaderboard = useCallback(async (type = 'global', params = {}) => {
    setLoadingKey('leaderboard', true);
    setErrorKey('leaderboard', '');

    try {
      let data;
      if (type === 'weekly') {
        data = await fetchWeeklyLeaderboard(params);
      } else if (type === 'monthly') {
        data = await fetchMonthlyLeaderboard(params);
      } else {
        data = await fetchGlobalLeaderboard(params);
      }

      setLeaderboards((prev) => ({ ...prev, [type]: data }));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load leaderboard.';
      setErrorKey('leaderboard', message);
      throw error;
    } finally {
      setLoadingKey('leaderboard', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const value = useMemo(
    () => ({
      dashboard,
      performance,
      history,
      topics,
      leaderboards,
      loading,
      errors,
      loadDashboard,
      loadPerformance,
      loadHistory,
      loadTopics,
      loadLeaderboard,
    }),
    [
      dashboard,
      performance,
      history,
      topics,
      leaderboards,
      loading,
      errors,
      loadDashboard,
      loadPerformance,
      loadHistory,
      loadTopics,
      loadLeaderboard,
    ]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used inside AnalyticsProvider');
  }
  return context;
}
