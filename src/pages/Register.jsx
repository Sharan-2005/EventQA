import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Required validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    // 2. Valid email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Phone validation
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Phone number must contain 10 digits.');
      return;
    }

    // 4. Password length >= 6
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // 5. Confirm password match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(fullName.trim(), email.trim(), phone.trim(), password);
      setSuccess('Registration successful. Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        setError('You have already registered with this email.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-2">
          <Calendar className="h-10 w-10" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Full Name
              </label>
              <input
                id="register-name"
                data-testid="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <input
                id="register-email"
                data-testid="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Phone Number (10 digits)
              </label>
              <input
                id="register-phone"
                data-testid="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Password (min 6 characters)
              </label>
              <input
                id="register-password"
                data-testid="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                data-testid="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <button
              id="register-button"
              data-testid="register-button"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
