import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Activity } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-[#0b0e11] px-4 py-12">
      <div className="bg-[#181a20] border border-[#2b3139] rounded-lg p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 text-yellow-500 font-bold text-2xl tracking-wider">
            <Activity size={28} />
            <span>CRYPTO<span className="text-white">X</span></span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Create an Account</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Start trading crypto with mock funds today</p>
        
        {(error || localError) && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-[#2b3139] border border-transparent focus:border-yellow-500 rounded px-4 py-3 text-white outline-none transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength="6"
              className="w-full bg-[#2b3139] border border-transparent focus:border-yellow-500 rounded px-4 py-3 text-white outline-none transition-colors"
              placeholder="Create a password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full bg-[#2b3139] border border-transparent focus:border-yellow-500 rounded px-4 py-3 text-white outline-none transition-colors"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded font-bold text-black transition-colors ${
              isLoading ? 'bg-yellow-600 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-medium">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
