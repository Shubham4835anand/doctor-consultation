import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Stethoscope, Briefcase, DollarSign, BookOpen, Loader2, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validation
    if (!name || !email || !password) {
      setError('Standard profile fields are required');
      return;
    }

    if (role === 'doctor') {
      if (!experience || !fee) {
        setError('Doctor experience and fee are required');
        return;
      }
    }

    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role,
      ...(role === 'doctor' && {
        specialization,
        experience: Number(experience),
        fee: Number(fee),
        bio
      })
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background bubbles */}
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 rounded-full bg-teal-100 blur-[80px] opacity-40 -z-10" />
      <div className="absolute bottom-[-5%] left-[-5%] w-96 h-96 rounded-full bg-indigo-100 blur-[90px] opacity-40 -z-10" />

      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800">Create Account</h2>
          <p className="text-sm text-slate-500">Sign up in seconds to start consulting or hosting hours</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setRole('patient'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
              role === 'patient'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            I am a Patient
          </button>
          <button
            type="button"
            onClick={() => { setRole('doctor'); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
              role === 'doctor'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            I am a Doctor
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Doctor Specific Fields */}
          {role === 'doctor' && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-slideDown">
              <h3 className="text-sm font-bold text-slate-700">Doctor Profile Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Specialization */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Specialization</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all appearance-none"
                    >
                      <option value="General Medicine">General</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Experience (Yrs)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      min="1"
                      max="60"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                      required={role === 'doctor'}
                    />
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fee ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Fee"
                      min="1"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all"
                      required={role === 'doctor'}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Short Biography / Bio</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea
                    placeholder="Tell patients about your background, values, and experience..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center space-x-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-teal-100 hover:shadow-lg disabled:opacity-75 pt-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-5 border-t border-slate-100 text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:underline font-bold transition-all">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
