import { motion } from 'framer-motion';
import AnimatedCard from '../ui/AnimatedCard';
import { SparklesIcon, ChartBarIcon, LightBulbIcon, BoltIcon, DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'AI Quiz Generator',
    description: 'Instantly generate engaging quizzes from any topic, PDF, or text snippet. Our AI understands context and creates relevant distractors.',
    icon: DocumentTextIcon,
    colSpan: 'md:col-span-2 lg:col-span-2',
    color: 'emerald'
  },
  {
    title: 'Adaptive Learning',
    description: 'The platform learns your weaknesses and dynamically adjusts question difficulty.',
    icon: LightBulbIcon,
    colSpan: 'md:col-span-1 lg:col-span-1',
    color: 'amber'
  },
  {
    title: 'Multi-Model AI Engine',
    description: 'Seamlessly switches between OpenRouter, Gemini, and Local AI ensuring 99.9% uptime and zero interruptions.',
    icon: BoltIcon,
    colSpan: 'md:col-span-1 lg:col-span-1',
    color: 'blue'
  },
  {
    title: 'Deep Analytics',
    description: 'Visualize your progress with beautiful charts. Understand your knowledge gaps and track mastery over time.',
    icon: ChartBarIcon,
    colSpan: 'md:col-span-2 lg:col-span-2',
    color: 'purple'
  }
];

export default function AIFeatures() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Everything you need to master any subject.
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            A complete suite of AI tools designed to enhance retention and speed up learning.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
          {features.map((feature, i) => (
            <AnimatedCard 
              key={i} 
              delay={i * 0.1} 
              className={`p-8 group ${feature.colSpan}`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${feature.color}-100 text-${feature.color}-600 dark:bg-${feature.color}-500/20 dark:text-${feature.color}-400 transition-transform group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
