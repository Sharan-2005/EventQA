import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import { Search, Filter, Calendar } from 'lucide-react';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id);
        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select('event_id')
          .in('event_id', eventIds)
          .eq('status', 'confirmed');

        if (!regError && regData) {
          const counts = {};
          regData.forEach(r => {
            counts[r.event_id] = (counts[r.event_id] || 0) + 1;
          });
          setRegistrationCounts(counts);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for dropdown
  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];

  // Filter events based on search query and category filter
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Events</h1>
        <p className="mt-1 text-gray-600">Discover and register for technology conferences, seminars, and workshops.</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            id="event-search"
            data-testid="event-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event name..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="relative sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Filter className="h-4 w-4" />
          </div>
          <select
            id="event-filter"
            data-testid="event-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-xl border border-gray-200 h-64">
              <div className="h-4 bg-gray-200 rounded-sm w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-sm w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-sm w-full mb-6"></div>
              <div className="h-10 bg-gray-100 rounded-sm w-full mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              registrationCount={registrationCounts[event.id] || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No events matched your criteria</h3>
          <p className="text-gray-500 text-sm mt-1">Try resetting the search query or category filter.</p>
          {(searchQuery || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
