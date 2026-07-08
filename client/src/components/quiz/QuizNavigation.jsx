import Button from '../common/Button';

export default function QuizNavigation({
  currentIndex,
  total,
  onPrevious,
  onNext,
  onJump,
  onSubmit,
  submitting,
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            className={`h-8 w-8 rounded-full text-xs font-medium transition ${
              index === currentIndex
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onPrevious} disabled={isFirst}>
          Previous
        </Button>
        <Button type="button" variant="secondary" onClick={onNext} disabled={isLast}>
          Next
        </Button>
        <div className="ml-auto">
          <Button type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      </div>
    </div>
  );
}
