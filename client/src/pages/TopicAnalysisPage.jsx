import { useEffect } from 'react';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import TopicStrengthCard from '../components/analytics/TopicStrengthCard';
import { useAnalytics } from '../hooks/useAnalytics';

export default function TopicAnalysisPage() {
  const { topics, loadTopics, loading, errors } = useAnalytics();

  useEffect(() => {
    loadTopics().catch(() => {});
  }, [loadTopics]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Topic Analysis</h2>
        <p className="mt-1 text-sm text-slate-500">Detect strong and weak areas using rule-based analytics.</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => loadTopics({ refresh: true }).catch(() => {})}>
            Refresh Insights
          </Button>
        </div>
      </section>

      {loading.topics ? <Loader text="Analyzing topic strength..." /> : null}
      {errors.topics ? <p className="text-sm text-red-500">{errors.topics}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TopicStrengthCard title="Strong Topics" topics={topics?.strongTopics || []} tone="good" />
        <TopicStrengthCard title="Weak Topics" topics={topics?.weakTopics || []} tone="weak" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Smart Suggestions</h3>
        <ul className="mt-3 space-y-2">
          {(topics?.smartInsights || []).length ? (
            topics.smartInsights.map((insight) => (
              <li key={insight} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">{insight}</li>
            ))
          ) : (
            <li className="text-sm text-slate-500">No insights available yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
