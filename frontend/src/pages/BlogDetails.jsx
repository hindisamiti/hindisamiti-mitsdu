import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getAbsoluteImageUrl } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogDetails = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Fetch by slug (or ID, backend handles both)
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${slug}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch blog details');
                }
                const data = await response.json();
                setBlog(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center py-20">Blog not found</div>;

    return (
        <div className="bg-orange-50 min-h-screen">
            {blog && (
                <Helmet>
                    <title>{blog.title} | Hindi Samiti</title>
                    <meta name="description" content={blog.content ? blog.content.substring(0, 160).replace(/[#*`]/g, '') : ''} />
                    <meta property="og:title" content={blog.title} />
                    <meta property="og:description" content={blog.content ? blog.content.substring(0, 160).replace(/[#*`]/g, '') : ''} />
                    {blog.cover_image_url && <meta property="og:image" content={blog.cover_image_url.startsWith('http') ? blog.cover_image_url : `${import.meta.env.VITE_API_BASE_URL}${blog.cover_image_url}`} />}
                    <meta property="og:url" content={window.location.href} />
                    <meta property="og:type" content="article" />
                </Helmet>
            )}
            <Navbar />
            <div className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
                <Link to="/blogs" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Back to Blogs</Link>

                {blog.cover_image_url && (
                    <div className="max-w-3xl mx-auto mb-8">
                        <img
                            src={getAbsoluteImageUrl(blog.cover_image_url)}
                            alt={blog.title}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                    </div>
                )}

                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{blog.title}</h1>

                <div className="flex items-center text-gray-600 mb-8 border-b border-gray-200 pb-4">
                    <span className="mr-4 font-semibold">By {blog.author}</span>
                    <span>{new Date(blog.created_at).toLocaleDateString('en-GB')}</span>
                </div>

                <div className="prose prose-lg prose-orange max-w-none">
                    {blog.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                </div>

                {/* Share Section */}
                <div className="mt-8 pt-6 border-t border-orange-200">
                    <button
                        onClick={() => {
                            // Use the backend share URL if available, else current URL
                            const backendUrl = import.meta.env.VITE_API_BASE_URL;
                            const shareUrl = `${backendUrl}/api/share/blogs/${blog.slug || blog.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            alert('Link copied to clipboard! Share this link for proper previews.');
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <span>Share Blog</span>
                    </button>
                </div>

                {/* Optional Action Buttons */}
                {(blog.button1_label && blog.button1_link) || (blog.button2_label && blog.button2_link) ? (
                    <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-orange-200">
                        {blog.button1_label && blog.button1_link && (
                            <a
                                href={blog.button1_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                            >
                                {blog.button1_label} &rarr;
                            </a>
                        )}
                        {blog.button2_label && blog.button2_link && (
                            <a
                                href={blog.button2_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-orange-600 border border-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-full shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
                            >
                                {blog.button2_label} &rarr;
                            </a>
                        )}
                    </div>
                ) : null}
            </div>
            <Footer />
        </div>
    );
};


export default BlogDetails;
