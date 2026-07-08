import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizCard from '../components/quiz/QuizCard';
import QuestionCard from '../components/quiz/QuestionCard';
import Timer from '../components/quiz/Timer';
import ProgressBar from '../components/quiz/ProgressBar';
import QuizNavigation from '../components/quiz/QuizNavigation';
import { useQuiz } from '../hooks/useQuiz';

export default function QuizPage() {
  const {
    hasActiveQuiz,
    questions,
    questionCount,
    currentIndex,
    answers,
    category,
    difficulty,
    timeLeftSec,
    submitting,
    answeredCount,
    setAnswer,
    goToQuestion,
    goNext,
    goPrevious,
    tick,
    submitCurrentQuiz,
  } = useQuiz();

  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!hasActiveQuiz) {
      navigate('/quiz/setup');
    }
  }, [hasActiveQuiz, navigate]);

  if (!hasActiveQuiz) return null;

  const currentQuestion = questions[currentIndex];

  async function handleSubmit(auto = false) {
    if (!auto && answeredCount === 0) {
      setSubmitError('Please answer at least one question before submitting.');
      return;
    }

    setSubmitError('');
    const result = await submitCurrentQuiz({ auto });
    if (result) {
      navigate('/quiz/result');
    }
  }

  return (
    <div className="space-y-4">
      <QuizCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{category?.name} Quiz</h2>
            <p className="text-sm text-slate-500 capitalize">
              {difficulty} mode · {answeredCount}/{questionCount} answered
            </p>
          </div>
          <Timer timeLeftSec={timeLeftSec} onTick={tick} onExpire={() => handleSubmit(true)} />
        </div>

        <div className="mt-4">
          <ProgressBar current={currentIndex + 1} total={questionCount} />
        </div>
      </QuizCard>

      <QuizCard>
        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            selectedOption={answers[currentQuestion.id] ?? null}
            onSelect={(option) => setAnswer(currentQuestion.id, option)}
          />
        ) : null}
      </QuizCard>

      <QuizCard>
        {submitError ? <p className="mb-3 text-sm text-red-500">{submitError}</p> : null}
        <QuizNavigation
          currentIndex={currentIndex}
          total={questionCount}
          onPrevious={goPrevious}
          onNext={goNext}
          onJump={goToQuestion}
          onSubmit={() => handleSubmit(false)}
          submitting={submitting}
        />
      </QuizCard>
    </div>
  );
}
