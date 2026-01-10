import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaTimes, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RegistrationForm from '../components/RegistrationForm';
import { fetchPublicEventDetails } from '../utils/api';

const EventDetails = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        const data = await fetchPublicEventDetails(eventId);
        console.log('Event details:', data);
        setEvent(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setLoading(false);
      }
    };

    getEventDetails();
  }, [eventId]);

  const handleEmailCheck = async (e) => {
    e.preventDefault();

    try {
      // ✅ Use environment variable for API base URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/check-registration?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.exists) {
        setRegistrationStatus(data.status);
      } else {
        setShowRegistrationForm(true);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const isRegistrationOpen = () => {
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

  const getStatusBadge = () => {
    const badges = {
      verified: {
        icon: FaCheckCircle,
        color: 'green',
        title: 'Registration Verified',
        message: 'Your registration has been verified. ✓'
      },
      pending: {
        icon: FaExclamationCircle,
        color: 'orange',
        title: 'Pending Verification',
        message: 'Your registration is pending verification.'
      },
      rejected: {
        icon: FaTimesCircle,
        color: 'red',
        title: 'Registration Not Approved',
        message: 'Your registration was not approved. Please contact us for more information.'
      }
    };

    const badge = badges[registrationStatus];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-${badge.color}-100 border-l-4 border-${badge.color}-500 rounded-r-lg p-6 mb-6`}
      >
        <div className="flex items-start gap-4">
          <Icon className={`w-6 h-6 text-${badge.color}-600 flex-shrink-0 mt-1`} />
          <div>
            <h4 className={`text-lg font-bold text-${badge.color}-800 mb-1`}>{badge.title}</h4>
            <p className={`text-${badge.color}-700`}>{badge.message}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleRegistrationSubmit = (registrationData) => {
    setRegistrationStatus('pending');
    setShowRegistrationForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />
        <div className="relative py-20">
          <div className="container mx-auto px-4 flex flex-col items-center relative z-10">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-300"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-orange-400 to-red-600 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaCalendarAlt className="w-10 h-10 text-white" />
              </div>
            </div>
            <p className="text-orange-700 font-medium text-lg">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
        <Navbar />
        <div className="relative py-20">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="text-6xl mb-6">😕</div>
            <h2 className="text-3xl font-bold text-orange-900 mb-4">Event Not Found</h2>
            <p className="text-lg text-orange-900 mb-8">The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/events">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FaArrowLeft />
                <span>Back to Events</span>
              </motion.button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const registrationOpen = isRegistrationOpen();
  const eventDatePassed = isEventDatePassed();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />

      {/* Modal-style Content Container */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Button */}
          <Link to="/events">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 mb-8 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Events</span>
            </motion.button>
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Event Details Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-3xl overflow-hidden border-4 border-orange-400 shadow-2xl"
            >
              {/* Corner Decorations */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-xl z-10"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-xl z-10"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-xl z-10"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-xl z-10"></div>

              {/* Event Image Header */}
              {event.cover_image_url && (
                <div className="relative aspect-[4/5] w-full max-w-2xl mx-auto">
                  <img
                    src={event.cover_image_url}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="relative p-8 sm:p-12">
                {/* Title with Hindi Style */}
                <h1 className="text-4xl sm:text-5xl font-bold text-orange-900 mb-6 text-center" style={{ fontFamily: 'serif' }}>
                  {event.name}
                </h1>

                {/* Golden Quote Box */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border-2 border-orange-200 rounded-2xl p-6 mb-8 shadow-sm"
                >
                  <div
                    className="prose prose-orange w-full max-w-full hyphens-none text-orange-900"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </motion.div>

                {/* Date Info */}
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-3 bg-orange-100 px-6 py-3 rounded-full border-2 border-orange-400">
                    <FaCalendarAlt className="text-orange-600 text-xl" />
                    <span className="text-orange-900 font-semibold text-lg">{formatDate(event.date)}</span>
                  </div>
                </div>

                {/* Registration Section */}
                {registrationOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6 sm:p-8 border-2 border-orange-400"
                  >
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <FaCheckCircle className="w-8 h-8 text-orange-600" />
                      <h2 className="text-2xl sm:text-3xl font-bold text-orange-900">Registration</h2>
                    </div>

                    {registrationStatus ? (
                      getStatusBadge()
                    ) : showRegistrationForm ? (
                      <RegistrationForm
                        event={event}
                        onSubmit={handleRegistrationSubmit}
                      />
                    ) : (
                      <form onSubmit={handleEmailCheck} className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-orange-900 font-semibold mb-2">
                            Enter your email to check registration status or register:
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          Continue →
                        </motion.button>
                      </form>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-100 rounded-2xl p-6 sm:p-8 border-2 border-gray-300"
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <FaTimesCircle className="w-8 h-8 text-gray-500" />
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">Registration Closed</h2>
                    </div>

                    <p className="text-gray-600 text-center text-lg">
                      Registration for this event is currently closed.
                      {eventDatePassed && " This event has already concluded."}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetails;