import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import XPCard from '../components/gamification/XPCard';
import LevelProgress from '../components/gamification/LevelProgress';
import StreakCard from '../components/gamification/StreakCard';
import BadgeGrid from '../components/gamification/BadgeGrid';
import { useGamification } from '../hooks/useGamification';

export default function GamificationDashboard() {
  const { profile, loadGamificationProfile, loading, errors } = useGamification();

  useEffect(() => {
    loadGamificationProfile().catch(() => {});
  }, [loadGamificationProfile]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Gamification Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Track XP, levels, streaks, rewards, and goals.</p>
      </section>

      {loading.profile ? <Loader text="Loading gamification profile..." /> : null}
      {errors.profile ? <p className="text-sm text-red-500">{errors.profile}</p> : null}

      <div className="grid gap-3 lg:grid-cols-3">
        <XPCard xpPoints={profile?.xpPoints || 0} currentLevel={profile?.currentLevel || 1} />
        <StreakCard
          streakCount={profile?.streakCount || 0}
          longestStreak={profile?.longestStreak || 0}
          lastQuizDate={profile?.lastQuizDate || null}
        />
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500">Weekly Goal</p>
          <p className="mt-2 text-2xl font-bold">
            {profile?.weeklyGoal?.completed || 0}/{profile?.weeklyGoal?.target || 7}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {profile?.weeklyGoal?.remaining || 0} quizzes remaining this week
          </p>
        </section>
      </div>

      <LevelProgress progress={profile?.levelProgress} />
      <BadgeGrid badges={profile?.badges || []} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold">Motivation Message</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {profile?.motivationMessage || 'Take a quiz today to build momentum.'}
        </p>
        <p className="mt-1 text-xs text-slate-500">{profile?.smartReminder || ''}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/achievements"><Button variant="secondary">Achievements</Button></Link>
          <Link to="/challenges"><Button variant="secondary">Daily Challenges</Button></Link>
          <Link to="/share"><Button variant="secondary">Share Profile</Button></Link>
        </div>
      </section>
    </div>
  );
}
