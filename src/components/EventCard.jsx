import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

export const EventCard = ({ event, registrationCount = 0 }) => {
  const availableSeats = Math.max(0, (event.capacity || 0) - registrationCount);
  const isFull = availableSeats <= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Tag className="w-3 h-3 mr-1" />
            {event.category || 'General'}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isFull ? 'Full' : `${availableSeats} seats left`}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {event.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description || 'No description provided.'}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span>
              {event.event_date} {event.event_time && `at ${event.event_time.slice(0, 5)}`}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span>Capacity: {event.capacity} seats</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <Link
          to={`/events/${event.id}`}
          id={`event-details-button-${event.id}`}
          data-testid="event-details-button"
          className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
        >
          View Details
        </Link>
        <Link
          to={`/events/${event.id}`}
          id={`event-register-button-${event.id}`}
          data-testid="event-register-button"
          className={`flex-1 text-center py-2 px-3 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer ${
            isFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isFull ? 'Sold Out' : 'Register Now'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
