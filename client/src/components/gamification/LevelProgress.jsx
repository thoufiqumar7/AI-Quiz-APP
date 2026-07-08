export default function LevelProgress({ progress }) {
  if (!progress) {
    return <p className="text-sm text-slate-500">Level progress unavailable.</p>;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>Progress to next level</span>
        <span>{progress.progressPercent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress.progressPercent}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {progress.inLevelXP}/{progress.requiredXP} XP in current level
      </p>
    </section>
  );
}
