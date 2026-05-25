import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import StatusBanner from '../components/StatusBanner';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: 'info', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setStatus({ type: 'info', message: '' });

    try {
      await login(formData);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to sign you in right now.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome Back"
      title="Operate the parking system with confidence."
      subtitle="Sign in to manage parking spaces, process vehicle movements, and monitor performance from one clean dashboard."
      alternateAction={{
        label: 'Need an account?',
        linkText: 'Sign up',
        to: '/signup'
      }}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <StatusBanner type={status.type} message={status.message} />

        <label className="full-span">
          Email
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@xwz.com" />
          {fieldErrors.email ? <small>{fieldErrors.email}</small> : null}
        </label>

        <label className="full-span">
          Password
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Your password" />
          {fieldErrors.password ? <small>{fieldErrors.password}</small> : null}
        </label>

        <button type="submit" className="primary-button full-span" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="inline-helper full-span">
          Need an operator account? <Link to="/signup">Create one here</Link>.
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
