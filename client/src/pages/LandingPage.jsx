import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassNavbar from '../components/ui/GlassNavbar';
import PremiumFooter from '../components/ui/PremiumFooter';
import HeroSection from '../components/landing/HeroSection';
import TrustedBy from '../components/landing/TrustedBy';
import AIFeatures from '../components/landing/AIFeatures';
import HowItWorks from '../components/landing/HowItWorks';
import AnalyticsShowcase from '../components/landing/AnalyticsShowcase';
import AIProviderLayer from '../components/landing/AIProviderLayer';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI Engine', href: '#ai' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const navActions = [
    <Link key="login" to="/login" className="text-sm font-semibold text-slate-700 hover:text-emerald-500 dark:text-slate-200">
      Log in
    </Link>,
    <Link key="signup" to="/register" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-white dark:text-slate-900">
      Get Started
    </Link>
  ];

  const Logo = (
    <div className="flex items-center gap-2 font-bold tracking-tight text-slate-900 dark:text-white">
      <span className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 text-white shadow-lg">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
      SmartQuiz AI
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-emerald-500/30 dark:bg-slate-950 dark:text-slate-50">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 -left-1/4 h-[80vh] w-[150vw] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute -top-1/4 -right-1/4 h-[80vh] w-[100vw] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5 mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <GlassNavbar logo={Logo} links={navLinks} actions={navActions} />

      <main className="relative pt-24">
        <HeroSection />
        <TrustedBy />
        <div id="features"><AIFeatures /></div>
        <HowItWorks />
        <div id="analytics"><AnalyticsShowcase /></div>
        <div id="ai"><AIProviderLayer /></div>
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      <PremiumFooter />
    </div>
  );
}
