import { Link } from 'react-router-dom';

export default function PremiumFooter() {
  return (
    <footer className="relative mt-20 border-t border-slate-200 bg-slate-50/50 pt-20 dark:border-slate-800 dark:bg-slate-950/50 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -z-10 h-64 w-[80%] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5" />

      <div className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="mb-4 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 text-white shadow-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              SmartQuiz AI
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              The premium AI-powered learning platform designed for students, educators, and lifelong learners.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Product</h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/features" className="hover:text-emerald-500 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-500 transition-colors">Pricing</Link></li>
              <li><Link to="/changelog" className="hover:text-emerald-500 transition-colors">Changelog</Link></li>
              <li><Link to="/docs" className="hover:text-emerald-500 transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Legal</h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-emerald-500 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Social</h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">GitHub</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">Twitter (X)</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">Discord</a></li>
            </ul>
          </div>
          
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} SmartQuiz AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
