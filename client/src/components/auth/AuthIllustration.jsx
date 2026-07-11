import { motion } from 'framer-motion';

export default function AuthIllustration({ type = 'login' }) {
  return (
    <div className="relative hidden h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-900 lg:flex">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-slate-900 to-slate-900 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 h-[200%] w-[200%] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-slate-900/0 to-slate-900/0 blur-3xl"
        />
      </div>

      {/* Floating UI Elements */}
      <div className="relative z-10 w-full max-w-lg perspective-1000">
        <motion.div
          initial={{ opacity: 0, rotateY: 15, x: 50 }}
          animate={{ opacity: 1, rotateY: -5, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
        >
          {type === 'login' ? (
            <>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Welcome back</h3>
                  <p className="text-sm text-slate-400">Pick up where you left off</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 w-3/4 rounded bg-slate-800/50" />
                <div className="h-4 w-full rounded bg-slate-800/50" />
                <div className="h-4 w-5/6 rounded bg-slate-800/50" />
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Join the platform</h3>
                  <p className="text-sm text-slate-400">Unlock AI-powered learning</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 rounded-xl bg-slate-800/50" />
                <div className="h-24 rounded-xl bg-slate-800/50" />
              </div>
            </>
          )}
        </motion.div>

        {/* Floating Accent Cards */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-12 -top-12 h-24 w-24 rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md flex items-center justify-center text-emerald-400 text-2xl font-bold"
        >
          A+
        </motion.div>
        
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-8 -left-8 h-20 w-32 rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md p-4"
        >
          <div className="h-2 w-full rounded bg-slate-700 mb-2" />
          <div className="h-2 w-2/3 rounded bg-emerald-500" />
        </motion.div>
      </div>
      
      {/* Quote */}
      <div className="absolute bottom-12 z-10 max-w-md text-center">
        <p className="text-lg font-medium italic text-slate-300">
          "The fastest way to learn is to test yourself. SmartQuiz AI automates the testing so you can focus on the learning."
        </p>
      </div>
    </div>
  );
}
