import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store the token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Dispatch custom event to notify App component
      window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));
      
      // Small delay to ensure state updates
      setTimeout(() => {
        // Redirect based on user role
        if (user.role === 'instructor') {
          navigate('/instructor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 100);
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      <div className="w-full max-w-md p-8 shadow-2xl bg-white/10 backdrop-blur-md rounded-2xl">
        <h2 className="mb-8 text-3xl font-bold text-center text-white">Welcome Back</h2>
        
        {error && (
          <div className="p-3 mb-6 text-sm text-red-200 border rounded-lg bg-red-500/20 border-red-500/50">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 text-white placeholder-gray-400 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-purple-400 hover:text-purple-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
