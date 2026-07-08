import AnalyticsCard from './AnalyticsCard';

export default function StatisticsGrid({ dashboard }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AnalyticsCard label="Total Quizzes" value={dashboard?.totalQuizzes ?? 0} />
      <AnalyticsCard label="Average Accuracy" value={`${dashboard?.averageAccuracy ?? 0}%`} />
      <AnalyticsCard label="Total Score" value={dashboard?.totalScore ?? 0} />
      <AnalyticsCard label="Best Category" value={dashboard?.bestCategory || 'N/A'} />
      <AnalyticsCard label="Weak Category" value={dashboard?.weakCategory || 'N/A'} />
      <AnalyticsCard
        label="Avg Time / Question"
        value={`${dashboard?.averageTimePerQuestion ?? 0}s`}
      />
    </div>
  );
}
