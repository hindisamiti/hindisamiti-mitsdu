import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png'; // Adjust the path as necessary

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // For sticky navbar effect
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Only handle section scrolling on home page
      if (location.pathname === '/') {
        const sections = ['home', 'about', 'events', 'team'];
        for (const section of sections.reverse()) {
          const element = document.getElementById(section);
          if (element && window.scrollY >= element.offsetTop - 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    // Set active section based on current route
    if (location.pathname === '/') {
      // Handle hash navigation on home page
      if (location.hash) {
        const section = location.hash.replace('#', '');
        setActiveSection(section);
      } else {
        setActiveSection('home');
      }
    } else if (location.pathname === '/events' || location.pathname.startsWith('/events/')) {
      setActiveSection('events');
    } else if (location.pathname === '/blogs' || location.pathname.startsWith('/blogs/')) {
      setActiveSection('blogs');
    } else {
      setActiveSection('home');
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navItems = [
    { name: 'Home', link: '/', section: 'home' },
    { name: 'About', link: '/#about', section: 'about' },
    { name: 'Events', link: '/#events', section: 'events' },
    { name: 'Team', link: '/#team', section: 'team' },
    { name: 'Blogs', link: '/blogs', section: 'blogs' },
  ];

  const handleNavClick = (item) => {
    if (item.section === 'home') {
      // For home, navigate to root
      window.location.href = '/';
    } else if (location.pathname !== '/') {
      // If not on home page, navigate to home with hash
      window.location.href = item.link;
    }
    // If already on home page, let the default Link behavior handle it
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-orange-900/90 backdrop-blur-md shadow-lg py-2' : 'bg-orange-900/30 backdrop-blur-sm py-4'
        }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Hindi Samiti Logo" className="h-12 mr-3" />
            <h1 className="text-xl font-bold text-amber-400 hidden md:block">हिन्दी समिति</h1>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <motion.a
              key={item.section}
              href={item.link}
              onClick={() => handleNavClick(item)}
              className={`text-lg font-medium transition-all duration-300 hover:text-amber-400 ${activeSection === item.section
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-white'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.name}
            </motion.a>
          ))}
          <Link to="/events">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#7C2D12' }}
              whileTap={{ scale: 0.95 }}
              className={`bg-orange-700 text-yellow-200 px-4 py-1 rounded-md hover:bg-orange-800 transition-all ${location.pathname === '/events' || location.pathname.startsWith('/events/')
                ? 'ring-2 ring-amber-400'
                : ''
                }`}
            >
              All Events
            </motion.button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="text-white text-2xl"
            onClick={() => document.getElementById('mobileMenu').classList.toggle('hidden')}
          >
            ☰
          </motion.button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div id="mobileMenu" className="hidden md:hidden bg-orange-900 bg-opacity-95 w-full absolute top-full left-0 py-2 shadow-lg">
        {navItems.map((item) => (
          <a
            key={item.section}
            href={item.link}
            onClick={() => {
              handleNavClick(item);
              document.getElementById('mobileMenu').classList.add('hidden');
            }}
            className={`block py-2 px-4 text-lg ${activeSection === item.section ? 'text-amber-400' : 'text-white'
              }`}
          >
            {item.name}
          </a>
        ))}
        <Link
          to="/events"
          className="block py-2 px-4 text-lg text-white"
          onClick={() => document.getElementById('mobileMenu').classList.add('hidden')}
        >
          All Events
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;