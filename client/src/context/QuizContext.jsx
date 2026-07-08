import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { submitQuiz } from '../services/quizService';
import {
  clearActiveQuizState,
  clearLastResult,
  getActiveQuizState,
  getLastResult,
  saveActiveQuizState,
  saveLastResult,
} from '../utils/quizStorage';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [questions, setQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt, setStartedAt] = useState(null);
  const [timeLimitSec, setTimeLimitSec] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [result, setResult] = useState(getLastResult());
  const [submitting, setSubmitting] = useState(false);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const saved = getActiveQuizState();
    if (!saved?.sessionId) return;

    setSessionId(saved.sessionId);
    setCategory(saved.category || null);
    setDifficulty(saved.difficulty || 'easy');
    setQuestions(saved.questions || []);
    setQuestionCount(saved.questionCount || saved.questions?.length || 0);
    setCurrentIndex(saved.currentIndex || 0);
    setAnswers(saved.answers || {});
    setStartedAt(saved.startedAt || null);
    setTimeLimitSec(saved.timeLimitSec || 0);
    setTimeLeftSec(saved.timeLeftSec || 0);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    saveActiveQuizState({
      sessionId,
      category,
      difficulty,
      questions,
      questionCount,
      currentIndex,
      answers,
      startedAt,
      timeLimitSec,
      timeLeftSec,
    });
  }, [
    sessionId,
    category,
    difficulty,
    questions,
    questionCount,
    currentIndex,
    answers,
    startedAt,
    timeLimitSec,
    timeLeftSec,
  ]);

  const initializeQuiz = useCallback((quiz) => {
    autoSubmitRef.current = false;
    setSessionId(quiz.sessionId);
    setCategory(quiz.category);
    setDifficulty(quiz.difficulty);
    setQuestions(quiz.questions);
    setQuestionCount(quiz.questionCount);
    setCurrentIndex(0);
    setAnswers({});
    setStartedAt(quiz.startedAt);
    setTimeLimitSec(quiz.timeLimitSec);
    setTimeLeftSec(quiz.timeLimitSec);
    setResult(null);
    clearLastResult();
  }, []);

  const resetQuiz = useCallback(() => {
    autoSubmitRef.current = false;
    setSessionId(null);
    setCategory(null);
    setDifficulty('easy');
    setQuestions([]);
    setQuestionCount(0);
    setCurrentIndex(0);
    setAnswers({});
    setStartedAt(null);
    setTimeLimitSec(0);
    setTimeLeftSec(0);
    setSubmitting(false);
    clearActiveQuizState();
  }, []);

  const setAnswer = useCallback((questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  }, []);

  const goToQuestion = useCallback((index) => {
    setCurrentIndex((prev) => {
      if (index < 0 || index >= questionCount) return prev;
      return index;
    });
  }, [questionCount]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questionCount - 1));
  }, [questionCount]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const tick = useCallback(() => {
    setTimeLeftSec((prev) => Math.max(prev - 1, 0));
  }, []);

  const submitCurrentQuiz = useCallback(async ({ auto = false } = {}) => {
    if (!sessionId || submitting) return null;
    if (auto && autoSubmitRef.current) return null;

    if (auto) {
      autoSubmitRef.current = true;
    }

    setSubmitting(true);
    try {
      const payloadAnswers = questions.map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id] ?? null,
      }));

      const quizResult = await submitQuiz({
        sessionId,
        answers: payloadAnswers,
      });

      setResult(quizResult);
      saveLastResult(quizResult);
      resetQuiz();
      return quizResult;
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, submitting, questions, answers, resetQuiz]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    clearLastResult();
  }, []);

  const value = useMemo(
    () => ({
      sessionId,
      category,
      difficulty,
      questions,
      questionCount,
      currentIndex,
      answers,
      startedAt,
      timeLimitSec,
      timeLeftSec,
      result,
      submitting,
      answeredCount,
      hasActiveQuiz: Boolean(sessionId && questions.length),
      initializeQuiz,
      resetQuiz,
      setAnswer,
      goToQuestion,
      goNext,
      goPrevious,
      tick,
      submitCurrentQuiz,
      clearResult,
    }),
    [
      sessionId,
      category,
      difficulty,
      questions,
      questionCount,
      currentIndex,
      answers,
      startedAt,
      timeLimitSec,
      timeLeftSec,
      result,
      submitting,
      answeredCount,
      initializeQuiz,
      resetQuiz,
      setAnswer,
      goToQuestion,
      goNext,
      goPrevious,
      tick,
      submitCurrentQuiz,
      clearResult,
    ]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizContext() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used inside QuizProvider');
  }
  return context;
}
