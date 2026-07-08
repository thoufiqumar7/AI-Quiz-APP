import { useEffect } from 'react';
import Loader from '../components/common/Loader';
import PerformanceChart from '../components/analytics/PerformanceChart';
import { useAnalytics } from '../hooks/useAnalytics';

export default function PerformancePage() {
  const { performance, history, loadPerformance, loadHistory, loading, errors } = useAnalytics();

  useEffect(() => {
    loadPerformance().catch(() => {});
    loadHistory().catch(() => {});
  }, [loadPerformance, loadHistory]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Performance Analysis</h2>
        <p className="mt-1 text-sm text-slate-500">Category and difficulty breakdown with attempt trends.</p>
      </section>

      {loading.performance ? <Loader text="Loading performance charts..." /> : null}
      {errors.performance ? <p className="text-sm text-red-500">{errors.performance}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Category Performance</h3>
        <div className="mt-3">
          <PerformanceChart data={performance?.categoryPerformance || []} mode="category" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Difficulty Performance</h3>
        <div className="mt-3">
          <PerformanceChart data={performance?.difficultyPerformance || []} mode="difficulty" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Recent Attempts</h3>
        {loading.history ? (
          <div className="mt-3"><Loader text="Loading attempt history..." /></div>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Difficulty</th>
                  <th className="py-2 pr-3">Accuracy</th>
                  <th className="py-2 pr-3">Points</th>
                  <th className="py-2 pr-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {(history || []).slice(0, 15).map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-3">{new Date(item.completedAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-3">{item.category}</td>
                    <td className="py-2 pr-3 capitalize">{item.difficulty}</td>
                    <td className="py-2 pr-3">{item.accuracy}%</td>
                    <td className="py-2 pr-3">{item.totalPoints}</td>
                    <td className="py-2 pr-3">{item.timeTaken}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
