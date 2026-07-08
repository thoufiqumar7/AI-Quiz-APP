import { useEffect } from 'react';
import Loader from '../components/common/Loader';
import AchievementCard from '../components/gamification/AchievementCard';
import { useGamification } from '../hooks/useGamification';

export default function AchievementsPage() {
  const { achievements, loadAchievements, loading, errors } = useGamification();

  useEffect(() => {
    loadAchievements().catch(() => {});
  }, [loadAchievements]);

  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Achievements & Badges</h2>
        <p className="mt-1 text-sm text-slate-500">
          Unlocked {unlockedCount} of {achievements.length} achievements.
        </p>
      </section>

      {loading.achievements ? <Loader text="Loading achievements..." /> : null}
      {errors.achievements ? <p className="text-sm text-red-500">{errors.achievements}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
