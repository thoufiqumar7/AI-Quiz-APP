import { motion } from 'framer-motion';

export default function QuizCard({ children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {children}
    </motion.section>
  );
}
