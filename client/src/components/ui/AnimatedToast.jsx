import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function AnimatedToast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md
              ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50/90 dark:border-emerald-800/50 dark:bg-emerald-950/80' : ''}
              ${toast.type === 'error' ? 'border-red-200 bg-red-50/90 dark:border-red-800/50 dark:bg-red-950/80' : ''}
              ${toast.type === 'info' ? 'border-blue-200 bg-blue-50/90 dark:border-blue-800/50 dark:bg-blue-950/80' : ''}
            `}
            layout
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
              {toast.type === 'error' && <XCircleIcon className="h-5 w-5 text-red-500" />}
              {toast.type === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-500" />}
            </div>
            
            <div className="flex-1">
              <h4 className={`text-sm font-semibold 
                ${toast.type === 'success' ? 'text-emerald-900 dark:text-emerald-100' : ''}
                ${toast.type === 'error' ? 'text-red-900 dark:text-red-100' : ''}
                ${toast.type === 'info' ? 'text-blue-900 dark:text-blue-100' : ''}
              `}>
                {toast.title}
              </h4>
              {toast.message && (
                <p className={`mt-1 text-sm 
                  ${toast.type === 'success' ? 'text-emerald-700 dark:text-emerald-300' : ''}
                  ${toast.type === 'error' ? 'text-red-700 dark:text-red-300' : ''}
                  ${toast.type === 'info' ? 'text-blue-700 dark:text-blue-300' : ''}
                `}>
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-lg p-1 opacity-50 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function XMarkIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
