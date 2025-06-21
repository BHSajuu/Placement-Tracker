import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRegister: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onRegister,
  onLogin
}) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (isLoginMode) {
        result = await onLogin(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        result = await onRegister(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full shadow-lg">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isLoginMode ? <LogIn className="w-6 h-6 text-blue-500" /> : <UserPlus className="w-6 h-6 text-blue-500" />}
            <h2 className="text-2xl font-bold text-white">
              {isLoginMode ? 'Welcome Back!' : 'Get Started'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required={!isLoginMode}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isLoginMode 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};