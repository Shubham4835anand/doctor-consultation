import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Check, X, Loader2, Plus, Trash2, ShieldAlert, Award, FileText, CheckSquare } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorId = user?.doctorId;

  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add slot form states
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('09:00 AM');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!doctorId) {
      setLoading(false);
      setError('Doctor profile configuration not found. Please contact admin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Fetch appointments and doctor profile (for slots) in parallel
      const [appRes, docRes] = await Promise.all([
        axios.get(`/api/appointments/doctor/${doctorId}`),
        axios.get(`/api/doctors/${doctorId}`)
      ]);

      // Sort appointments
      const sortedApp = appRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(sortedApp);
      setAvailableSlots(docRes.data.availableSlots || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [doctorId]);

  // Handle appointment status change
  const handleStatusUpdate = async (appId, nextStatus) => {
    if (nextStatus === 'cancelled' && !window.confirm('Are you sure you want to reject/cancel this appointment?')) {
      return;
    }
    try {
      await axios.put(`/api/appointments/${appId}/status`, { status: nextStatus });
      // Update local state
      setAppointments(prev =>
        prev.map(app => (app.id === appId ? { ...app, status: nextStatus } : app))
      );
      // Reload slots as cancellation might have freed up slots
      if (nextStatus === 'cancelled') {
        const docRes = await axios.get(`/api/doctors/${doctorId}`);
        setAvailableSlots(docRes.data.availableSlots || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  // Add a slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!slotDate || !slotTime) {
      setFormError('Please select both date and time');
      return;
    }

    setActionLoading(true);
    try {
      const response = await axios.put(`/api/doctors/${doctorId}/slots`, {
        action: 'add',
        slot: {
          date: slotDate,
          time: slotTime
        }
      });

      setAvailableSlots(response.data.availableSlots);
      setFormSuccess('Availability slot added successfully!');
      setSlotDate('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add time slot');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove a slot
  const handleRemoveSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this availability slot?')) return;
    
    try {
      const response = await axios.put(`/api/doctors/${doctorId}/slots`, {
        action: 'remove',
        slotId
      });
      setAvailableSlots(response.data.availableSlots);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove slot');
    }
  };

  if (!doctorId) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-3xl p-8 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-bold">Access Restrained</h2>
          <p className="text-sm">You are logged in, but we cannot locate a doctor profile linked to this account.</p>
        </div>
      </div>
    );
  }

  // Filter lists
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const activeAppointments = appointments.filter(a => a.status === 'confirmed');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-teal-400 to-transparent" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs bg-teal-500/20 text-teal-300 font-bold px-2.5 py-0.5 rounded-full uppercase border border-teal-500/30">
            Provider Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-slate-350 text-xs sm:text-sm font-medium">Manage patient requests, status updates, and calendar listings</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-650 rounded-2xl mb-8 font-semibold text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          <p className="text-slate-500 font-medium">Synchronizing provider records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Manage availability slots */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-800">Add Available Slot</h2>
              </div>

              {formError && <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-150">{formError}</p>}
              {formSuccess && <p className="text-xs font-semibold text-teal-700 bg-teal-50 p-2.5 rounded-lg border border-teal-150">{formSuccess}</p>}

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => { setSlotDate(e.target.value); setFormSuccess(''); setFormError(''); }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-2.5 px-3 text-sm outline-none transition-all text-slate-650"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time</label>
                  <select
                    value={slotTime}
                    onChange={(e) => { setSlotTime(e.target.value); setFormSuccess(''); setFormError(''); }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl py-2.5 px-3 text-sm outline-none transition-all text-slate-650"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-teal-50 flex items-center justify-center space-x-1.5"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Time Slot</span>
                </button>
              </form>
            </div>

            {/* List of availability slots */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Active Calendar Slots ({availableSlots.length})</h2>
              {availableSlots.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No listed slots. Set your hours above to allow patient bookings.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {availableSlots.map(slot => (
                    <div
                      key={slot.id}
                      className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-700">{new Date(slot.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{slot.time}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {slot.isBooked ? (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">
                            Booked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Manage pending & confirmed appointments */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Pending Approvals */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                <span>Pending Approvals ({pendingAppointments.length})</span>
              </h2>

              {pendingAppointments.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center text-xs text-slate-400">
                  No pending appointment bookings needing review.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.map(app => (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-l-4 border-l-yellow-500"
                    >
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                          <p className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{new Date(app.date).toLocaleDateString()}</span>
                          </p>
                          <p className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{app.timeSlot}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-50 justify-end">
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                          className="flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                          className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming/Confirmed Consultations */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span>🩺</span>
                <span>Active/Confirmed Sessions ({activeAppointments.length})</span>
              </h2>

              {activeAppointments.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center text-xs text-slate-400">
                  No confirmed upcoming sessions scheduled.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAppointments.map(app => (
                    <div
                      key={app.id}
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-l-4 border-l-teal-600"
                    >
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                          <p className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{new Date(app.date).toLocaleDateString()}</span>
                          </p>
                          <p className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{app.timeSlot}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-50 justify-end">
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(app.id, 'completed')}
                          className="flex items-center space-x-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Complete Session</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                          className="flex items-center space-x-1 bg-slate-50 hover:bg-slate-150 text-slate-600 font-semibold px-3 py-1.5 rounded-xl text-xs transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Logs */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span>📚</span>
                <span>Past Sessions History ({pastAppointments.length})</span>
              </h2>

              {pastAppointments.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pastAppointments.map(app => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex justify-between items-center text-xs opacity-80"
                    >
                      <div>
                        <p className="font-bold text-slate-700">{app.patientName}</p>
                        <p className="text-slate-500 font-medium">{new Date(app.date).toLocaleDateString()} at {app.timeSlot}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full border font-bold uppercase text-[9px] ${
                        app.status === 'completed'
                          ? 'bg-slate-100 border-slate-200 text-slate-500'
                          : 'bg-red-50 border-red-150 text-red-500'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                  No completed or cancelled consultations in your archive logs.
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
