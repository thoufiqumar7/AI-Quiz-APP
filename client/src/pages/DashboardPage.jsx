import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { useGamification } from '../hooks/useGamification';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import OnboardingModal from '../components/common/OnboardingModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const { dashboard, loadDashboard, loading } = useAnalytics();
  const { profile, loadGamificationProfile } = useGamification();

  useEffect(() => {
    loadDashboard().catch(() => {});
    loadGamificationProfile().catch(() => {});
  }, [loadDashboard, loadGamificationProfile]);

  return (
    <div className="space-y-6">
      <OnboardingModal />
      <section className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 md:col-span-2"
        >
          <h2 className="text-2xl font-semibold">Welcome, {user?.name}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Train with adaptive quiz recommendations, unlock achievements, and share your performance snapshots.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/categories"><Button>Start Quiz</Button></Link>
            <Link to="/recommendations"><Button variant="secondary">Smart Recommendations</Button></Link>
            <Link to="/challenges"><Button variant="secondary">Daily Challenge</Button></Link>
            <Link to="/share"><Button variant="secondary">Share Card</Button></Link>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Quick Snapshot</h3>
          {loading.dashboard || !profile ? (
            <div className="mt-3"><Loader text="Loading stats..." /></div>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Level</dt>
                <dd>{profile.currentLevel}</dd>
              </div>
              <div>
                <dt className="text-slate-500">XP</dt>
                <dd>{profile.xpPoints}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Streak</dt>
                <dd>{profile.streakCount} days</dd>
              </div>
              <div>
                <dt className="text-slate-500">Average Accuracy</dt>
                <dd>{dashboard?.averageAccuracy ?? 0}%</dd>
              </div>
            </dl>
          )}
        </div>
      </section>
    </div>
  );
}
