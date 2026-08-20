import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Briefcase, DollarSign, Calendar, Clock, ArrowLeft, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected slot state
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const fetchDoctor = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/doctors/${id}`);
      setDoctor(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedSlotId) return;
    
    setBookingLoading(true);
    setBookingError('');
    try {
      const response = await axios.post('/api/appointments/book', {
        doctorId: doctor.id,
        slotId: selectedSlotId
      });
      
      const { appointment } = response.data;
      
      // Navigate to confirmation page
      navigate('/confirmation', { state: { appointment } });

    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Error occurred booking slot. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading profile details...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-3xl text-center space-y-4">
          <p>{error || 'Doctor profile not found'}</p>
          <Link to="/doctors" className="inline-flex items-center space-x-2 text-teal-600 font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doctors</span>
          </Link>
        </div>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = {};
  doctor.availableSlots.forEach(slot => {
    if (!slotsByDate[slot.date]) {
      slotsByDate[slot.date] = [];
    }
    slotsByDate[slot.date].push(slot);
  });

  const hasSlots = Object.keys(slotsByDate).length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        to="/doctors"
        className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-teal-600 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile Bio details */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl flex items-center justify-center font-bold text-3xl">
              {doctor.name.split(' ').pop().charAt(0)}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-bold text-slate-800">{doctor.name}</h1>
                <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-0.5 rounded-full text-yellow-700 text-[10px] font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{doctor.rating.toFixed(1)}</span>
                </div>
              </div>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 uppercase">
                {doctor.specialization}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h2 className="text-lg font-bold text-slate-800">About Doctor</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {doctor.bio}
            </p>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                <p className="text-sm font-bold text-slate-800">{doctor.experience} Years</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultation Fee</p>
                <p className="text-sm font-bold text-slate-800">${doctor.fee} USD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Time slots calendar / booking widget */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-slate-800">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold">Select Appointment Slot</h2>
          </div>

          {bookingError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              {bookingError}
            </div>
          )}

          {/* Slots Calendar */}
          {!hasSlots ? (
            <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No Slots Available</p>
              <p className="text-xs text-slate-400">This doctor has not listed any availability slots yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(slotsByDate).map(date => (
                <div key={date} className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 flex items-center space-x-1.5">
                    <span>📅</span>
                    <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {slotsByDate[date].map(slot => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                            setBookingError('');
                          }}
                          className={`py-2 px-3 text-xs font-bold rounded-xl text-center transition-all ${
                            slot.isBooked
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-teal-600 text-white shadow-md shadow-teal-100 ring-2 ring-teal-600 ring-offset-2'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          <div className="pt-4 border-t border-slate-100">
            {!user ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium text-center">
                  You need to be logged in as a Patient to book consultations.
                </p>
                <Link
                  to="/login"
                  className="flex items-center justify-center bg-indigo-550 border border-slate-200 hover:border-teal-500 hover:text-teal-600 bg-slate-50 text-slate-700 font-bold py-3 rounded-2xl transition-all text-sm text-center block"
                >
                  Log In to Continue
                </Link>
              </div>
            ) : user.role !== 'patient' ? (
              <div className="p-4 bg-yellow-50 border border-yellow-150 rounded-2xl flex items-start space-x-2 text-yellow-800">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p className="text-xs leading-normal">
                  Account role is <strong>{user.role}</strong>. Booking is exclusive to Patient roles.
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={!selectedSlotId || bookingLoading}
                onClick={handleBooking}
                className="flex items-center justify-center space-x-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-teal-100 disabled:opacity-50"
              >
                {bookingLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Appointment Booking</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
