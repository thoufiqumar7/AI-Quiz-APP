export default function RankBadge({ rank }) {
  if (!rank) {
    return <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-200">N/A</span>;
  }

  const tone =
    rank === 1
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
      : rank <= 3
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200';

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>#{rank}</span>;
}
