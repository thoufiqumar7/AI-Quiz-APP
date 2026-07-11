import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PasswordStrength({ password }) {
  const [strength, setStrength] = useState(0);

  // Calculate strength based on criteria
  const checkStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  // Update on password change
  useState(() => {
    setStrength(checkStrength(password));
  }, [password]);

  const getColor = (s) => {
    if (s === 0) return 'bg-slate-200 dark:bg-slate-700';
    if (s <= 2) return 'bg-red-400';
    if (s === 3) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const getLabel = (s) => {
    if (s === 0) return 'Very Weak';
    if (s <= 2) return 'Weak';
    if (s === 3) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 flex flex-col gap-1"
    >
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              strength >= level ? getColor(strength) : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 text-right font-medium">
        {getLabel(strength)}
      </p>
    </motion.div>
  );
}
