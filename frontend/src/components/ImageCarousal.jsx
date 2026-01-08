import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const ImageCarousel = ({ images, showCaptions = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadStatus, setImageLoadStatus] = useState({});

  // Default images in case none are provided
  const defaultImages = [
    {
      url: 'https://via.placeholder.com/1200x600/FF5733/FFFFFF?text=Hindi+Samiti+Event+1',
      caption: ''
    },
    {
      url: 'https://via.placeholder.com/1200x600/C70039/FFFFFF?text=Hindi+Samiti+Event+2',
      caption: ''
    },
    {
      url: 'https://via.placeholder.com/1200x600/900C3F/FFFFFF?text=Hindi+Samiti+Event+3',
      caption: ''
    }
  ];

  const displayImages = images && images.length > 0 ? images : defaultImages;

  useEffect(() => {
    let interval;
    if (isAutoPlaying && displayImages.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, displayImages.length]);

  const nextSlide = () => {
    if (displayImages.length <= 1) return;
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
    // Restart auto-play after manual navigation
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    if (displayImages.length <= 1) return;
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
    // Restart auto-play after manual navigation
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleImageLoad = (index, url) => {
    console.log(`✅ Image loaded successfully at index ${index}:`, url);
    setImageLoadStatus(prev => ({ ...prev, [index]: 'loaded' }));
  };

  const handleImageError = (index, url) => {
    console.error(`❌ Failed to load image at index ${index}:`, url);
    setImageLoadStatus(prev => ({ ...prev, [index]: 'error' }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Main image */}
      {displayImages.map((image, index) => (
        <motion.div
          key={index}
          className="absolute w-full h-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: currentIndex === index ? 1 : 0,
            scale: currentIndex === index ? 1 : 1.1
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <img
            src={image.url}
            alt={image.caption || `Slide ${index + 1}`}
            className="w-full h-full object-cover"
            onLoad={() => handleImageLoad(index, image.url)}
            onError={(e) => {
              handleImageError(index, image.url);
              // Set fallback image on error
              e.target.src = defaultImages[index % defaultImages.length].url;
            }}
          />

          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </motion.div>
      ))}

      {/* Caption - Only show if showCaptions prop is true and caption exists */}
      {showCaptions && displayImages[currentIndex]?.caption && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 text-center p-6 bg-gradient-to-t from-black to-transparent"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-3xl font-bold text-amber-400 mb-2">
            {displayImages[currentIndex].caption}
          </h3>
        </motion.div>
      )}

      {/* Navigation buttons - only show if more than one image */}
      {displayImages.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-orange-900 bg-opacity-50 text-white p-3 rounded-full hover:bg-orange-800 transition-colors z-40"
            onClick={prevSlide}
            aria-label="Previous image"
          >
            <FaChevronLeft />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-orange-900 bg-opacity-50 text-white p-3 rounded-full hover:bg-orange-800 transition-colors z-40"
            onClick={nextSlide}
            aria-label="Next image"
          >
            <FaChevronRight />
          </button>
        </>
      )}

      {/* Indicators - only show if more than one image */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center space-x-2 z-40">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-amber-400' : 'bg-gray-400 bg-opacity-50'
                }`}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
                setTimeout(() => setIsAutoPlaying(true), 5000);
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;