import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TeamMemberCard from '../components/TeamMemberCard';
import { FaUsers } from 'react-icons/fa';
import axios from 'axios';

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
useEffect(() => {
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      // ✅ Use environment variable for API base URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${API_BASE_URL}/api/team-members`);
      setTeamMembers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load team members. Please try again later.');
      setLoading(false);
      console.error('Error fetching team members:', err);
    }
  };

  fetchTeamMembers();
}, []);

  // Group team members by role
  const getTeamMembersByRole = () => {
    const roles = {
      facultyCoordinators: [],
      president: [],
      coreTeam: [],
      developers: []
    };

    teamMembers.forEach(member => {
      const role = member.role.toLowerCase();
      
      if (role.includes('faculty') || role.includes('coordinator')) {
        roles.facultyCoordinators.push(member);
      } else if (role.includes('president')) {
        roles.president.push(member);
      } else if (role.includes('developer')) {
        roles.developers.push(member);
      } else {
        roles.coreTeam.push(member);
      }
    });

    return roles;
  };

  const renderTeamCategory = (title, members, categoryKey) => {
    if (members.length === 0) return null;

    const isPresident = categoryKey.toLowerCase().includes('president');
    
    // Different grid layouts based on category
    let gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8";
    
    if (categoryKey === 'faculty') {
      gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto";
    } else if (isPresident) {
      gridClass = "flex justify-center";
    }

    return (
      <div className="mb-16 sm:mb-20 lg:mb-24" key={categoryKey}>
        {/* Category Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-900 inline-block relative">
            {title}
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 rounded-full"></div>
          </h3>
        </motion.div>

        {/* Team Members Grid */}
        <div className={gridClass}>
          {members.map((member, index) => (
            <motion.div
              key={`${member.id || member.name}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={isPresident ? "w-full max-w-sm" : "w-full"}
            >
              <TeamMemberCard member={member} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const teamRoles = teamMembers.length > 0 ? getTeamMembersByRole() : {
    facultyCoordinators: [],
    president: [],
    coreTeam: [],
    developers: []
  };

  return (
    <section id="team" className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
      {/* Smooth flowing background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Cultural pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          {/* Main Heading */}
          <h2 className="pt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900 mb-4">
            हमारी टीम
          </h2>
          
          <div className="inline-block mb-6">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full mt-2"></div>
          </div>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-orange-800 max-w-3xl mx-auto px-4 leading-relaxed"
          >
            Meet the dedicated individuals who bring our cultural vision to life through passion, creativity, and commitment
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 mx-auto w-24 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 rounded-full"
          ></motion.div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
              {/* Inner pulse */}
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 animate-pulse"></div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-orange-700 font-medium text-lg">Loading our amazing team...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-block bg-red-100 border-l-4 border-red-500 text-red-800 px-8 py-4 rounded-r-lg shadow-md">
              <p className="font-medium text-lg">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Team Members Display */}
        {!loading && !error && (
          <div>
            {renderTeamCategory("Faculty Coordinators", teamRoles.facultyCoordinators, "faculty")}
            {renderTeamCategory("President", teamRoles.president, "president")}
            {renderTeamCategory("Core Team", teamRoles.coreTeam, "core")}
            {renderTeamCategory("Developers", teamRoles.developers, "developers")}
            
            {/* Empty state if no team members */}
            {teamMembers.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-block bg-orange-100 border-2 border-orange-300 rounded-2xl px-8 py-6">
                  <FaUsers className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-orange-800 text-lg font-medium">No team members found</p>
                  <p className="text-orange-600 text-sm mt-2">Check back soon to meet our team!</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Bottom decorative wave for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#fff7ed" fillOpacity="0.5"/>
        </svg>
      </div>
    </section>
  );
};

export default TeamSection;