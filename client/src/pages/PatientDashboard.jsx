import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, AlertCircle, RefreshCw, XCircle, User, Mail, Shield, CheckCircle, Loader2 } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Rescheduling states
  const [reschedulingApp, setReschedulingApp] = useState(null); // appointment being rescheduled
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/appointments/patient/${user.id}`);
      // Sort appointments by date & time
      const sorted = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user.id]);

  const handleCancel = async (appId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await axios.put(`/api/appointments/${appId}/status`, { status: 'cancelled' });
      // Update local state status
      setAppointments(prev =>
        prev.map(app => (app.id === appId ? { ...app, status: 'cancelled' } : app))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  // Start reschedule process
  const startReschedule = async (app) => {
    setReschedulingApp(app);
    setSelectedNewSlotId('');
    setRescheduleError('');
    setRescheduleSuccess('');
    setSlotsLoading(true);
    try {
      // Fetch doctor's latest slots
      const response = await axios.get(`/api/doctors/${app.doctorId}`);
      // Filter only unbooked slots
      const freeSlots = response.data.availableSlots.filter(s => !s.isBooked);
      setDoctorSlots(freeSlots);
    } catch (err) {
      setRescheduleError('Failed to load doctor availability slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedNewSlotId) {
      setRescheduleError('Please select a new time slot');
      return;
    }
    
    setSlotsLoading(true);
    setRescheduleError('');
    try {
      await axios.put(`/api/appointments/${reschedulingApp.id}/status`, {
        status: 'rescheduled',
        newSlotId: selectedNewSlotId
      });
      setRescheduleSuccess('Appointment rescheduled successfully!');
      
      // Reload bookings
      setTimeout(async () => {
        setReschedulingApp(null);
        await fetchAppointments();
      }, 1500);

    } catch (err) {
      setRescheduleError(err.response?.data?.message || 'Rescheduling failed.');
    } finally {
      setSlotsLoading(false);
    }
  };

  // Filter lists
  const activeBookings = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const pastBookings = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Background decoration */}
      <div className="absolute top-[20%] right-[5%] w-72 h-72 rounded-full bg-indigo-50 blur-[100px] opacity-40 -z-10" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile overview card */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-teal-500 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold border border-slate-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 mt-1.5 rounded-full bg-teal-50 text-teal-700 uppercase">
                {user.role} Member
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Right Side: Appointment listings */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Appointments */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <span>📅</span>
              <span>Active Consultations ({activeBookings.length})</span>
            </h2>

            {loading ? (
              <div className="p-12 bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Fetching bookings...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-3xl text-sm font-semibold">
                {error}
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-350 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No Active Consultations</p>
                <p className="text-xs text-slate-400">You don't have any pending or confirmed bookings at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-800">{app.doctorName}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">
                          {app.specialization}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{app.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}>
                        {app.status}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => startReschedule(app)}
                          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                          title="Reschedule Booking"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(app.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <span>history</span>
              <span>Past & Cancelled Consultations ({pastBookings.length})</span>
            </h2>

            {!loading && pastBookings.length > 0 && (
              <div className="space-y-3">
                {pastBookings.map((app) => (
                  <div
                    key={app.id}
                    className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex justify-between items-center opacity-85"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700">{app.doctorName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(app.date).toLocaleDateString()} at {app.timeSlot}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      app.status === 'completed'
                        ? 'bg-slate-100 border-slate-200 text-slate-500'
                        : 'bg-red-50 border-red-150 text-red-500'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!loading && pastBookings.length === 0 && (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                No past consultations found in your history logs.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Modal Overlay */}
      {reschedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reschedule Consultation</h3>
                <p className="text-xs text-slate-400">Change time slot with {reschedulingApp.doctorName}</p>
              </div>
              <button
                onClick={() => setReschedulingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs font-semibold rounded-xl">
                {rescheduleError}
              </div>
            )}

            {rescheduleSuccess && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold rounded-xl">
                {rescheduleSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Current Schedule</span>
                <p className="font-bold text-slate-700">
                  {new Date(reschedulingApp.date).toLocaleDateString()} at {reschedulingApp.timeSlot}
                </p>
              </div>

              {/* Slots List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 block">Available Open Slots</span>
                {slotsLoading ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                  </div>
                ) : doctorSlots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No alternative open slots available at the moment.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-slate-150 rounded-xl p-3 grid grid-cols-2 gap-2">
                    {doctorSlots.map((slot) => {
                      const isSelected = selectedNewSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedNewSlotId(slot.id);
                            setRescheduleError('');
                          }}
                          className={`p-2.5 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                            isSelected
                              ? 'bg-teal-600 border-teal-600 text-white font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <p>{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="opacity-90">{slot.time}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setReschedulingApp(null)}
                className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedNewSlotId || slotsLoading}
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-100"
              >
                {slotsLoading ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
