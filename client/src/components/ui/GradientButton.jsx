import { motion } from 'framer-motion';

export default function GradientButton({
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
        group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r
        from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)]
        transition-all duration-300 hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)]
        dark:from-emerald-600 dark:to-teal-600 dark:shadow-[0_8px_20px_rgba(16,185,129,0.2)]
        dark:hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)]
        ${disabled ? 'cursor-not-allowed opacity-70' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
      
      {loading ? (
        <svg className="h-5 w-5 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
