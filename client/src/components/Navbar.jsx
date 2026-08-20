import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LogOut, User, Calendar, Compass, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-teal-600 hover:opacity-90 transition-opacity">
          <Heart className="w-8 h-8 fill-teal-100 animate-pulse" />
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            Care<span className="text-teal-600">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">
            Home
          </Link>
          
          {(!user || user.role === 'patient') && (
            <Link to="/doctors" className="text-slate-600 hover:text-teal-600 font-medium flex items-center space-x-1 transition-colors">
              <Compass className="w-4 h-4" />
              <span>Find Doctors</span>
            </Link>
          )}

          {user && user.role === 'patient' && (
            <Link to="/patient-dashboard" className="text-slate-600 hover:text-teal-600 font-medium flex items-center space-x-1 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </Link>
          )}

          {user && user.role === 'doctor' && (
            <Link to="/doctor-dashboard" className="text-slate-600 hover:text-teal-600 font-medium flex items-center space-x-1 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Doctor Dashboard</span>
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1 transition-colors">
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Desktop CTA / Auth Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-slate-500 hover:text-red-500 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-slate-600 hover:text-teal-600 font-semibold text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-100 hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-600 hover:text-teal-600 focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
          <div className="flex flex-col space-y-3 px-2 pb-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-teal-600 font-medium py-1.5"
            >
              Home
            </Link>
            
            {(!user || user.role === 'patient') && (
              <Link
                to="/doctors"
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-teal-600 font-medium py-1.5"
              >
                Find Doctors
              </Link>
            )}

            {user && user.role === 'patient' && (
              <Link
                to="/patient-dashboard"
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-teal-600 font-medium py-1.5"
              >
                My Bookings
              </Link>
            )}

            {user && user.role === 'doctor' && (
              <Link
                to="/doctor-dashboard"
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-teal-600 font-medium py-1.5"
              >
                Doctor Dashboard
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="text-red-600 hover:text-red-700 font-medium py-1.5"
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-600 font-medium w-full text-left py-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-slate-600 hover:text-teal-600 font-semibold py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="text-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-xl transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
