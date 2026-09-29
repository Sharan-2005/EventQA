import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Tag, AlertCircle, CheckCircle2, Eye, Ban } from 'lucide-react';

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchUserRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_id,
          status,
          registered_at,
          event_id,
          events (
            id,
            name,
            category,
            event_date,
            event_time,
            venue
          )
        `)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      if (regError) throw regError;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching registrations:', err.message);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setCancellingId(registrationId);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setMessage('Registration cancelled successfully.');
      // Update local state
      setRegistrations(prev =>
        prev.map(r => r.id === registrationId ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* User Overview Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">User Dashboard</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Welcome back, {profile?.full_name || user?.user_metadata?.full_name || user?.email}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Email: <span className="font-medium text-gray-700">{user?.email}</span>
              {profile?.phone && (
                <> • Phone: <span className="font-medium text-gray-700">{profile.phone}</span></>
              )}
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
          >
            Browse More Events
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registrations List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Your Registered Events</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
            {registrations.length} {registrations.length === 1 ? 'Registration' : 'Registrations'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500">Loading registrations...</p>
          </div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Registration ID</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Event Name</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Date & Venue</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {registrations.map(reg => {
                  const eventInfo = reg.events;
                  const isCancelled = reg.status === 'cancelled';

                  return (
                    <tr key={reg.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-blue-600">
                        {reg.registration_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{eventInfo?.name || 'Unknown Event'}</div>
                        <div className="text-xs text-gray-500">{eventInfo?.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {eventInfo?.event_date} {eventInfo?.event_time && `at ${eventInfo.event_time.slice(0, 5)}`}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {eventInfo?.venue}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <Link
                          to={`/registrations/${reg.id}`}
                          id={`view-registration-${reg.id}`}
                          data-testid="view-registration-button"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-gray-500" />
                          View
                        </Link>
                        {!isCancelled && (
                          <button
                            id="cancel-registration-button"
                            data-testid="cancel-registration-button"
                            disabled={cancellingId === reg.id}
                            onClick={() => handleCancelRegistration(reg.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5 mr-1 text-red-500" />
                            {cancellingId === reg.id ? 'Cancelling...' : 'Cancel Registration'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No Registrations Yet</h3>
            <p className="mt-1 text-sm text-gray-500">You have not registered for any events.</p>
            <Link
              to="/events"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
