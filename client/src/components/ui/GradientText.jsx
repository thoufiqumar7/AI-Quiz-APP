import { motion } from 'framer-motion';

export default function GradientText({ children, className = '', as = 'span', delay = 0 }) {
  const Component = motion[as] || motion.span;
  
  return (
    <Component
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm ${className}`}
    >
      {children}
    </Component>
  );
}
