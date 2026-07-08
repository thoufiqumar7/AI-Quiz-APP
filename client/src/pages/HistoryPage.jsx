import { useEffect, useState } from 'react';
import QuizCard from '../components/quiz/QuizCard';
import Loader from '../components/common/Loader';
import { fetchQuizHistory } from '../services/quizService';
import { formatDuration } from '../utils/quizStorage';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchQuizHistory();
        setHistory(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Failed to load quiz history.');
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader text="Loading history..." />
      </div>
    );
  }

  return (
    <QuizCard>
      <h2 className="text-2xl font-semibold">Quiz History</h2>
      <p className="mt-1 text-sm text-slate-500">Track previous attempts and performance.</p>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

      <div className="mt-4 space-y-3">
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No attempts yet. Start your first quiz.</p>
        ) : (
          history.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{item.category}</p>
                <p className="text-xs capitalize text-slate-500">{item.difficulty}</p>
              </div>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-4">
                <p>Base: {item.score}</p>
                <p>Bonus: {item.bonusPoints ?? 0}</p>
                <p>Total: {item.totalPoints ?? item.score}</p>
                <p>Rank: {item.rank ? `#${item.rank}` : 'N/A'}</p>
                <p>Accuracy: {item.accuracy}%</p>
                <p>Time: {formatDuration(item.timeTaken)}</p>
                <p>Avg/Q: {item.averageTimePerQuestion ?? 0}s</p>
                <p>Date: {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '-'}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </QuizCard>
  );
}
