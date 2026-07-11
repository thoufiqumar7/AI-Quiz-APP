import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "How does the AI Quiz Generator work?",
    answer: "You simply provide a topic, paste a text snippet, or upload a document. Our AI reads the context and dynamically creates questions, correct answers, and plausible distractors to test your understanding."
  },
  {
    question: "Is there a free tier?",
    answer: "Yes, we offer a generous free tier that allows you to generate a set number of quizzes per month. No credit card is required."
  },
  {
    question: "What happens if OpenRouter fails?",
    answer: "Our intelligent ProviderFactory seamlessly falls back to Gemini, and if that is unavailable, to a local AI model. You will rarely notice any downtime."
  },
  {
    question: "Can I track my progress over time?",
    answer: "Absolutely. The Analytics Dashboard provides detailed charts of your performance, tracks XP, and highlights topics you need to review."
  }
];

export default function FAQ() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AccordionItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{faq.question}</span>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 text-slate-600 dark:text-slate-400"
          >
            {faq.answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
