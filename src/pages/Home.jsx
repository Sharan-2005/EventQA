import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';
import { Calendar, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [registrationCounts, setRegistrationCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        // Fetch 3 featured events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })
          .limit(3);

        if (eventsError) throw eventsError;
        setFeaturedEvents(eventsData || []);

        // Fetch registration counts for these events
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
        console.error('Error fetching featured events:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-16 pb-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STQA Capstone Project</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              EventQA — Seamless Online <span className="text-blue-600">Event Registration</span>
            </h1>
            
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-normal">
              A streamlined, test-friendly event discovery and registration platform designed for quality assurance, automated validation, and instant participation.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
              >
                Browse Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-xs hover:shadow-sm transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 transition-all"
                  >
                    Register
                  </Link>
                </>
              )}

              {user && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-xs hover:shadow-sm transition-all"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Events</h2>
            <p className="text-gray-500 text-sm mt-1">Explore upcoming summits, workshops, and tech seminars.</p>
          </div>
          <Link
            to="/events"
            className="mt-3 sm:mt-0 text-blue-600 hover:text-blue-800 text-sm font-semibold inline-flex items-center"
          >
            View all events <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white p-6 rounded-xl border border-gray-200 h-64">
                <div className="h-4 bg-gray-200 rounded-sm w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-sm w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-full mb-6"></div>
                <div className="h-10 bg-gray-100 rounded-sm w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                registrationCount={registrationCounts[event.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="text-gray-500 text-sm mt-1">
              Run database setup to seed the 3 sample events from the specification.
            </p>
          </div>
        )}
      </section>

      {/* STQA Highlights / Feature Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Live Seat Tracking</h3>
            <p className="text-sm text-gray-600">
              Capacity limits prevent over-registration. Available seats update instantly when users register or cancel.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Ticket Generation</h3>
            <p className="text-sm text-gray-600">
              Generates unique registration IDs (`EVT-2026-XXXX`) with printable confirmation receipts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">STQA Test Ready</h3>
            <p className="text-sm text-gray-600">
              Structured with exact element IDs, test IDs, and deterministic error messages for automated Selenium / Cypress testing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
