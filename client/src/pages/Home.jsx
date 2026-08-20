import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Search, Shield, UserCheck, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-200 blur-[120px] opacity-35 z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-200 blur-[100px] opacity-30 z-0" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              ⚡ Over 10,000+ Happy Patients
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Consult Top Doctors <br />
              <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Anytime, Anywhere.
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
              Skip the waiting room. Connect with certified medical professionals for consultations, 
              prescriptions, and continuous care from the comfort of your home.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {(!user || user.role === 'patient') ? (
                <>
                  <Link
                    to="/doctors"
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-100 hover:shadow-xl transition-all"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find & Book Doctors</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  {!user && (
                    <Link
                      to="/signup"
                      className="flex items-center justify-center w-full sm:w-auto border border-slate-300 hover:border-teal-500 hover:text-teal-600 bg-white text-slate-700 font-semibold px-6 py-3.5 rounded-2xl transition-all"
                    >
                      Join as a Provider
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to={user.role === 'doctor' ? '/doctor-dashboard' : '/admin'}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">50+</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Specialists</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">4.9★</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Average Rating</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">100%</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Secure Records</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="lg:col-span-5 relative">
            <div className="w-full h-80 sm:h-96 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 p-1 shadow-2xl relative">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex flex-col justify-center items-center px-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-400 via-indigo-600 to-slate-950" />
                <Calendar className="w-16 h-16 text-teal-400 mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold mb-2">Book Slots Instantly</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Create schedules, select hours, and lock bookings safely in real-time.
                </p>
                
                {/* Floating reviews */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center font-bold text-slate-900">
                    JD
                  </div>
                  <div>
                    <div className="flex items-center space-x-0.5 text-yellow-400 text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <p className="text-xs font-semibold text-white">John Doe</p>
                    <p className="text-[10px] text-slate-300">"Booked Dr. Elizabeth in seconds. Highly recommended!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-white border-t border-slate-100 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How CareConnect Simplifies Care</h2>
            <p className="text-slate-600">
              An all-in-one platform built for patients requesting medical checkups and doctors hosting availability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Advanced Listing & Filters</h3>
              <p className="text-sm text-slate-600">
                Search providers by name, filter by specific medical specializations, or browse by slot availability dates.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Double-Bookings</h3>
              <p className="text-sm text-slate-600">
                Our database constraints immediately lock slot availability to ensure patients are never double-booked.
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hassle-Free Dashboards</h3>
              <p className="text-sm text-slate-600">
                Both roles get custom panels. Patients can cancel/reschedule and Doctors can manage slots or confirm bookings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
