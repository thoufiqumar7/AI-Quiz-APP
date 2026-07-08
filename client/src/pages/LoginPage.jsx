import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FormInput from '../components/auth/FormInput';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import { validateLogin } from '../utils/validators';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await login(values);
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-2xl font-semibold">Login</h2>
      <p className="mt-1 text-sm text-slate-500">Access your SmartQuiz account</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <FormInput
          id="email"
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />

        <FormInput
          id="password"
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
        />

        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </Button>
      </form>

      {loading ? <div className="mt-4"><Loader text="Logging in" /></div> : null}

      <p className="mt-4 text-sm text-slate-500">
        New user?{' '}
        <Link to="/register" className="font-medium text-emerald-500 hover:underline">
          Create an account
        </Link>
      </p>
    </motion.section>
  );
}
