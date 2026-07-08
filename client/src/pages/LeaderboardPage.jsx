import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import LeaderboardTable from '../components/analytics/LeaderboardTable';
import RankBadge from '../components/analytics/RankBadge';
import { useAnalytics } from '../hooks/useAnalytics';

const tabs = [
  { id: 'global', label: 'Global' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export default function LeaderboardPage() {
  const { leaderboards, loadLeaderboard, loading, errors } = useAnalytics();
  const [tab, setTab] = useState('global');

  useEffect(() => {
    loadLeaderboard(tab, { page: 1, limit: 20 }).catch(() => {});
  }, [tab, loadLeaderboard]);

  const data = leaderboards[tab];

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-2xl font-semibold">Leaderboard</h2>
        <p className="mt-1 text-sm text-slate-500">Compete by score, accuracy, and completion speed.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={tab === item.id ? 'primary' : 'secondary'}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {data?.currentUserRank ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-900/25">
            <span>Your Rank:</span>
            <RankBadge rank={data.currentUserRank} />
          </div>
        ) : null}
      </motion.section>

      {loading.leaderboard ? <Loader text="Loading leaderboard..." /> : null}
      {errors.leaderboard ? <p className="text-sm text-red-500">{errors.leaderboard}</p> : null}

      <LeaderboardTable rows={data?.rows || []} />
    </div>
  );
}
