import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`);
                if (!response.ok) {
                    throw new Error('Failed to fetch blogs');
                }
                const data = await response.json();
                setBlogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className="bg-orange-50 min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-8 mt-16">
                <h1 className="text-4xl font-bold text-orange-900 mb-8 text-center">Our Blogs</h1>

                {loading && <p className="text-center text-gray-600">Loading blogs...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && blogs.length === 0 && (
                    <p className="text-center text-gray-600">No blogs posted yet.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            {blog.cover_image_url && (
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}${blog.cover_image_url}`}
                                    alt={blog.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{blog.title}</h2>
                                <div className="flex justify-between items-center text-gray-500 text-sm mb-4">
                                    <span>By {blog.author}</span>
                                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {blog.content.substring(0, 150)}...
                                </p>
                                <Link
                                    to={`/blogs/${blog.id}`}
                                    className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
                                >
                                    Read More
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Blogs;
