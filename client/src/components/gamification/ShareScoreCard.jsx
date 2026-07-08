import { forwardRef } from 'react';

const ShareScoreCard = forwardRef(function ShareScoreCard({ profile, result, achievement, type = 'score' }, ref) {
  const badge = profile?.badges?.[0] || achievement?.title || 'Quiz Challenger';
  const title =
    type === 'achievement'
      ? 'Achievement Spotlight'
      : type === 'profile'
        ? 'Public Profile Snapshot'
        : 'Performance Snapshot';

  return (
    <section
      ref={ref}
      className="w-full max-w-xl rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 text-slate-800 shadow-xl"
    >
      <p className="text-xs uppercase tracking-wide text-emerald-700">SmartQuiz AI</p>
      <h3 className="mt-2 text-2xl font-bold">{title}</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat label="Score" value={type === 'achievement' ? achievement?.xpReward || 0 : result?.totalPoints ?? 0} />
        <Stat label="Accuracy" value={type === 'achievement' ? 'Unlocked' : `${result?.accuracy ?? 0}%`} />
        <Stat label="Rank" value={result?.rank ? `#${result.rank}` : profile?.globalRank ? `#${profile.globalRank}` : 'N/A'} />
        <Stat label="XP" value={profile?.xpPoints ?? 0} />
        <Stat label="Level" value={profile?.currentLevel ?? 1} />
        <Stat label="Badge" value={badge} />
      </div>
    </section>
  );
});

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/80 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default ShareScoreCard;
