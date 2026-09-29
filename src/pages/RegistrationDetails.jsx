import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Printer, Calendar, Clock, MapPin, User, Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const RegistrationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegistration();
  }, [id]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_id,
          full_name,
          email,
          phone,
          status,
          registered_at,
          user_id,
          events (
            id,
            name,
            description,
            category,
            event_date,
            event_time,
            venue,
            organizer
          )
        `)
        .eq('id', id)
        .single();

      if (fetchErr) throw fetchErr;
      setRegistration(data);
    } catch (err) {
      console.error('Error fetching registration:', err.message);
      setError('Registration not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Registration Not Found</h2>
        <p className="text-gray-500 mt-1">{error || 'Could not locate this registration.'}</p>
        <Link to="/dashboard" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const event = registration.events;
  const isCancelled = registration.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation and Print Actions */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <button
          onClick={handlePrint}
          id="print-registration-button"
          data-testid="print-registration-button"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Registration
        </button>
      </div>

      {/* Ticket Container */}
      <div className="print-area bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
        {/* Ticket Header */}
        <div className={`p-6 text-white ${isCancelled ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold opacity-80">
                Official Registration Pass
              </span>
              <h1 className="text-2xl font-extrabold mt-1">{event?.name}</h1>
              <p className="text-sm opacity-90 mt-1">{event?.category} • Organized by {event?.organizer}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCancelled ? 'bg-red-500 text-white' : 'bg-green-400 text-green-950'
              }`}>
                {registration.status}
              </span>
              <p className="text-xs mt-1.5 opacity-80 font-mono">
                {registration.registration_id}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-8 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Participant Information
              </h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center text-sm text-gray-900 font-semibold">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {registration.full_name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {registration.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {registration.phone}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Schedule & Location
              </h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center text-sm text-gray-900 font-semibold">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {event?.event_date}
                </div>
                {event?.event_time && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {event?.event_time.slice(0, 5)}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {event?.venue}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Barcode / Registration ID */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 font-medium">Confirmation Reference Number</span>
              <p className="text-lg font-mono font-bold text-gray-900">{registration.registration_id}</p>
              <p className="text-xs text-gray-400">
                Registered on: {new Date(registration.registered_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <span className="inline-flex items-center text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Verified Entry
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            Please present this confirmation at the check-in desk upon arrival. Valid photo ID may be required.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetails;
