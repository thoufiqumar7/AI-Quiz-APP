import { motion } from 'framer-motion';

export default function XPCard({ xpPoints = 0, currentLevel = 1, totalEarned = null }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-900/20 dark:to-teal-900/20"
    >
      <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">XP Status</p>
      <p className="mt-2 text-3xl font-bold">{xpPoints} XP</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Level {currentLevel}</p>
      {typeof totalEarned === 'number' ? (
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-200">+{totalEarned} earned recently</p>
      ) : null}
    </motion.section>
  );
}
