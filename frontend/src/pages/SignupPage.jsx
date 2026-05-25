import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import StatusBanner from '../components/StatusBanner';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  password: ''
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState(initialState);
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
      const response = await signup(formData);
      setStatus({
        type: 'success',
        message: response.message
      });
      setFormData(initialState);
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Unable to create your account right now.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create Account"
      title="Start your parking operations workspace."
      subtitle="Register your XWZ LTD account to access secure parking workflows, reports, and day-to-day operations."
      alternateAction={{
        label: 'Already registered?',
        linkText: 'Sign in',
        to: '/login'
      }}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <StatusBanner type={status.type} message={status.message} />

        <label>
          First Name
          <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Aline" />
          {fieldErrors.firstName ? <small>{fieldErrors.firstName}</small> : null}
        </label>

        <label>
          Last Name
          <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Uwimana" />
          {fieldErrors.lastName ? <small>{fieldErrors.lastName}</small> : null}
        </label>

        <label className="full-span">
          Email
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@xwz.com" />
          {fieldErrors.email ? <small>{fieldErrors.email}</small> : null}
        </label>

        <label className="full-span">
          Password
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
          />
          {fieldErrors.password ? <small>{fieldErrors.password}</small> : null}
        </label>

        <button type="submit" className="primary-button full-span" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
