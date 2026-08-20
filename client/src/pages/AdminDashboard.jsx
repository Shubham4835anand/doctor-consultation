import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Stethoscope, Plus, Trash2, Mail, Briefcase, DollarSign, Loader2, ShieldAlert, Users, Award, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'appointments'
  
  // Data lists
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add doctor form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [bio, setBio] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [docRes, appRes] = await Promise.all([
        axios.get('/api/doctors'),
        axios.get('/api/admin/appointments')
      ]);
      setDoctors(docRes.data);
      setAppointments(appRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard records. Verify your admin role permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle delete doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor and all associated credentials?')) return;
    
    try {
      await axios.delete(`/api/admin/doctors/${doctorId}`);
      // Remove from state
      setDoctors(prev => prev.filter(d => d.id !== doctorId));
      setFormSuccess('Doctor profile deleted successfully');
      // Reload appointments as some might be cancelled
      const appRes = await axios.get('/api/admin/appointments');
      setAppointments(appRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting doctor profile');
    }
  };

  // Add doctor form submit
  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name || !email || !password || !experience || !fee) {
      setFormError('All fields are required');
      return;
    }

    setFormLoading(true);
    try {
      const response = await axios.post('/api/admin/doctors', {
        name,
        email,
        password,
        specialization,
        experience: Number(experience),
        fee: Number(fee),
        bio
      });

      // Append new doctor
      setDoctors(prev => [...prev, response.data.doctor]);
      setFormSuccess('Doctor added successfully!');
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setExperience('');
      setFee('');
      setBio('');

    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create doctor profile');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Background decoration */}
      <div className="absolute top-[15%] right-[-5%] w-80 h-80 rounded-full bg-red-50 blur-[100px] opacity-35 -z-10" />

      {/* Header bar */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-red-950 rounded-3xl p-6 sm:p-8 text-white mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-2.5 py-0.5 rounded-full uppercase border border-red-500/30">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Operations Center</h1>
          <p className="text-slate-350 text-xs sm:text-sm font-medium">Add/remove doctors, monitor user counts, and review platform booking logs</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-650 font-semibold text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          <p className="text-slate-500 font-medium">Fetching administrative records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Manage/Add Doctor profile form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-800">Add New Doctor</h2>
              </div>

              {formError && <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-150">{formError}</p>}
              {formSuccess && <p className="text-xs font-semibold text-teal-700 bg-teal-50 p-2.5 rounded-lg border border-teal-150">{formSuccess}</p>}

              <form onSubmit={handleAddDoctorSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Alexander Fleming"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</label>
                  <input
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <input
                    type="password"
                    placeholder="Temp Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience (Yrs)</label>
                    <input
                      type="number"
                      placeholder="Yrs"
                      min="1"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee ($)</label>
                    <input
                      type="number"
                      placeholder="Fee"
                      min="1"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialty</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all"
                  >
                    <option value="General Medicine">General</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bio</label>
                  <textarea
                    placeholder="Short biography details..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="2"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 rounded-xl py-2 pl-3 text-xs outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-red-50 flex items-center justify-center space-x-1"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register Doctor</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Tab Switch and Logs list */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab switch buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('doctors')}
                className={`flex-1 text-center py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'doctors'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Doctor Directories ({doctors.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`flex-1 text-center py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Global Booking Logs ({appointments.length})</span>
              </button>
            </div>

            {/* Doctors list tab content */}
            {activeTab === 'doctors' && (
              <div className="space-y-4">
                {doctors.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-md">
                        {doc.name.split(' ').pop().charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{doc.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{doc.specialization}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="p-2 text-slate-450 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Appointments list tab content */}
            {activeTab === 'appointments' && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {appointments.map(app => (
                  <div
                    key={app.id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-slate-800">Patient: {app.patientName}</span>
                        <span className="text-slate-400">➡️</span>
                        <span className="font-bold text-slate-800">Doctor: {app.doctorName}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500">
                        <p>Specialty: {app.specialization}</p>
                        <p>Date: {new Date(app.date).toLocaleDateString()}</p>
                        <p>Time: {app.timeSlot}</p>
                      </div>
                    </div>

                    <span className={`self-start sm:self-center text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                        : app.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        : app.status === 'completed'
                        ? 'bg-slate-50 border-slate-200 text-slate-550'
                        : 'bg-red-50 border-red-150 text-red-500'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
