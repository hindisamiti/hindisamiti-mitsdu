import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeSection from '../sections/HomeSection';
import AboutSection from '../sections/AboutSection';
import EventsSection from '../sections/EventsSection';
import TeamSection from '../sections/TeamSection';

const Landing = () => {
  // Smooth scroll to section when clicking navigation links
  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Handle initial load with hash
    handleHashChange();
    
    // Add event listener for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-50 min-h-screen">
      <Navbar />
      <main>
        <section id="home" className="scroll-mt-16">
          <HomeSection />
        </section>
        
        <section id="about" className="scroll-mt-16">
          <AboutSection />
        </section>
        
        <section id="events" className="scroll-mt-16">
          <EventsSection />
        </section>
        
        <section id="team" className="scroll-mt-16">
          <TeamSection />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;