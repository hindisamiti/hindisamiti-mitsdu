import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import EventCard from '../components/EventCard';
import { fetchPublicEvents } from '../utils/api';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetchPublicEvents();
        console.log('Fetched events:', response);
        setEvents(response);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`, { 
      state: { from: 'home' } 
    });
  };

  // Sample events for fallback
  const sampleEvents = [
    {
      id: 1,
      name: 'कवि सम्मेलन',
      date: '2025-06-15',
      description: 'An evening of Hindi poetry featuring renowned poets and student performances.',
      is_active: true,
      cover_image_url: 'https://via.placeholder.com/400x400/1a1a1a/FFD700?text=Kavi+Sammelan'
    },
    {
      id: 2,
      name: 'अभिव्यक्ति गायन',
      date: '2025-09-14',
      description: 'Join us for a day-long celebration of Hindi language with competitions and cultural performances.',
      is_active: true,
      cover_image_url: 'https://via.placeholder.com/400x400/1a1a1a/FFD700?text=Abhivyakti'
    },
    {
      id: 3,
      name: 'चक्रव्यूह',
      date: '2025-07-25',
      description: 'A theatrical festival showcasing Hindi dramas and plays performed by students.',
      is_active: true,
      cover_image_url: 'https://via.placeholder.com/400x400/1a1a1a/FFD700?text=Chakravyuh'
    }
  ];

  const displayEvents = events.length > 0 ? events : (error ? sampleEvents : []);

  return (
    <section id="events" className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
      {/* Elegant gradient background matching About section */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="pt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900 mb-4">
            प्रतियोगिता पृष्ठ
          </h2>

          <div className="inline-block">
            <span className="text-lg sm:text-xl md:text-2xl font-medium tracking-wide text-orange-900">
              Events & Competitions
            </span>
            <div className="h-1 bg-orange-900 rounded-full mt-2"></div>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto px-4 leading-relaxed mt-6"
          >
            Explore our exciting cultural events celebrating the richness of Hindi language and Indian traditions
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <div className="absolute inset-0 rounded-full border-4 border-orange-300"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-orange-400 to-red-600 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaCalendarAlt className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="mt-6 text-orange-700 font-medium text-lg">Loading events...</p>
          </div>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="inline-block bg-orange-100 border-l-4 border-orange-500 text-orange-800 px-6 py-3 rounded-r-lg">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm mt-1">Showing sample events</p>
                </div>
              </motion.div>
            )}
            
            {/* Events Grid - 4 columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {displayEvents.slice(0, 8).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <EventCard 
                    event={event} 
                    onClick={() => handleEventClick(event.id)}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* View All Button */}
            {displayEvents.length > 8 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <Link to="/events">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                  >
                    <span className="relative z-10">View All Events</span>
                    <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#fff6e6" fillOpacity="0.5"/>
        </svg>
      </div>
    </section>
  );
};

export default EventsSection;