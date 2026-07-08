import { useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Loader from '../../components/common/Loader';
import AnalyticsCard from '../../components/analytics/AnalyticsCard';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminDashboard() {
  const { dashboard, loading, error, loadDashboard } = useAdmin();

  useEffect(() => { loadDashboard().catch(() => {}); }, [loadDashboard]);

  if (loading && !dashboard) return <Loader text="Loading admin dashboard..." />;

  const metrics = dashboard?.metrics || {};
  const cards = [
    ['Total users', metrics.totalUsers || 0],
    ['Active users', metrics.activeUsers || 0],
    ['Completed quizzes', metrics.totalQuizzes || 0],
    ['Questions', metrics.totalQuestions || 0],
    ['Categories', metrics.totalCategories || 0],
    ['Achievements', metrics.totalAchievements || 0],
  ];

  return (
    <div className="space-y-4">
      <header><p className="text-sm text-emerald-600">System operations</p><h1 className="text-2xl font-semibold">Admin dashboard</h1></header>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => <AnalyticsCard key={label} label={label} value={value} />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">30-day quiz activity</h2>
          <div className="mt-3 h-72">
            {dashboard?.quizTrends?.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={dashboard.quizTrends}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="date" hide /><YAxis /><Tooltip /><Line type="monotone" dataKey="quizzes" stroke="#10b981" strokeWidth={3} /></LineChart></ResponsiveContainer> : <p className="text-sm text-slate-500">No trend data yet.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold">Top categories</h2>
          <div className="mt-3 h-72">
            {dashboard?.topCategories?.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard.topCategories}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="category" /><YAxis /><Tooltip /><Bar dataKey="attempts" fill="#0ea5e9" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="text-sm text-slate-500">No category activity yet.</p>}
          </div>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold">Leaderboard summary</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-5">
          {(dashboard?.leaderboardSummary || []).map((row) => <div key={row.userId} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">#{row.rank || '-'}</p><p className="truncate font-medium">{row.name}</p><p className="text-xs">{row.totalScore} pts</p></div>)}
        </div>
      </section>
    </div>
  );
}
