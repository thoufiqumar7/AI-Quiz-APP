import { motion } from 'framer-motion';

export default function FloatingCard({ children, className = '', delay = 0, floatDuration = 4 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={`relative ${className}`}
    >
      <motion.div
        animate={{
          y: [-8, 8, -8],
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="h-full w-full rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/30 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      >
        {/* Glow effect behind card */}
        <div className="absolute -inset-4 -z-10 animate-pulse rounded-[2rem] bg-emerald-500/20 blur-2xl dark:bg-emerald-500/10" />
        
        {/* Inner subtle glow */}
        <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
        
        {children}
      </motion.div>
    </motion.div>
  );
}
