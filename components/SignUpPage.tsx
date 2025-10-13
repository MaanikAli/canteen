
import React, { useState } from 'react';
import { apiService } from '../services/apiService';

interface SignUpPageProps {
  setPage: (page: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ setPage }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        role: 'student',
        name,
        studentId
      });
      setPage('login');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-light">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your student account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input id="name" name="name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="student-id" className="sr-only">Student ID</label>
              <input id="student-id" name="student-id" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
            </div>
            <div>
              <label htmlFor="email-address-signup" className="sr-only">Email address</label>
              <input id="email-address-signup" name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password-for-signup" className="sr-only">Password</label>
              <input id="password-for-signup" name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
              Sign up
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
          <p>
            Already have an account?{' '}
            <button onClick={() => setPage('login')} className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;