import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "This platform completely changed how I study. The AI quizzes target exactly what I need to learn.",
    author: "Sarah J.",
    role: "Medical Student",
  },
  {
    quote: "We use SmartQuiz AI for employee onboarding. The adaptive learning paths save us countless hours.",
    author: "Michael T.",
    role: "HR Director",
  },
  {
    quote: "The analytics are insane. I finally understand which topics I'm weak at before the exams.",
    author: "David K.",
    role: "High School Senior",
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 relative bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Loved by learners everywhere.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex gap-1 mb-6 text-amber-400">
                {[...Array(5)].map((_, idx) => (
                  <svg key={idx} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-6">
                "{t.quote}"
              </blockquote>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{t.author}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
