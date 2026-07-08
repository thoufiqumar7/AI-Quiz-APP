import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as adminApi from '../services/adminService';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (operation) => {
    setLoading(true);
    setError('');
    try {
      return await operation();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Admin operation failed.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(() => run(async () => {
    const data = await adminApi.fetchAdminDashboard();
    setDashboard(data);
    return data;
  }), [run]);

  const loadUsers = useCallback((params = {}) => run(async () => {
    const data = await adminApi.fetchAdminUsers(params);
    setUsers(data.users);
    setPagination((prev) => ({ ...prev, users: data.pagination }));
    return data;
  }), [run]);

  const loadQuestions = useCallback((params = {}) => run(async () => {
    const data = await adminApi.fetchAdminQuestions(params);
    setQuestions(data.questions);
    setPagination((prev) => ({ ...prev, questions: data.pagination }));
    return data;
  }), [run]);

  const loadCategories = useCallback(() => run(async () => {
    const data = await adminApi.fetchAdminCategories();
    setCategories(data);
    return data;
  }), [run]);

  const loadChallenges = useCallback(() => run(async () => {
    const data = await adminApi.fetchAdminChallenges();
    setChallenges(data);
    return data;
  }), [run]);

  const loadAchievements = useCallback(() => run(async () => {
    const data = await adminApi.fetchAdminAchievements();
    setAchievements(data);
    return data;
  }), [run]);

  const value = useMemo(() => ({
    dashboard,
    users,
    questions,
    categories,
    challenges,
    achievements,
    pagination,
    loading,
    error,
    run,
    loadDashboard,
    loadUsers,
    loadQuestions,
    loadCategories,
    loadChallenges,
    loadAchievements,
    api: adminApi,
  }), [dashboard, users, questions, categories, challenges, achievements, pagination, loading, error, run, loadDashboard, loadUsers, loadQuestions, loadCategories, loadChallenges, loadAchievements]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminContext must be used inside AdminProvider');
  return context;
}
