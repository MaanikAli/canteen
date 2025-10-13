
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { UserRole } from '../types';

interface SignUpPageProps {
  setPage: (page: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ setPage }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiService.register({
        email,
        password,
        role,
        name,
        ...(role === UserRole.Student && { studentId })
      });
      setPage('login');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-lg w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Join Green Canteen
          </h2>
          <p className="text-gray-600 text-lg">
            Create your account and start ordering delicious food
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="px-8 py-6">
            <form className="space-y-6" onSubmit={handleSignUp}>
              {/* Account Type Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-4 text-center">
                  Account Type
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {Object.values(UserRole).filter(role => role !== UserRole.Admin && role !== UserRole.Kitchen).map((roleOption) => (
                    <label key={roleOption} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="role"
                        value={roleOption}
                        checked={role === roleOption}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="sr-only"
                      />
                      <div className={`px-6 py-3 rounded-full border-2 transition-all duration-300 transform group-hover:scale-105 ${
                        role === roleOption
                          ? 'border-primary bg-primary text-white shadow-lg scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:shadow-md'
                      }`}>
                        <span className="font-medium">
                          {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                    <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                {role === UserRole.Student && (
                  <div className="relative">
                    <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <div className="relative">
                      <input
                        id="student-id"
                        name="student-id"
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your student ID"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                      />
                      <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <label htmlFor="email-address-signup" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email-address-signup"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="password-for-signup" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password-for-signup"
                      name="password"
                      type="password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-green-600 hover:from-primary-dark hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setPage('login')}
                  className="font-semibold text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;