import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAbsoluteImageUrl } from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogDetails = () => {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}`);
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
    }, [blogId]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center py-20">Blog not found</div>;

    return (
        <div className="bg-orange-50 min-h-screen">
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

                <div className="overflow-x-auto pb-2">
                    <div
                        className="prose prose-lg prose-orange max-w-none text-left"
                        style={{ wordBreak: 'normal', overflowWrap: 'normal', minWidth: '100%', hyphens: 'none' }}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default BlogDetails;
