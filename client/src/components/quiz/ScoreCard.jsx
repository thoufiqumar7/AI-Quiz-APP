import { formatDuration } from '../../utils/quizStorage';

export default function ScoreCard({ result }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
      <Stat label="Base Score" value={result.score} />
      <Stat label="Bonus" value={result.bonusPoints ?? 0} />
      <Stat label="Total Points" value={result.totalPoints ?? result.score} />
      <Stat label="Rank" value={result.rank ? `#${result.rank}` : 'N/A'} />
      <Stat label="Correct" value={result.correctAnswers} />
      <Stat label="Wrong" value={result.wrongAnswers} />
      <Stat label="Accuracy" value={`${result.accuracy}%`} />
      <Stat label="Time" value={formatDuration(result.timeTaken)} />
      <Stat label="Avg/Q" value={`${result.averageTimePerQuestion ?? 0}s`} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
