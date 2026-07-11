import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { fetchCategories, startQuiz } from '../services/quizService';
import { useQuiz } from '../hooks/useQuiz';

export default function QuizSetupPage() {
  const [searchParams] = useSearchParams();
  const preselectedCategoryId = searchParams.get('categoryId') || '';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [categoryId, setCategoryId] = useState(preselectedCategoryId);
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(10);

  const navigate = useNavigate();
  const { initializeQuiz } = useQuiz();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
        if (!preselectedCategoryId && data[0]) {
          setCategoryId(data[0]._id);
        }
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Failed to load setup data.');
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [preselectedCategoryId]);

  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === categoryId),
    [categories, categoryId]
  );

  async function handleStartQuiz() {
    if (!categoryId) {
      setError('Please choose a category.');
      return;
    }

    setError('');
    setStarting(true);
    try {
      const quiz = await startQuiz({ categoryId, difficulty, count });
      initializeQuiz(quiz);
      navigate('/quiz/play');
    } catch (startError) {
      setError(startError.response?.data?.message || 'Unable to start quiz.');
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader text="Preparing setup..." />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-semibold">Quiz Setup</h2>
      <p className="mt-1 text-sm text-slate-500">Configure your session before starting.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm">Category</label>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 dark:border-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {selectedCategory ? <p className="mt-1 text-xs text-slate-500">{selectedCategory.description}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm">Difficulty</label>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 capitalize dark:border-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">Question Count</label>
          <input
            type="number"
            min={5}
            max={20}
            value={count}
            onChange={(event) => {
              const next = Number(event.target.value) || 5;
              setCount(Math.min(20, Math.max(5, next)));
            }}
            className="w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 dark:border-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <Button type="button" onClick={handleStartQuiz} disabled={starting} fullWidth>
          {starting ? 'Generating Quiz...' : 'Start Quiz'}
        </Button>
      </div>
    </section>
  );
}
