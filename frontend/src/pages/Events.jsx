import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
import { fetchPublicEvents } from '../utils/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchPublicEvents();
        console.log('Events data:', data);
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const isEventDatePassed = (event) => {
    const today = new Date();
    const eventDate = new Date(event.date);
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return event.is_active;
    } else if (filter === 'past') {
      return isEventDatePassed(event);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="pt-2 text-3xl sm:text-4xl md:text-5xl font-bold text-orange-900 mb-4">
              सभी कार्यक्रम
            </h1>
            
            <div className="inline-block mb-6">
              <span className="text-xl sm:text-2xl text-orange-900 font-medium tracking-wide">All Events</span>
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full mt-2"></div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed"
            >
              Explore all cultural events organized by Hindi Samiti celebrating our rich heritage and traditions
            </motion.p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {[
                { value: 'all', label: 'All Events' },
                { value: 'active', label: 'Active Events' },
                { value: 'past', label: 'Past Events' }
              ].map((btn) => (
                <motion.button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 ${
                    filter === btn.value
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-white text-orange-700 border-2 border-orange-400 hover:border-orange-600 hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="hidden sm:inline">{btn.label}</span>
                    <span className="sm:hidden">{btn.label.split(' ')[0]}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-orange-300"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
                <div className="absolute inset-3 rounded-full bg-gradient-to-r from-orange-400 to-red-600 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaCalendarAlt className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-orange-700 font-medium text-lg">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              {/* Events Grid - 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EventCard 
                      event={event} 
                      onClick={() => handleEventClick(event.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-block bg-orange-100 border-2 border-orange-400 rounded-2xl px-8 py-10">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">No Events Found</h3>
                <p className="text-orange-700 mb-6">
                  {filter === 'active' && "There are no active events at the moment."}
                  {filter === 'past' && "No past events to display."}
                  {filter === 'all' && "No events available."}
                </p>
                {filter !== 'all' && (
                  <motion.button
                    onClick={() => setFilter('all')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    View All Events
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Events;