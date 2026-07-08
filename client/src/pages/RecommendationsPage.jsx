import { useEffect } from 'react';
import Loader from '../components/common/Loader';
import RecommendationCard from '../components/gamification/RecommendationCard';
import { useGamification } from '../hooks/useGamification';

export default function RecommendationsPage() {
  const { recommendations, loadRecommendations, loading, errors } = useGamification();

  useEffect(() => {
    loadRecommendations().catch(() => {});
  }, [loadRecommendations]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Smart Recommendations</h2>
        <p className="mt-1 text-sm text-slate-500">Adaptive suggestions based on your performance trends.</p>
      </section>

      {loading.recommendations ? <Loader text="Building recommendations..." /> : null}
      {errors.recommendations ? <p className="text-sm text-red-500">{errors.recommendations}</p> : null}

      {recommendations ? (
        <div className="grid gap-3 md:grid-cols-2">
          <RecommendationCard
            title="Suggested Difficulty"
            value={recommendations.suggestedDifficulty}
            description={recommendations.adaptiveMessage}
            tone="good"
          />

          <RecommendationCard
            title="Prediction"
            value={`${recommendations.performancePrediction?.nextQuizAccuracy ?? 0}%`}
            description={`Predicted next quiz accuracy (${recommendations.performancePrediction?.confidence || 'low'} confidence).`}
            tone="neutral"
          />

          <RecommendationCard
            title="Ranking Highlight"
            value={recommendations.socialHighlights?.globalRank ? `#${recommendations.socialHighlights.globalRank}` : 'Unranked'}
            description={recommendations.socialHighlights?.highlight || 'Keep practicing to climb the rankings.'}
            tone="good"
          />

          <RecommendationCard
            title="Recommended Categories"
            description={(recommendations.recommendedCategories || []).join(', ') || 'No category recommendation yet.'}
            tone="good"
          />

          <RecommendationCard
            title="Weak Area Focus"
            description={(recommendations.weakAreaQuizzes || []).join(', ') || 'No weak category detected yet.'}
            tone="warn"
          />
        </div>
      ) : (
        <p className="text-sm text-slate-500">No recommendations available yet.</p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Practice Topics</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(recommendations?.practiceTopics || []).length ? (
            recommendations.practiceTopics.map((topic) => (
              <span key={topic} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                {topic}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">No weak topics detected yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">AI-like Suggestions</h3>
        <ul className="mt-3 space-y-2">
          {(recommendations?.smartSuggestions || []).length ? (
            recommendations.smartSuggestions.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                {item}
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500">Complete more quizzes to unlock smarter suggestions.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
