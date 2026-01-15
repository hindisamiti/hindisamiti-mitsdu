import React, { useState, useEffect } from 'react';

const LatestBlogsSection = () => {
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

export default LatestBlogsSection;
