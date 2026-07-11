import { motion } from 'framer-motion';

const steps = [
  { number: '01', title: 'Choose a Topic', desc: 'Enter any subject, paste a syllabus, or upload a document.' },
  { number: '02', title: 'AI Generates Quiz', desc: 'Our multi-model engine creates a tailored quiz in seconds.' },
  { number: '03', title: 'Take the Quiz', desc: 'Answer questions in a focused, distraction-free environment.' },
  { number: '04', title: 'Get Analytics', desc: 'Review detailed insights and discover knowledge gaps.' },
  { number: '05', title: 'Improve Learning', desc: 'Receive targeted recommendations and boost your retention.' },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            How SmartQuiz AI Works
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            From raw content to complete mastery in 5 simple steps.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Connector Line */}
          <div className="absolute left-[27px] top-10 h-[calc(100%-80px)] w-0.5 bg-gradient-to-b from-emerald-500/20 via-emerald-500/80 to-emerald-500/20 md:left-1/2 md:-ml-0.5" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                
                {/* Number node */}
                <div className="absolute left-0 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-lg font-bold text-white shadow-lg dark:border-slate-900 md:left-1/2 md:-ml-7">
                  {step.number}
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`ml-20 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                </motion.div>
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
