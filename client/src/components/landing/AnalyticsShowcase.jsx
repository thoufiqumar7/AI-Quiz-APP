import { motion } from 'framer-motion';

export default function AnalyticsShowcase() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
            >
              Understand your performance like never before.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg text-slate-600 dark:text-slate-400"
            >
              Our analytics engine breaks down your quiz results topic by topic. 
              Earn XP, unlock achievements, and climb the leaderboard as you master new subjects.
            </motion.p>

            <motion.ul 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 space-y-4"
            >
              {[
                'Real-time topic mastery tracking',
                'Historical performance charts',
                'Gamified XP and Achievements',
                'Global and Private Leaderboards'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="rounded-full bg-emerald-100 p-1 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl border border-slate-200/50 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 perspective-1000"
            >
              {/* Fake UI Header */}
              <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              {/* Fake UI Body */}
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="h-24 w-1/3 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/10 dark:from-emerald-500/10 dark:to-teal-500/5 border border-emerald-100 dark:border-emerald-800/30" />
                  <div className="h-24 w-1/3 rounded-xl bg-slate-100 dark:bg-slate-800/50" />
                  <div className="h-24 w-1/3 rounded-xl bg-slate-100 dark:bg-slate-800/50" />
                </div>
                <div className="h-48 w-full rounded-xl bg-slate-50 dark:bg-slate-800/30 flex items-end p-4 gap-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full bg-emerald-400 rounded-t-sm opacity-80"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
