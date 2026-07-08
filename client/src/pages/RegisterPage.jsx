import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FormInput from '../components/auth/FormInput';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import { validateRegister } from '../utils/validators';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ name: '', email: '', password: '' });
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

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await register(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
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
      <h2 className="text-2xl font-semibold">Register</h2>
      <p className="mt-1 text-sm text-slate-500">Create your SmartQuiz account</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <FormInput
          id="name"
          label="Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Your full name"
          autoComplete="name"
          error={errors.name}
        />

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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
        />

        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </Button>
      </form>

      {loading ? <div className="mt-4"><Loader text="Creating your account" /></div> : null}

      <p className="mt-4 text-sm text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-emerald-500 hover:underline">
          Login
        </Link>
      </p>
    </motion.section>
  );
}
