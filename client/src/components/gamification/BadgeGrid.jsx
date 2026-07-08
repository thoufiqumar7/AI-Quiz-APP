export default function BadgeGrid({ badges = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold">Badges</h3>
      {badges.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No badges unlocked yet.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              {badge}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
