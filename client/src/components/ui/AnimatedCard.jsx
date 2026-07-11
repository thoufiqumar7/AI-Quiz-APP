import { motion } from 'framer-motion';

export default function AnimatedCard({ children, className = '', delay = 0, hover = true, padding = 'p-6' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`
        relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur-md
        transition-shadow duration-300 dark:border-slate-800 dark:bg-slate-900/50
        ${hover ? 'hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]' : ''}
        ${padding}
        ${className}
      `}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
      {children}
    </motion.div>
  );
}
