import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: AuthFormData) => Promise<void>;
  loading?: boolean;
}

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    fullName: mode === 'signup' ? '' : undefined
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            required
            value={formData.fullName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Enter your full name"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Enter your password"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {mode === 'signup' && (
          <p className="text-sm text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
          </div>
        ) : (
          mode === 'signup' ? 'Create Account' : 'Sign In'
        )}
      </button>
    </form>
  );
};