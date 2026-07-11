import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, UserIcon, AtSymbolIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import AuthIllustration from '../components/auth/AuthIllustration';
import AnimatedInput from '../components/ui/AnimatedInput';
import GradientButton from '../components/ui/GradientButton';
import PasswordStrength from '../components/auth/PasswordStrength';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: '',
    username: '',
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');

  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex-row-reverse">
      {/* Right Form Section (Reversed) */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 xl:px-24 h-screen overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md py-8"
        >
          {/* Logo */}
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            SmartQuiz AI
          </Link>

          <h2 className="mb-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            Create an account
          </h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            Start your personalized learning journey today.
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

          <form onSubmit={handleSubmit} className="space-y-2">
            <AnimatedInput
              label="Full Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              icon={UserIcon}
              required
            />

            <AnimatedInput
              label="Username"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              icon={AtSymbolIcon}
              required
            />

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
            
            <div className="pb-2">
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
              <PasswordStrength password={formData.password} />
            </div>

            <AnimatedInput
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={LockClosedIcon}
              error={passwordMatchError}
              required
            />

            <div className="pt-4">
              <GradientButton type="submit" fullWidth loading={loading}>
                Create Account
              </GradientButton>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left Illustration Section (Reversed) */}
      <div className="hidden lg:block lg:w-1/2">
        <AuthIllustration type="register" />
      </div>
    </div>
  );
}
