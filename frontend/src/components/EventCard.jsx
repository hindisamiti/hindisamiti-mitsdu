import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt } from 'react-icons/fa';

const EventCard = ({ event, onClick }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const isEventActive = () => {
    return event && Boolean(event.is_active);
  };

  const isEventDatePassed = () => {
    if (!event) return false;
    const today = new Date();
    const eventDate = new Date(event.date);
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const eventActive = isEventActive();
  const eventDatePassed = isEventDatePassed();

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative group cursor-pointer h-full"
      onClick={onClick}
    >
      {/* Card Container */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
        {/* Background Image */}
        {event.cover_image_url ? (
          <img 
            src={event.cover_image_url} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-amber-500 flex items-center justify-center">
            <FaCalendarAlt className="text-white text-6xl opacity-50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Orange Border Frame */}
        <div className="absolute inset-0 border-4 border-orange-500 rounded-2xl pointer-events-none group-hover:border-orange-400 transition-colors duration-300"></div>
        
        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg group-hover:border-amber-400 transition-colors"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg group-hover:border-amber-400 transition-colors"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg group-hover:border-amber-400 transition-colors"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg group-hover:border-amber-400 transition-colors"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Event Title */}
          <h3 className="text-2xl font-bold text-white mb-3 text-center drop-shadow-lg">
            {event.name}
          </h3>

          {/* "Adhik Jaane" Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 border-2 border-orange-400 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-700 hover:border-orange-300 transition-all duration-300 text-sm shadow-lg"
          >
            अधिक जानें
          </motion.button>
        </div>

        {/* Status Badge (if active) */}
        {eventActive && !eventDatePassed && (
          <div className="absolute top-6 right-6 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg border-2 border-white">
            Registration Open
          </div>
        )}

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700 pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

export default EventCard;