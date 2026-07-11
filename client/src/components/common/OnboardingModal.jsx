import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import GradientButton from '../ui/GradientButton';
import { LightBulbIcon, ChartBarIcon, TrophyIcon, ChatBubbleBottomCenterTextIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    title: 'Welcome to SmartQuiz AI',
    description: 'The intelligent way to accelerate your learning and test your knowledge.',
    icon: LightBulbIcon,
    color: 'emerald'
  },
  {
    title: 'Adaptive Quizzes',
    description: 'Generate quizzes from any topic. Our AI engine scales the difficulty based on your performance.',
    icon: PlayCircleIcon,
    color: 'blue'
  },
  {
    title: 'Deep Analytics',
    description: 'Track your mastery over time. We identify your weak spots so you can focus your study efforts.',
    icon: ChartBarIcon,
    color: 'purple'
  },
  {
    title: 'Earn XP & Achievements',
    description: 'Level up your profile, unlock badges, and compete on the global leaderboard.',
    icon: TrophyIcon,
    color: 'amber'
  }
];

export default function OnboardingModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (user && !localStorage.getItem(`onboarding_completed_${user.email}`)) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.email}`, 'true');
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      handleClose();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Top decorative gradient */}
            <div className={`h-2 w-full bg-gradient-to-r from-${slide.color}-400 to-${slide.color}-600 transition-colors duration-500`} />
            
            <div className="p-8 sm:p-10">
              <div className="flex justify-center mb-8">
                <motion.div
                  key={currentSlide}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-${slide.color}-100 text-${slide.color}-600 dark:bg-${slide.color}-500/20 dark:text-${slide.color}-400`}
                >
                  <Icon className="h-12 w-12" />
                </motion.div>
              </div>

              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                  {slide.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {slide.description}
                </p>
              </motion.div>

              <div className="mt-10 flex items-center justify-between">
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide 
                          ? `w-6 bg-${slide.color}-500` 
                          : 'w-2 bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-4 items-center">
                  <button 
                    onClick={handleClose}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Skip
                  </button>
                  <GradientButton onClick={handleNext} className="!px-6 !py-2">
                    {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                  </GradientButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
