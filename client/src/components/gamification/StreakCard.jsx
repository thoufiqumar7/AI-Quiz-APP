export default function StreakCard({ streakCount = 0, longestStreak = 0, lastQuizDate = null }) {
  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-900/40 dark:bg-orange-900/20">
      <p className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-300">Streak</p>
      <p className="mt-2 text-2xl font-bold">{streakCount} days</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Longest: {longestStreak} days</p>
      <p className="mt-2 text-xs text-slate-500">
        Last quiz: {lastQuizDate ? new Date(lastQuizDate).toLocaleDateString() : 'N/A'}
      </p>
    </section>
  );
}
