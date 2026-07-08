import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuizCard from '../components/quiz/QuizCard';
import ScoreCard from '../components/quiz/ScoreCard';
import Button from '../components/common/Button';
import { useQuiz } from '../hooks/useQuiz';
import { formatDuration } from '../utils/quizStorage';

export default function ResultPage() {
  const { result, clearResult } = useQuiz();
  const navigate = useNavigate();

  const explanationRows = useMemo(() => result?.answers || [], [result]);

  if (!result) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">No Result Available</h2>
        <p className="mt-2 text-sm text-slate-500">Complete a quiz first to see results.</p>
        <div className="mt-4">
          <Link to="/categories"><Button>Start a Quiz</Button></Link>
        </div>
      </section>
    );
  }

  function handleStartNew() {
    clearResult();
    navigate('/categories');
  }

  return (
    <div className="space-y-4">
      <QuizCard>
        <h2 className="text-2xl font-semibold">Quiz Result</h2>
        <p className="mt-1 text-sm text-slate-500 capitalize">
          {result.category} · {result.difficulty} · completed in {formatDuration(result.timeTaken)}
        </p>
        <div className="mt-4">
          <ScoreCard result={result} />
        </div>

        {result.scoreBreakdown ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <p className="font-medium">Score Breakdown</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Base: {result.scoreBreakdown.basePoints} | Speed Bonus: {result.scoreBreakdown.speedBonus} | Accuracy Bonus: {result.scoreBreakdown.accuracyBonus} | Perfect Run Bonus: {result.scoreBreakdown.perfectRunBonus}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Button onClick={handleStartNew}>Start Another Quiz</Button>
          <Link to="/quiz/history"><Button variant="secondary">View History</Button></Link>
          <Link to="/share"><Button variant="secondary">Share Score</Button></Link>
        </div>
      </QuizCard>

      <QuizCard>
        <h3 className="text-lg font-semibold">Question Explanations</h3>
        <div className="mt-4 space-y-3">
          {explanationRows.map((item, index) => (
            <article key={`${item.questionId}-${index}`} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-medium">Q{index + 1}. {item.question}</p>
              <p className="mt-1 text-sm text-slate-500">Topic: {item.topic || 'General'}</p>
              <p className="text-sm text-slate-500">Your answer: {item.selectedOption || 'Not answered'}</p>
              <p className="text-sm text-emerald-500">Correct answer: {item.correctAnswer}</p>
              <p className="mt-1 text-sm">{item.explanation || 'No explanation provided.'}</p>
            </article>
          ))}
        </div>
      </QuizCard>
    </div>
  );
}
