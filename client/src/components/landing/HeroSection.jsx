import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import HeroBadge from '../ui/HeroBadge';
import GradientText from '../ui/GradientText';
import GradientButton from '../ui/GradientButton';
import GlassButton from '../ui/GlassButton';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <HeroBadge text="Introducing SmartQuiz AI 2.0" icon={SparklesIcon} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8"
          >
            The Intelligent Way to <br />
            <GradientText delay={0.2}>Accelerate Learning</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your study materials into adaptive, gamified quizzes instantly. Powered by advanced multi-model AI to provide real-time feedback and deeply personalized learning paths.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <GradientButton fullWidth className="py-3.5 px-8 text-base">
                Start Learning Free
              </GradientButton>
            </Link>
            <Link to="/login?demo=true" className="w-full sm:w-auto">
              <GlassButton fullWidth icon={ArrowRightIcon} className="py-3.5 px-8 text-base">
                Try Demo
              </GlassButton>
            </Link>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm text-slate-500 dark:text-slate-400"
          >
            No credit card required. Free forever tier available.
          </motion.p>

        </div>
      </div>
    </section>
  );
}
