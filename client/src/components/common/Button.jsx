import { motion } from 'framer-motion';

export default function Button({
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  children,
  ...props
}) {
  const base = 'rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2';
  const width = fullWidth ? 'w-full' : '';
  const palette =
    variant === 'secondary'
      ? 'border border-slate-300 bg-transparent text-slate-800 dark:border-slate-700 dark:text-slate-100'
      : 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-300 disabled:bg-emerald-300';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      disabled={disabled}
      className={`${base} ${width} ${palette}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
