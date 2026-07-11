import { motion } from 'framer-motion';

export default function LoadingSkeleton({ className = '', variant = 'rectangular', count = 1 }) {
  const getRoundedClass = () => {
    switch (variant) {
      case 'circular': return 'rounded-full';
      case 'text': return 'rounded-md h-4';
      default: return 'rounded-xl';
    }
  };

  const renderSkeleton = (key) => (
    <motion.div
      key={key}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', ease: "easeInOut" }}
      className={`bg-slate-200 dark:bg-slate-800 ${getRoundedClass()} ${className}`}
    />
  );

  if (count === 1) return renderSkeleton(0);
  
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </div>
  );
}
