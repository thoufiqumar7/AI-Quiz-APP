import RankBadge from './RankBadge';

export default function LeaderboardTable({ rows = [] }) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Accuracy</th>
            <th className="px-4 py-3">Fastest</th>
            <th className="px-4 py-3">Quizzes</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-5 text-center text-slate-500">No leaderboard data yet.</td>
            </tr>
          ) : (
            rows.map((item) => (
              <tr key={`${item.userId}-${item.rank}`} className="border-b border-slate-100 dark:border-slate-800/70">
                <td className="px-4 py-3"><RankBadge rank={item.rank} /></td>
                <td className="px-4 py-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.email}</p>
                </td>
                <td className="px-4 py-3">{item.totalScore ?? item.totalPoints ?? 0}</td>
                <td className="px-4 py-3">{item.averageAccuracy}%</td>
                <td className="px-4 py-3">{item.fastestCompletion || 0}s</td>
                <td className="px-4 py-3">{item.quizzesPlayed}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
