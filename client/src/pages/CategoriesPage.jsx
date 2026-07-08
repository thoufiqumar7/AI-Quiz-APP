import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { fetchCategories } from '../services/quizService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader text="Loading categories..." />
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold">Choose a Quiz Category</h2>
        <p className="text-sm text-slate-500">Select a topic to start building your momentum.</p>
      </div>

      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <motion.article
            key={category._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs uppercase text-emerald-500">{category.icon}</p>
            <h3 className="mt-2 text-lg font-semibold">{category.name}</h3>
            <p className="mt-2 text-sm text-slate-500">{category.description}</p>
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => navigate(`/quiz/setup?categoryId=${category._id}`)}
                fullWidth
              >
                Start Setup
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
