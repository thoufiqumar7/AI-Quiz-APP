import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassButton from './GlassButton';

export default function GlassNavbar({ logo, links = [], actions = [] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'border-b border-slate-200/50 bg-white/70 py-3 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70 shadow-sm' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between gap-8">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo}
          </div>

          {/* Desktop Links */}
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {links.map((link, i) => (
              <Link
                key={i}
                to={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-4 md:flex">
            {actions.map((action, i) => (
              <div key={i}>{action}</div>
            ))}
          </div>

          {/* Mobile Menu Button Placeholder (For a real implementation, use a menu state) */}
          <button className="flex flex-col gap-1.5 p-2 md:hidden">
            <span className="h-0.5 w-6 bg-slate-900 transition-transform dark:bg-slate-100" />
            <span className="h-0.5 w-6 bg-slate-900 transition-transform dark:bg-slate-100" />
            <span className="h-0.5 w-4 bg-slate-900 transition-transform dark:bg-slate-100" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
