import Button from '../common/Button';

export default function DailyChallengeCard({ challenge, loading, onComplete }) {
  if (!challenge) {
    return <p className="text-sm text-slate-500">No daily challenge found.</p>;
  }

  const active = new Date(challenge.activeDate);
  active.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expired = active.getTime() < today.getTime();

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-900/20">
      <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Daily Challenge</p>
      <h3 className="mt-2 text-lg font-semibold">{challenge.title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{challenge.description}</p>
      <p className="mt-2 text-sm">
        Category: <strong>{challenge.category?.name}</strong> · Difficulty: <strong className="capitalize">{challenge.difficulty}</strong>
      </p>
      <p className="mt-1 text-xs text-slate-500">Reward: {challenge.rewardXP} XP</p>

      <div className="mt-3">
        {challenge.completed ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Completed</span>
        ) : expired ? (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">Expired</span>
        ) : (
          <Button onClick={onComplete} disabled={loading}>{loading ? 'Claiming...' : 'Claim Reward'}</Button>
        )}
      </div>
    </section>
  );
}
