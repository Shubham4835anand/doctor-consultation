import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Re-fetch user session and route correctly
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (savedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/patient-dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background bubbles */}
      <div className="absolute top-[-5%] left-[-5%] w-80 h-80 rounded-full bg-teal-100 blur-[80px] opacity-40 -z-10" />
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 rounded-full bg-indigo-100 blur-[90px] opacity-40 -z-10" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to manage your appointments and consultations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="patient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-teal-100 hover:shadow-lg disabled:opacity-75"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100 text-sm text-slate-500">
          New to CareConnect?{' '}
          <Link to="/signup" className="text-teal-600 hover:underline font-bold transition-all">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
