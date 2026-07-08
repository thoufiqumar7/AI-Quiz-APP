import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Loader from '../components/common/Loader';
import StatisticsGrid from '../components/analytics/StatisticsGrid';
import AccuracyChart from '../components/analytics/AccuracyChart';
import { useAnalytics } from '../hooks/useAnalytics';

export default function AnalyticsDashboard() {
  const { dashboard, performance, loadDashboard, loadPerformance, loading, errors } = useAnalytics();

  useEffect(() => {
    loadDashboard().catch(() => {});
    loadPerformance().catch(() => {});
  }, [loadDashboard, loadPerformance]);

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Your performance summary with trend-based insights.</p>
      </motion.section>

      {loading.dashboard ? <Loader text="Loading dashboard statistics..." /> : null}
      {errors.dashboard ? <p className="text-sm text-red-500">{errors.dashboard}</p> : null}

      <StatisticsGrid dashboard={dashboard} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Accuracy & Points Trend</h3>
        <div className="mt-3">
          {loading.performance ? <Loader text="Loading chart..." /> : <AccuracyChart data={performance?.recentPerformance || []} />}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Smart Insights</h3>
        <ul className="mt-3 space-y-2">
          {(dashboard?.smartInsights || []).length ? (
            dashboard.smartInsights.map((insight) => (
              <li key={insight} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                {insight}
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500">Complete more quizzes to unlock insights.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
