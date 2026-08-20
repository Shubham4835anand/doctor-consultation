import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, Stethoscope, Briefcase, DollarSign, Calendar, SlidersHorizontal, Loader2 } from 'lucide-react';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const specializations = ['All', 'General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics'];

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedSpecialization && selectedSpecialization !== 'All') {
        params.specialization = selectedSpecialization;
      }
      if (selectedDate) params.date = selectedDate;

      const response = await axios.get('/api/doctors', { params });
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search/filters? Simple fetch on dependency change works perfectly.
    fetchDoctors();
  }, [selectedSpecialization, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Background Accent */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-teal-100 blur-[90px] opacity-30 -z-10" />

      {/* Page Header */}
      <div className="text-center lg:text-left space-y-2 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Meet Our Professionals</h1>
        <p className="text-slate-500">Book appointments with verified specialists and general practitioners</p>
      </div>

      {/* Search & Filters Container */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-10 space-y-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all"
            />
          </div>

          {/* Date Picker Filter */}
          <div className="md:col-span-4 relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-2xl py-3.5 px-4 text-sm outline-none transition-all text-slate-600"
            />
          </div>

          {/* Search button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-teal-100 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </form>

        {/* Specialization Quick Badges */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Popular Specialities</label>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialization(spec)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedSpecialization === spec
                    ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          <p className="text-slate-500 font-medium">Searching matching profiles...</p>
        </div>
      ) : error ? (
        <div className="min-h-[30vh] flex items-center justify-center p-6 bg-red-50 border border-red-200 text-red-600 rounded-3xl">
          {error}
        </div>
      ) : doctors.length === 0 ? (
        <div className="min-h-[30vh] bg-white border border-slate-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No Doctors Found</h3>
          <p className="text-slate-400 max-w-sm">Try widening your search terms, selecting a different specialty, or choosing another date.</p>
          {(search || selectedSpecialization !== 'All' || selectedDate) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSpecialization('All');
                setSelectedDate('');
              }}
              className="mt-2 text-sm text-teal-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => {
            // Count remaining slots
            const availableSlotsCount = doctor.availableSlots.filter(s => !s.isBooked).length;
            
            return (
              <div
                key={doctor.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all flex flex-col justify-between"
              >
                {/* Doctor Basic Details */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-lg">
                      {doctor.name.split(' ').pop().charAt(0)}
                    </div>
                    <div className="flex items-center space-x-1 bg-yellow-50 px-2.5 py-1 rounded-full text-yellow-700 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{doctor.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800 hover:text-teal-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 mt-1 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {doctor.specialization}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3 min-h-[48px]">
                    {doctor.bio}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{doctor.experience} Yrs Experience</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span>${doctor.fee} USD / session</span>
                    </div>
                  </div>
                </div>

                {/* Slots info & Action */}
                <div className="mt-5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Availability:</span>
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      availableSlotsCount > 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {availableSlotsCount} slots left
                    </span>
                  </div>

                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="flex items-center justify-center space-x-1 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-3 rounded-2xl transition-all shadow-md shadow-teal-50 shadow-sm"
                  >
                    <span>View Profile & Book</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
