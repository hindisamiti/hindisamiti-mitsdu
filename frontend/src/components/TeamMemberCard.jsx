import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAbsoluteImageUrl } from '../utils/api';

const TeamMemberCard = ({ member }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const {
    name,
    role,
    image_url,
    description
  } = member;
  
  // FORCE PROCESS THE URL HERE AS A BACKUP
  const processedImageUrl = getAbsoluteImageUrl(image_url);
  
  const handleImageError = (event) => {
    setImageError(true);
    setImageLoading(false);
  };
  
  const handleImageLoad = (event) => {
    setImageLoading(false);
    setImageError(false);
  };
  
  // Determine which URL to use for the img tag
  const finalImageUrl = processedImageUrl || image_url;
  
  // Enhanced fallback image component
  const FallbackImage = () => (
    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center relative">
      <div className="text-white text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <div className="text-2xl font-bold">
          {name ? name.charAt(0).toUpperCase() : 'M'}
        </div>
      </div>
    </div>
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex flex-col items-center max-w-xs mx-auto"
    >
      <div className="relative mb-4 group">
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg bg-gray-100">
          {finalImageUrl ? (
            <>
              {/* Loading state */}
              {imageLoading && !imageError && (
                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              )}
              
              {/* The actual image - NOW USING PROCESSED URL */}
              <img 
                src={finalImageUrl}
                alt={`${name} - ${role}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ 
                  display: imageError ? 'none' : 'block'
                }}
                loading="lazy"
                crossOrigin="anonymous"
              />
              
              {/* Show fallback if there's an error */}
              {imageError && <FallbackImage />}
            </>
          ) : (
            <FallbackImage />
          )}
        </div>
        
        {/* Role badge */}
        <div className="absolute -bottom-2 left-0 right-0 mx-auto w-36 bg-orange-600 text-center text-white py-1 rounded-full shadow-md">
          <p className="text-sm font-medium truncate px-2">{role}</p>
        </div>
      </div>
      
      {/* Member details */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-orange-900 mb-1">{name}</h3>
        {description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            whileHover={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
          >
            <p className="text-gray-700 text-sm max-w-xs mx-auto mt-2 px-2">{description}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;