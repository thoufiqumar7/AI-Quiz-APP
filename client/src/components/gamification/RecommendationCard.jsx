export default function RecommendationCard({ title, description, value, tone = 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-300/40 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-900/20'
      : tone === 'warn'
        ? 'border-amber-300/40 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-900/20'
        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';

  return (
    <article className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      {value ? <p className="mt-1 text-lg font-semibold">{value}</p> : null}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </article>
  );
}
