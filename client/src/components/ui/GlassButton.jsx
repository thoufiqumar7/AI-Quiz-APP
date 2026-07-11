import { motion } from 'framer-motion';


export default function GlassButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false,
  icon: Icon
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20
        bg-white/10 px-6 py-3 font-semibold text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur-md
        transition-all duration-300 before:absolute before:inset-0 before:-z-10 before:translate-y-[100%]
        before:bg-white/20 before:transition-transform before:duration-300 hover:before:translate-y-0
        dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-200 dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]
        dark:hover:bg-slate-800/60 dark:before:bg-slate-700/50
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <svg className="h-5 w-5 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="h-5 w-5" />
      ) : null}
      {children}
    </motion.button>
  );
}
