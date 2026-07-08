export default function QuestionCard({ question, selectedOption, onSelect }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {question.difficulty} difficulty
      </p>
      <h3 className="mt-2 text-lg font-semibold leading-relaxed">{question.question}</h3>

      <div className="mt-4 grid gap-2">
        {question.options.map((option) => {
          const active = selectedOption === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                active
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'border-slate-200 hover:border-emerald-400 dark:border-slate-700'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
