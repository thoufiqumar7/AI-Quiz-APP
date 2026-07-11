import { motion } from 'framer-motion';

export default function TrustedBy() {
  const logos = [
    { name: 'University of Tech', initials: 'UT' },
    { name: 'EduCorp', initials: 'EC' },
    { name: 'LearnFlow', initials: 'LF' },
    { name: 'StudySync', initials: 'SS' },
    { name: 'Global Academy', initials: 'GA' }
  ];

  return (
    <section className="border-y border-slate-200/50 bg-slate-50/50 py-10 dark:border-slate-800/50 dark:bg-slate-900/20">
      <div className="container mx-auto px-6 text-center">
        <p className="mb-6 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Trusted by innovative educators & students worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale transition-all hover:grayscale-0 dark:opacity-50">
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xl"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 dark:bg-slate-800 text-sm">
                {logo.initials}
              </div>
              <span className="hidden sm:inline-block">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
