import { motion } from 'framer-motion';
import AnimatedCard from '../ui/AnimatedCard';

export default function AIProviderLayer() {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
          Unbreakable AI Infrastructure
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-16">
          Our intelligent gateway automatically fails over between providers. If one goes down, another takes over instantly. You never stop learning.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
          
          <ProviderCard 
            name="OpenRouter" 
            status="Primary" 
            color="text-blue-400" 
            delay={0}
            active={true}
          />
          
          <div className="hidden md:block">
            <svg className="w-8 h-8 text-slate-600 rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="block md:hidden rotate-90">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          <ProviderCard 
            name="Gemini" 
            status="Failover" 
            color="text-amber-400" 
            delay={0.2}
          />

          <div className="hidden md:block">
            <svg className="w-8 h-8 text-slate-600 rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="block md:hidden rotate-90">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          <ProviderCard 
            name="Local AI" 
            status="Offline Mode" 
            color="text-emerald-400" 
            delay={0.4}
          />

        </div>
      </div>
    </section>
  );
}

function ProviderCard({ name, status, color, delay, active }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`w-full md:w-64 rounded-2xl border p-6 text-center backdrop-blur-md transition-all
        ${active ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-700 bg-slate-800/50'}
      `}
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        {status}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {name}
      </div>
      {active && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Routing Active
        </div>
      )}
    </motion.div>
  );
}
