import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          Phase 4 Smart AI + Gamification Live
        </p>
        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
          Learn smarter, compete harder, stay consistent
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Adaptive quiz recommendations, streak rewards, achievement badges, and social share cards are now built in.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/recommendations"><Button>View Smart Recommendations</Button></Link>
              <Link to="/gamification"><Button variant="secondary">Open Gamification Dashboard</Button></Link>
            </>
          ) : (
            <>
              <Link to="/register"><Button>Create Account</Button></Link>
              <Link to="/login"><Button variant="secondary">Login</Button></Link>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
