import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AnimatedInput({
  label,
  id,
  type = 'text',
  error,
  success,
  icon: Icon,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative mb-4 flex flex-col gap-1.5">
      <label 
        htmlFor={id} 
        className={`text-sm font-medium transition-colors ${
          error ? 'text-red-500' : isFocused ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {label}
      </label>
      
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? 'text-red-400' : isFocused ? 'text-emerald-500' : 'text-slate-400'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full rounded-xl border bg-slate-50/50 py-2.5 text-slate-900 transition-all duration-300
            placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-900/50 dark:text-slate-100
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : error || success ? 'pr-10' : 'pr-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800 dark:focus:border-red-500' 
              : success
                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-800'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-700 dark:focus:border-emerald-500'
            }
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
        
        {!isPassword && (error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="text-xs font-medium text-red-500"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
