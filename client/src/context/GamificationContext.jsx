import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  completeDailyChallenge,
  fetchAchievements,
  fetchDailyChallenge,
  fetchGamificationProfile,
  fetchRecommendations,
  generateSharePayload,
} from '../services/gamificationService';

const GamificationContext = createContext(null);

export function GamificationProvider({ children }) {
  const [recommendations, setRecommendations] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [profile, setProfile] = useState(null);
  const [sharePayload, setSharePayload] = useState(null);

  const [loading, setLoading] = useState({
    recommendations: false,
    challenges: false,
    achievements: false,
    profile: false,
    share: false,
  });
  const [errors, setErrors] = useState({});

  const setLoadingKey = useCallback((key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setErrorKey = useCallback((key, value) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadRecommendations = useCallback(async () => {
    setLoadingKey('recommendations', true);
    setErrorKey('recommendations', '');
    try {
      const data = await fetchRecommendations();
      setRecommendations(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load recommendations.';
      setErrorKey('recommendations', message);
      throw error;
    } finally {
      setLoadingKey('recommendations', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadDailyChallenge = useCallback(async () => {
    setLoadingKey('challenges', true);
    setErrorKey('challenges', '');
    try {
      const data = await fetchDailyChallenge();
      setDailyChallenge(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load daily challenge.';
      setErrorKey('challenges', message);
      throw error;
    } finally {
      setLoadingKey('challenges', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const claimDailyChallenge = useCallback(async (challengeId) => {
    setLoadingKey('challenges', true);
    setErrorKey('challenges', '');
    try {
      const result = await completeDailyChallenge(challengeId);
      setDailyChallenge((prev) => (prev ? { ...prev, completed: true } : prev));
      return result;
    } catch (error) {
      const message = error.response?.data?.message || 'Challenge completion failed.';
      setErrorKey('challenges', message);
      throw error;
    } finally {
      setLoadingKey('challenges', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadAchievements = useCallback(async () => {
    setLoadingKey('achievements', true);
    setErrorKey('achievements', '');
    try {
      const data = await fetchAchievements();
      setAchievements(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load achievements.';
      setErrorKey('achievements', message);
      throw error;
    } finally {
      setLoadingKey('achievements', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const loadGamificationProfile = useCallback(async () => {
    setLoadingKey('profile', true);
    setErrorKey('profile', '');
    try {
      const data = await fetchGamificationProfile();
      setProfile(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load gamification profile.';
      setErrorKey('profile', message);
      throw error;
    } finally {
      setLoadingKey('profile', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const createSharePayload = useCallback(async (payload) => {
    setLoadingKey('share', true);
    setErrorKey('share', '');
    try {
      const data = await generateSharePayload(payload);
      setSharePayload(data);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate share payload.';
      setErrorKey('share', message);
      throw error;
    } finally {
      setLoadingKey('share', false);
    }
  }, [setErrorKey, setLoadingKey]);

  const value = useMemo(
    () => ({
      recommendations,
      dailyChallenge,
      achievements,
      profile,
      sharePayload,
      loading,
      errors,
      loadRecommendations,
      loadDailyChallenge,
      claimDailyChallenge,
      loadAchievements,
      loadGamificationProfile,
      createSharePayload,
    }),
    [
      recommendations,
      dailyChallenge,
      achievements,
      profile,
      sharePayload,
      loading,
      errors,
      loadRecommendations,
      loadDailyChallenge,
      claimDailyChallenge,
      loadAchievements,
      loadGamificationProfile,
      createSharePayload,
    ]
  );

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationContext must be used inside GamificationProvider');
  }
  return context;
}
