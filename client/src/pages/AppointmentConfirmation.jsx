import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Check, Calendar, User, Stethoscope, Clock, ArrowRight, Home } from 'lucide-react';

export default function AppointmentConfirmation() {
  const location = useLocation();
  const appointment = location.state?.appointment;

  // Safeguard if accessed directly without booking state
  if (!appointment) {
    return <Navigate to="/patient-dashboard" replace />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 relative">
      {/* Background Accent */}
      <div className="absolute top-[-5%] left-[-5%] w-72 h-72 rounded-full bg-teal-100 blur-[80px] opacity-35 -z-10" />

      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600 shadow-inner">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Booking Confirmed!</h1>
          <p className="text-sm text-slate-500">Your appointment has been registered and is pending approval.</p>
        </div>

        {/* Appointment Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-4">
          <div className="flex items-center space-x-3 pb-3.5 border-b border-slate-200/60">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
              {appointment.doctorName.split(' ').pop().charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{appointment.doctorName}</p>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 uppercase mt-0.5">
                {appointment.specialization}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Appointment Date</span>
              <p className="text-slate-800 font-bold flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Time Slot</span>
              <p className="text-slate-800 font-bold flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{appointment.timeSlot}</span>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider">Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-bold uppercase text-[9px] tracking-wider border border-yellow-250">
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <Link
            to="/patient-dashboard"
            className="flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-teal-150"
          >
            <span>My Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 border border-slate-200 hover:border-teal-500 hover:text-teal-600 bg-white text-slate-700 font-semibold py-3.5 rounded-2xl transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
