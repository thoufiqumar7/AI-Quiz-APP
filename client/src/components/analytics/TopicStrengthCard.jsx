export default function TopicStrengthCard({ title, topics = [], tone = 'good' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-300/40 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-900/20'
      : 'border-rose-300/40 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-900/20';

  return (
    <section className={`rounded-xl border p-4 ${toneClass}`}>
      <h3 className="text-base font-semibold">{title}</h3>
      {topics.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Not enough data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {topics.map((topic) => (
            <li key={topic} className="text-sm">• {topic}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
