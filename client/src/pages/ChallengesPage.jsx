import { useEffect, useState } from 'react';
import Loader from '../components/common/Loader';
import DailyChallengeCard from '../components/gamification/DailyChallengeCard';
import XPCard from '../components/gamification/XPCard';
import { useGamification } from '../hooks/useGamification';

export default function ChallengesPage() {
  const {
    dailyChallenge,
    profile,
    loadDailyChallenge,
    claimDailyChallenge,
    loadGamificationProfile,
    loading,
    errors,
  } = useGamification();

  const [rewardResult, setRewardResult] = useState(null);

  useEffect(() => {
    loadDailyChallenge().catch(() => {});
    loadGamificationProfile().catch(() => {});
  }, [loadDailyChallenge, loadGamificationProfile]);

  async function handleClaim() {
    if (!dailyChallenge?.id) return;
    try {
      const result = await claimDailyChallenge(dailyChallenge.id);
      setRewardResult(result);
      await loadGamificationProfile();
    } catch (_error) {
      setRewardResult(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Daily Challenges</h2>
        <p className="mt-1 text-sm text-slate-500">Complete today’s challenge and claim XP rewards.</p>
      </section>

      {loading.challenges ? <Loader text="Loading challenge..." /> : null}
      {errors.challenges ? <p className="text-sm text-red-500">{errors.challenges}</p> : null}

      <DailyChallengeCard challenge={dailyChallenge} loading={loading.challenges} onComplete={handleClaim} />

      {rewardResult ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          Reward claimed: +{rewardResult.xp.earned} XP. You are now Level {rewardResult.xp.currentLevel}.
          {(rewardResult.unlockedAchievements || []).length ? (
            <p className="mt-2 text-xs">
              New achievements: {rewardResult.unlockedAchievements.map((item) => item.title).join(', ')}
            </p>
          ) : null}
        </section>
      ) : null}

      <XPCard xpPoints={profile?.xpPoints || 0} currentLevel={profile?.currentLevel || 1} />
    </div>
  );
}
