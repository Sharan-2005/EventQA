import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Search, Calendar, Users, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Admin = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'registrations'
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    description: '',
    category: 'Technology',
    event_date: '',
    event_time: '10:00',
    venue: '',
    organizer: 'EventQA Team',
    capacity: 50,
  });

  // Registrations search state
  const [registrationSearch, setRegistrationSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch events
      const { data: eventsData, error: eventsErr } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (eventsErr) throw eventsErr;
      setEvents(eventsData || []);

      // Fetch registrations with linked event
      const { data: regData, error: regErr } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_id,
          full_name,
          email,
          phone,
          status,
          registered_at,
          event_id,
          events (
            name,
            event_date,
            venue
          )
        `)
        .order('registered_at', { ascending: false });

      if (regErr) throw regErr;
      setRegistrations(regData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err.message);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setEventFormData({
      name: '',
      description: '',
      category: 'Technology',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '10:00',
      venue: '',
      organizer: 'EventQA Team',
      capacity: 50,
    });
    setError('');
    setMessage('');
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (event) => {
    setEditingEventId(event.id);
    setEventFormData({
      name: event.name || '',
      description: event.description || '',
      category: event.category || 'Technology',
      event_date: event.event_date || '',
      event_time: event.event_time ? event.event_time.slice(0, 5) : '10:00',
      venue: event.venue || '',
      organizer: event.organizer || '',
      capacity: event.capacity || 50,
    });
    setError('');
    setMessage('');
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? All associated registrations will also be removed.')) {
      return;
    }

    try {
      const { error: delErr } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (delErr) throw delErr;

      setMessage('Event deleted successfully.');
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingEventId) {
        // Edit existing event
        const { data, error: updateErr } = await supabase
          .from('events')
          .update({
            name: eventFormData.name,
            description: eventFormData.description,
            category: eventFormData.category,
            event_date: eventFormData.event_date,
            event_time: eventFormData.event_time,
            venue: eventFormData.venue,
            organizer: eventFormData.organizer,
            capacity: parseInt(eventFormData.capacity, 10),
          })
          .eq('id', editingEventId)
          .select()
          .single();

        if (updateErr) throw updateErr;

        setMessage('Event updated successfully.');
        setEvents(prev => prev.map(ev => ev.id === editingEventId ? data : ev));
      } else {
        // Create new event
        const { data, error: insertErr } = await supabase
          .from('events')
          .insert({
            name: eventFormData.name,
            description: eventFormData.description,
            category: eventFormData.category,
            event_date: eventFormData.event_date,
            event_time: eventFormData.event_time,
            venue: eventFormData.venue,
            organizer: eventFormData.organizer,
            capacity: parseInt(eventFormData.capacity, 10),
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        setMessage('Event created successfully.');
        setEvents(prev => [...prev, data]);
      }

      setShowEventModal(false);
    } catch (err) {
      console.error('Save event error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  // Filter registrations by search
  const filteredRegistrations = registrations.filter(reg => {
    const q = registrationSearch.toLowerCase();
    const eventName = reg.events?.name || '';
    return (
      reg.registration_id?.toLowerCase().includes(q) ||
      reg.full_name?.toLowerCase().includes(q) ||
      reg.email?.toLowerCase().includes(q) ||
      reg.phone?.includes(q) ||
      eventName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Administration Console</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">EventQA Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage events, review attendee registrations, and configure limits.</p>
        </div>

        {activeTab === 'events' && (
          <button
            id="admin-add-event"
            data-testid="admin-add-event"
            onClick={handleOpenAddEvent}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        )}
      </div>

      {/* Alert Messages */}
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center ${
            activeTab === 'events'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center ${
            activeTab === 'registrations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Registrations ({registrations.length})
        </button>
      </div>

      {/* Tab 1: Events Management */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Event Name</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Category</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Date & Venue</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Capacity</th>
                    <th scope="col" className="px-6 py-3.5 text-right font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map(ev => (
                    <tr key={ev.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{ev.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{ev.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {ev.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs">
                        <div>{ev.event_date} {ev.event_time && `at ${ev.event_time.slice(0, 5)}`}</div>
                        <div className="text-gray-400 mt-0.5">{ev.venue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {ev.capacity} seats
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          id={`admin-edit-event-${ev.id}`}
                          data-testid="admin-edit-event"
                          onClick={() => handleOpenEditEvent(ev)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1 text-gray-500" />
                          Edit
                        </button>
                        <button
                          id={`admin-delete-event-${ev.id}`}
                          data-testid="admin-delete-event"
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1 text-red-500" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No events found. Click "Add Event" to create one.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Registrations Management */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          {/* Registration Search */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              id="admin-search-registrations"
              data-testid="admin-search-registrations"
              value={registrationSearch}
              onChange={(e) => setRegistrationSearch(e.target.value)}
              placeholder="Search by participant name, email, phone, or registration ID..."
              className="w-full text-sm bg-transparent border-none focus:outline-hidden text-gray-900"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            {filteredRegistrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">ID</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Participant</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Event</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Contact</th>
                      <th scope="col" className="px-6 py-3.5 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRegistrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-blue-600">
                          {reg.registration_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {reg.full_name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">{reg.events?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{reg.events?.event_date}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          <div>{reg.email}</div>
                          <div className="text-gray-400">{reg.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            reg.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No registrations found matching your query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingEventId ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={eventFormData.name}
                  onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                  placeholder="e.g. AI Innovation Summit 2026"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Detailed description of the event..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    placeholder="Technology, Workshop, Seminar"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={eventFormData.capacity}
                    onChange={(e) => setEventFormData({ ...eventFormData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventFormData.event_date}
                    onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Event Time</label>
                  <input
                    type="time"
                    required
                    value={eventFormData.event_time}
                    onChange={(e) => setEventFormData({ ...eventFormData, event_time: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.venue}
                    onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                    placeholder="e.g. Mumbai, Auditorium A"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Organizer</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.organizer}
                    onChange={(e) => setEventFormData({ ...eventFormData, organizer: e.target.value })}
                    placeholder="EventQA Team"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingEventId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
