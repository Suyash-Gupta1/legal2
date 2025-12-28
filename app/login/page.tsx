'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Scale, Lock, Mail, AlertTriangle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (res?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@legalflow.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4 shadow-lg">
                <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">LegalFlow</h1>
            <p className="text-slate-400 mt-2 text-sm">Practice Management System</p>
        </div>

        <div className="p-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                <p className="font-semibold mb-1">Demo Access (Create acc if fails):</p>
                <div className="flex justify-between items-center">
                    <span>Email: <span className="font-mono">admin@legalflow.com</span></span>
                </div>
                <div className="flex justify-between items-center mt-1">
                     <span>Password: <span className="font-mono">admin123</span></span>
                     <button 
                        type="button"
                        onClick={handleDemoLogin}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                     >
                        Auto-fill
                     </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all shadow-md hover:shadow-lg ${
                        isSubmitting 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]'
                    }`}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                    Sign up
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;