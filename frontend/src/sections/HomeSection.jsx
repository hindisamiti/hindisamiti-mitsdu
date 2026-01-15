import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousal.jsx';
import { fetchPublicImages, fetchPublicIntro } from '../utils/api.js';

const HomeSection = () => {
  const [images, setImages] = useState([]);
  const [introText, setIntroText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default intro text if none is provided
  const defaultIntro = "हिन्दी समिति is the premier Hindi language and cultural club dedicated to promoting and celebrating the rich heritage of Indian culture through literature, art, and cultural events. Join us in our mission to foster appreciation for Hindi language and Indian traditions.";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch both intro and images concurrently
        const [introResponse, imagesResponse] = await Promise.all([
          fetchPublicIntro().catch(err => {
            return { text: '' };
          }),
          fetchPublicImages().catch(err => {
            return [];
          })
        ]);

        // Set intro text
        if (introResponse && introResponse.text) {
          setIntroText(introResponse.text);
        } else {
          setIntroText(defaultIntro);
        }

        // Transform images data for ImageCarousel component
        if (imagesResponse && Array.isArray(imagesResponse) && imagesResponse.length > 0) {
          // ✅ Use environment variable for API base URL
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

          const transformedImages = imagesResponse.map(img => {
            // Convert relative URL to full backend URL
            let fullUrl;
            if (img.url.startsWith('http')) {
              fullUrl = img.url;
            } else {
              // Remove leading slash if present and add API base URL
              const cleanUrl = img.url.startsWith('/') ? img.url.substring(1) : img.url;
              fullUrl = `${API_BASE_URL}/${cleanUrl}`;
            }

            return {
              url: fullUrl,
              caption: img.caption
            };
          });

          setImages(transformedImages);
        } else {
          setImages([]);
        }

      } catch (err) {
        setError('Failed to load homepage content');
        // Use defaults on error
        setIntroText(defaultIntro);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-900 to-red-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </section>
    );
  }

  const displayIntro = introText || defaultIntro;

  return (
    <>
      <section id="home" className="relative min-h-screen overflow-hidden">
        {/* Background carousel */}
        <ImageCarousel images={images} />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-amber-400 mb-4 font-hindi">
              हिन्दी समिति
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '150px' }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-1 bg-amber-400 mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-xl md:text-2xl mb-12 leading-relaxed"
            >
              {displayIntro}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="mb-8"
            >
              <a
                href="#events"
                className="bg-yellow-500 text-orange-900 px-8 py-3 rounded-md text-lg font-bold hover:bg-yellow-400 transition-colors inline-block"
              >
                Explore Events
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latest Blogs Section */}
      <LatestBlogs />
    </>
  );
};

const LatestBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        // Dynamic import to avoid circular dependencies if any
        const { fetchPublicBlogs } = await import('../utils/api');
        const data = await fetchPublicBlogs();
        // Sort by date desc just in case, and take top 3
        const sortedBlogs = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error("Failed to load blogs for home page", error);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  if (loading) return null;

  // if (blogs.length === 0) return null; // Commented out to show section even if empty for verification

  return (
    <section className="py-16 bg-orange-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-orange-900 mb-12 font-hindi">Latest Blogs</h2>

        {blogs.length === 0 ? (
          <p className="text-center text-gray-500 mb-8 italic">No blogs published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                {blog.cover_image_url && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img
                      src={blog.cover_image_url.startsWith('http') ? blog.cover_image_url : `${import.meta.env.VITE_API_BASE_URL}${blog.cover_image_url}`}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h3>
                  <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                    <span>{blog.author || 'Admin'}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                    {blog.content.substring(0, 150)}...
                  </p>
                  <a
                    href={`/blogs/${blog.id}`}
                    className="text-orange-600 font-semibold hover:text-orange-800 transition-colors self-start mt-auto"
                  >
                    Read More &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <a
            href="/blogs"
            className="inline-block border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-2 rounded-full font-semibold transition-all"
          >
            View All Blogs
          </a>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;