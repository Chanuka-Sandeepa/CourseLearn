import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    bio: '',
    role: 'student' // Default role
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.username || !formData.password) {
    setError('Please enter both username and password');
    return;
  }

  try {
    setIsLoading(true);

    // Debug: Log the API URL being used
    const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/login`;
    console.log('Making request to:', apiUrl);

    const response = await axios.post(
      apiUrl,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log('Login Response:', response);

    const { token, user } = response.data;

    if (!token || !user) {
      throw new Error('Invalid login response. Missing token or user.');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));

    setTimeout(() => {
      if (user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }, 100);

  } catch (err) {
    console.error('Login error details:', {
      message: err.message,
      response: err.response,
      request: err.request,
      code: err.code
    });

    let errorMessage = 'Login failed. Please try again.';

    if (err.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please check your connection.';
    } else if (err.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Please check if the server is running.';
    } else if (err.response) {
      // Server responded with error status
      const status = err.response.status;
      switch (status) {
        case 400:
          errorMessage = err.response.data?.message || 'Invalid request data.';
          break;
        case 401:
          errorMessage = 'Invalid username or password.';
          break;
        case 404:
          errorMessage = 'Login endpoint not found. Please contact support.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = err.response.data?.message || `Server error (${status})`;
      }
    } else if (err.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check if the server is running.';
    }

    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create an Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="First name"
                required
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Last name"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Choose a username"
              required
              autoComplete="username"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              I want to join as *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.role === 'student' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-medium text-white">Student</div>
                  <div className="text-xs text-gray-400">Learn new skills</div>
                </div>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.role === 'instructor' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={formData.role === 'instructor'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-medium text-white">Instructor</div>
                  <div className="text-xs text-gray-400">Share your knowledge</div>
                </div>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Create a password"
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm your password"
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/30 rounded bg-white/5"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
