import { useEffect } from 'react';
import { formatDuration } from '../../utils/quizStorage';

export default function Timer({ timeLeftSec, onTick, onExpire }) {
  const danger = timeLeftSec <= 20;

  useEffect(() => {
    if (timeLeftSec <= 0) {
      onExpire?.();
      return undefined;
    }

    const id = setInterval(() => {
      onTick?.();
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeftSec, onTick, onExpire]);

  return (
    <div className={`rounded-lg px-3 py-1 text-sm font-semibold ${danger ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
      Time Left: {formatDuration(timeLeftSec)}
    </div>
  );
}
