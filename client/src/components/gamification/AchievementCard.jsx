import { motion } from 'framer-motion';

export default function AchievementCard({ achievement }) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-4 transition ${
        achievement.unlocked
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{achievement.title}</h3>
        <span className="text-xs">{achievement.icon}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{achievement.description}</p>
      <p className="mt-2 text-xs text-slate-500">Reward: {achievement.xpReward} XP</p>
      <p className="mt-1 text-xs">
        {achievement.unlocked
          ? `Unlocked on ${new Date(achievement.unlockedAt).toLocaleDateString()}`
          : 'Locked'}
      </p>
    </motion.article>
  );
}
