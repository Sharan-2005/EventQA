import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, User, Users, Tag, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingRegId, setExistingRegId] = useState(null);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch confirmed registrations count
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('id, user_id')
        .eq('event_id', id)
        .eq('status', 'confirmed');

      if (!regError && regData) {
        const confirmedCount = regData.length;
        setAvailableSeats(Math.max(0, (eventData.capacity || 0) - confirmedCount));

        if (user) {
          const userReg = regData.find(r => r.user_id === user.id);
          if (userReg) {
            setAlreadyRegistered(true);
            setExistingRegId(userReg.id);
          }
        }
      }

      // Prefill user data if logged in
      if (user) {
        setFullName(profile?.full_name || user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setPhone(profile?.phone || user.user_metadata?.phone || '');
      }
    } catch (err) {
      console.error('Error fetching event details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegister = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` }, message: 'Please login to continue.' } });
      return;
    }

    if (alreadyRegistered) {
      setFormError('You have already registered for this event.');
      return;
    }

    if (availableSeats <= 0) {
      setFormError('This event is full.');
      return;
    }

    setFullName(profile?.full_name || user.user_metadata?.full_name || '');
    setEmail(user.email || '');
    setPhone(profile?.phone || user.user_metadata?.phone || '');
    setFormError('');
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Phone validation
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setFormError('Please enter your phone number.');
      return;
    }

    // Phone = 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setFormError('Phone number must contain 10 digits.');
      return;
    }

    // Capacity double check
    if (availableSeats <= 0) {
      setFormError('This event is full.');
      return;
    }

    setSubmitting(true);

    try {
      // Check if user already registered in DB
      const { data: existingReg, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('event_id', id)
        .eq('status', 'confirmed')
        .maybeSingle();

      if (existingReg) {
        setFormError('You have already registered for this event.');
        setAlreadyRegistered(true);
        setExistingRegId(existingReg.id);
        setSubmitting(false);
        return;
      }

      // Generate registration ID such as EVT-2026-0001
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const regIdFormatted = `EVT-2026-${randomSuffix}`;

      const { data: newReg, error: insertError } = await supabase
        .from('registrations')
        .insert({
          registration_id: regIdFormatted,
          user_id: user.id,
          event_id: id,
          full_name: fullName.trim() || user.email,
          email: email.trim(),
          phone: trimmedPhone,
          status: 'confirmed',
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          setFormError('You have already registered for this event.');
          setAlreadyRegistered(true);
          return;
        }
        throw insertError;
      }

      setSuccessMessage('Registration successful.');
      setAlreadyRegistered(true);
      setAvailableSeats(prev => Math.max(0, prev - 1));

      setTimeout(() => {
        setShowRegisterModal(false);
        navigate(`/registrations/${newReg.id}`);
      }, 1200);

    } catch (err) {
      console.error('Registration failed:', err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Event Not Found</h2>
        <p className="text-gray-500 mt-1">The requested event does not exist or has been removed.</p>
        <Link to="/events" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
        </Link>
      </div>
    );
  }

  const isFull = availableSeats <= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/events" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to all events
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
              <Tag className="w-3.5 h-3.5 mr-1" />
              {event.category || 'General'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isFull ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {isFull ? 'Sold Out' : `${availableSeats} Seats Available`}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {event.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-6 text-sm text-blue-100">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{event.event_date}</span>
            </div>
            {event.event_time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{event.event_time.slice(0, 5)}</span>
              </div>
            )}
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {event.description || 'No detailed description available for this event.'}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Organizer</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    {event.organizer}
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Venue</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                    {event.venue}
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Total Capacity</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                    {event.capacity} Attendees
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Available Seats</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {availableSeats} Remaining
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Registration Card / CTA Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Registration</h3>

              {formError && !showRegisterModal && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {alreadyRegistered ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">You are registered!</p>
                      <p className="text-xs mt-1 text-green-700">You have already booked a seat for this event.</p>
                    </div>
                  </div>
                  {existingRegId && (
                    <Link
                      to={`/registrations/${existingRegId}`}
                      className="w-full block text-center py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Registration Ticket
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="w-full block text-center py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">Admission:</span>
                    <span className="font-bold text-green-600">Free Registration</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-600">Seat Availability:</span>
                    <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
                      {isFull ? 'Full' : `${availableSeats} remaining`}
                    </span>
                  </div>

                  <button
                    id="event-register-button"
                    data-testid="event-register-button"
                    onClick={handleOpenRegister}
                    disabled={isFull}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-xs transition-all cursor-pointer ${
                      isFull
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                    }`}
                  >
                    {isFull ? 'Event Full' : 'Register Now'}
                  </button>

                  {!user && (
                    <p className="text-xs text-gray-500 text-center">
                      Requires account login to confirm your seat.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal (Section 4) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Event Registration</h3>
            <p className="text-sm text-gray-600 mb-4">{event.name}</p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Phone Number <span className="text-red-500">* (10 digits)</span>
                </label>
                <input
                  type="tel"
                  id="registration-phone"
                  data-testid="registration-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  required
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-registration-button"
                  data-testid="confirm-registration-button"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Confirming...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
