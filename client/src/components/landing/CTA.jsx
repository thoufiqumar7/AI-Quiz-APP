import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GradientButton from '../ui/GradientButton';

export default function CTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-900" />
      
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-emerald-500/20 blur-[150px] mix-blend-screen" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-500/20 blur-[150px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto rounded-[3rem] border border-white/10 bg-white/5 p-12 backdrop-blur-2xl shadow-2xl"
        >
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
            Ready to ace your next exam?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of smart learners who use AI to study faster, retain more, and stress less.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <GradientButton fullWidth className="py-4 px-10 text-lg">
                Create Free Account
              </GradientButton>
            </Link>
            <Link to="/login?demo=true" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-xl border border-white/20 bg-white/10 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/20">
                Try Interactive Demo
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
