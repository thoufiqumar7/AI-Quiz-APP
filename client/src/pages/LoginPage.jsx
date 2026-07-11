import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import AuthIllustration from '../components/auth/AuthIllustration';
import AnimatedInput from '../components/ui/AnimatedInput';
import GradientButton from '../components/ui/GradientButton';
import GlassButton from '../components/ui/GlassButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(formData);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      // Demo credentials should match the seeded DB user
      const success = await login({ email: 'demo@smartquiz.ai', password: 'DemoMode123!' });
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Demo account unavailable.');
      }
    } catch (err) {
      setError('Demo login failed. Please ensure the backend is seeded.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Left Form Section */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            SmartQuiz AI
          </Link>

          <h2 className="mb-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            Enter your credentials to access your account.
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={EnvelopeIcon}
              required
            />
            
            <AnimatedInput
              label="Password"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={LockClosedIcon}
              required
            />

            <div className="flex items-center justify-between pt-2 pb-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
                  Forgot password?
                </a>
              </div>
            </div>

            <GradientButton type="submit" fullWidth loading={loading}>
              Sign In
            </GradientButton>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                Or try it out
              </span>
            </div>
          </div>

          <GlassButton 
            fullWidth 
            onClick={handleDemoLogin} 
            loading={demoLoading}
            icon={ArrowRightIcon}
            className="!border-emerald-500/30 !bg-emerald-50/50 !text-emerald-700 hover:!bg-emerald-100/50 dark:!border-emerald-400/20 dark:!bg-emerald-400/10 dark:!text-emerald-400 dark:hover:!bg-emerald-400/20"
          >
            Interactive Demo Mode
          </GlassButton>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Illustration Section */}
      <div className="hidden lg:block lg:w-1/2">
        <AuthIllustration type="login" />
      </div>
    </div>
  );
}
