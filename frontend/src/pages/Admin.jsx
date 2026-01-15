import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchIntro, updateIntro, fetchImages, uploadImage, deleteImage,
  fetchEvents, createEvent, updateEvent, deleteEvent,
  fetchRegistrations, updateRegistrationStatus, downloadRegistrationsExcel,
  fetchTeamMembers, fetchPublicTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember,
  createBlog, updateBlog, deleteBlog, uploadBlogCover,
  viewScreenshot, fixDatabaseSchema, uploadEventQR
} from '../utils/api';
import { checkAuth, logout } from '../utils/auth';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';




const Admin = () => {
  const navigate = useNavigate();

  // State for active tab
  const [activeTab, setActiveTab] = useState('home');

  // Authentication check
  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        navigate('/admin-login');
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-orange-50 font-hindi">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hindi Samiti Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition-colors font-medium shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="bg-orange-700 text-white shadow-md">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto">
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'home' ? 'bg-orange-900 shadow-inner' : 'hover:bg-orange-600'}`}
              onClick={() => setActiveTab('home')}
            >
              Home Content
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'events' ? 'bg-orange-900 shadow-inner' : 'hover:bg-orange-600'}`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'registrations' ? 'bg-orange-900 shadow-inner' : 'hover:bg-orange-600'}`}
              onClick={() => setActiveTab('registrations')}
            >
              Registrations
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'team' ? 'bg-orange-900 shadow-inner' : 'hover:bg-orange-600'}`}
              onClick={() => setActiveTab('team')}
            >
              Team
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'blogs' ? 'bg-orange-900 shadow-inner' : 'hover:bg-orange-600'}`}
              onClick={() => setActiveTab('blogs')}
            >
              Blogs
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'system' ? 'bg-orange-900 shadow-inner' : 'hover:bg-orange-600'}`}
              onClick={() => setActiveTab('system')}
            >
              System
            </button>
          </nav>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-orange-500">
          {activeTab === 'home' && <HomeContentSection />}
          {activeTab === 'events' && <EventsSection />}
          {activeTab === 'registrations' && <RegistrationsSection />}
          {activeTab === 'team' && <TeamSection />}
          {activeTab === 'team' && <TeamSection />}
          {activeTab === 'blogs' && <BlogsSection />}
          {activeTab === 'system' && <SystemSection />}
        </div>
      </div>
    </div>
  );
};

// Blogs Management Section
const BlogsSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [blogForm, setBlogForm] = useState({
    title: '',
    author: '',
    content: '',
    cover_image_url: '',
    button1_label: '',
    button1_link: '',
    button2_label: '',
    button2_link: ''
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blogs`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setBlogs(data);
      } else {
        setBlogs([]);
        setMessage({ text: data.message || 'Failed to load blogs', type: 'error' });
      }
    } catch (error) {
      setBlogs([]);
      setMessage({ text: 'Failed to load blogs', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedBlog(null);
    setBlogForm({
      title: '',
      author: '',
      content: '',
      cover_image_url: '',
      button1_label: '',
      button1_link: '',
      button2_label: '',
      button2_link: ''
    });
    setShowForm(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setBlogForm({
      title: blog.title,
      author: blog.author || '',
      content: blog.content,
      cover_image_url: blog.cover_image_url || '',
      button1_label: blog.button1_label || '',
      button1_link: blog.button1_link || '',
      button2_label: blog.button2_label || '',
      button2_link: blog.button2_link || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(blogId);
        setMessage({ text: 'Blog deleted successfully', type: 'success' });
        loadBlogs();
      } catch (error) {
        setMessage({ text: 'Failed to delete blog', type: 'error' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverUrl = blogForm.cover_image_url;

      // Upload image if selected
      if (coverImageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', coverImageFile);
        const uploadRes = await uploadBlogCover(formData);
        coverUrl = uploadRes.image_url;
        setIsUploading(false);
      }

      const postData = { ...blogForm, cover_image_url: coverUrl };

      if (selectedBlog) {
        await updateBlog(selectedBlog.id, postData);
        setMessage({ text: 'Blog updated successfully', type: 'success' });
      } else {
        await createBlog(postData);
        setMessage({ text: 'Blog created successfully', type: 'success' });
      }
      setShowForm(false);
      loadBlogs();
    } catch (error) {
      setIsUploading(false);
      setMessage({ text: error.response?.data?.message || 'Operation failed', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-orange-100 pb-4">
        <h2 className="text-2xl font-bold text-orange-900">Blog Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              try {
                // Import dynamically or use the one from props/context if available, 
                // but since we are in the same file as imports:
                const { fixBlogSchema } = await import('../utils/api');
                await fixBlogSchema();
                alert('Schema updated successfully!');
              } catch (e) {
                alert('Failed to update schema: ' + e.message);
              }
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow-md text-sm transition-all"
          >
            Fix Schema
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Create New Blog
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showForm ? (
        <div className="bg-orange-50 p-6 rounded-lg shadow-inner border border-orange-100">
          <h3 className="text-xl font-semibold mb-4 text-orange-800">{selectedBlog ? 'Edit Blog' : 'Create Blog'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={blogForm.title}
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={blogForm.author}
                onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Leave blank to use default (Admin)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={blogForm.content}
                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all h-64"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <div className="flex flex-col space-y-2">
                {blogForm.cover_image_url && (
                  <div className="mb-2">
                    <img
                      src={blogForm.cover_image_url}
                      alt="Current Cover"
                      className="h-32 w-auto object-cover rounded-md border border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current Image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImageFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-orange-100 file:text-orange-700
                    hover:file:bg-orange-200
                    cursor-pointer"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-orange-100">
              <div className="col-span-2">
                <h4 className="font-medium text-orange-800 mb-2">Optional Action Buttons (Max 2) or Links</h4>
              </div>

              {/* Button 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Label</label>
                <input
                  type="text"
                  value={blogForm.button1_label}
                  onChange={(e) => setBlogForm({ ...blogForm, button1_label: e.target.value })}
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Event Report"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Link</label>
                <input
                  type="text"
                  value={blogForm.button1_link}
                  onChange={(e) => setBlogForm({ ...blogForm, button1_link: e.target.value })}
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://..."
                />
              </div>

              {/* Button 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Label</label>
                <input
                  type="text"
                  value={blogForm.button2_label}
                  onChange={(e) => setBlogForm({ ...blogForm, button2_label: e.target.value })}
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Gallery"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Link</label>
                <input
                  type="text"
                  value={blogForm.button2_link}
                  onChange={(e) => setBlogForm({ ...blogForm, button2_link: e.target.value })}
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-md hover:from-orange-700 hover:to-red-700 shadow-md transition-all"
              >
                {selectedBlog ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-orange-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-100">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blog.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1 rounded-md hover:bg-orange-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Registrations Management Section
const RegistrationsSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);

        // Select first event by default if available
        if (eventsData.length > 0) {
          setSelectedEventId(eventsData[0].id);
        }
      } catch (error) {
        setMessage({ text: 'Failed to load events', type: 'error' });
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadRegistrations();
    }
  }, [selectedEventId]);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRegistrations(selectedEventId);
      setRegistrations(data);
    } catch (error) {
      setMessage({ text: 'Failed to load registrations', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEventId(e.target.value);
  };

  const handleStatusChange = async (registrationId, newStatus) => {
    try {
      await updateRegistrationStatus(registrationId, newStatus);

      // Update local state
      setRegistrations(registrations.map(reg =>
        reg.id === registrationId ? { ...reg, status: newStatus } : reg
      ));

      setMessage({ text: 'Done', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Server Error', type: 'error' });
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await downloadRegistrationsExcel(selectedEventId);
      setMessage({ text: 'Excel downloaded', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error downloading Excel', type: 'error' });
    }
  };

  const handleViewScreenshot = async (registrationId) => {
    try {
      const url = await viewScreenshot(registrationId);
      window.open(url, '_blank');
    } catch (error) {
      alert(error.message);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-orange-900 border-b border-orange-100 pb-2">Registration Management</h2>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-orange-50 p-6 rounded-lg shadow-inner border border-orange-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0 w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={handleEventChange}
              className="w-full p-2 border border-orange-200 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 outline-none transition-all"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full shadow-md text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5"
            >
              Download Excel
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-10 flex flex-col items-center justify-center text-orange-600">
            <svg className="animate-spin h-8 w-8 mb-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading registrations...</p>
          </div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-orange-100">
            <table className="min-w-full divide-y divide-orange-100">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                    Payment Screenshot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm
                        ${registration.status === 'verified'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : registration.status === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.screenshot_url && (
                        <button
                          onClick={() => handleViewScreenshot(registration.id)}
                          className="text-orange-600 hover:text-orange-900 font-medium underline"
                        >
                          View Screenshot
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(registration.id, 'verified')}
                          disabled={registration.status === 'verified'}
                          className={`px-3 py-1 rounded-md transition-all ${registration.status === 'verified'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-sm'
                            }`}
                        >
                          Verify
                        </button>

                        <button
                          onClick={() => handleStatusChange(registration.id, 'rejected')}
                          disabled={registration.status === 'rejected'}
                          className={`px-3 py-1 rounded-md transition-all ${registration.status === 'rejected'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm'
                            }`}
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleStatusChange(registration.id, 'pending')}
                          disabled={registration.status === 'pending'}
                          className={`px-3 py-1 rounded-md transition-all ${registration.status === 'pending'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 shadow-sm'
                            }`}
                        >
                          Pending
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.293l5.414 5.414a1 1 0 01.293 1.414V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No registrations found for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Home Content Management Section
const HomeContentSection = () => {
  const [intro, setIntro] = useState("");
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const introData = await fetchIntro();
        const imagesData = await fetchImages();

        setIntro(introData.text);
        setImages(imagesData);
      } catch (error) {
        setMessage({ text: 'Failed to load home content', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleIntroSave = async () => {
    try {
      await updateIntro({ text: intro });
      setMessage({ text: 'Introduction updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update introduction', type: 'error' });
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!newImage) return;

    const formData = new FormData();
    formData.append('image', newImage);

    try {
      const uploadedImage = await uploadImage(formData);
      setImages([...images, uploadedImage]);
      setNewImage(null);
      setMessage({ text: 'Image uploaded successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to upload image', type: 'error' });
    }
  };

  const handleImageDelete = async (imageId) => {
    try {
      await deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
      setMessage({ text: 'Image deleted successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to delete image', type: 'error' });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold border-b border-orange-200 pb-2 text-orange-900">Home Page Content</h2>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Intro Section */}
      <div className="bg-orange-50 p-6 rounded-lg shadow-inner border border-orange-100">
        <h3 className="text-xl font-semibold mb-4 text-orange-800">Club Introduction</h3>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          className="w-full h-40 p-3 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          placeholder="Write club introduction here..."
        ></textarea>
        <button
          onClick={handleIntroSave}
          className="mt-4 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-md hover:from-orange-700 hover:to-red-700 shadow-md transition-all"
        >
          Save Introduction
        </button>
      </div>

      {/* Image Management */}
      <div className="bg-orange-50 p-6 rounded-lg shadow-inner border border-orange-100">
        <h3 className="text-xl font-semibold mb-4 text-orange-800">Carousel Images</h3>

        {/* Upload Form */}
        <form onSubmit={handleImageUpload} className="mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
              className="flex-1 text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-100 file:text-orange-700
                hover:file:bg-orange-200
                cursor-pointer"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-md shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newImage}
            >
              Upload
            </button>
          </div>
        </form>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all">
              <img
                src={img.url}
                alt={img.caption || 'Carousel image'}
                className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <button
                  onClick={() => handleImageDelete(img.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0"
                >
                  Delete
                </button>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
                  <p className="text-white text-xs truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Events Management Section
const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState('');
  const [isUploadingQR, setIsUploadingQR] = useState(false);

  // Form fields for event
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    description: '',
    is_active: true,
    cover_image_url: '',
    formFields: []
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await fetchEvents();
      setEvents(eventsData);
    } catch (error) {
      setMessage({ text: 'Failed to load events', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventForm({
      name: event.name,
      date: event.date,
      description: event.description || '',
      is_active: event.is_active,
      cover_image_url: event.cover_image_url || '',
      formFields: event.form_fields || []
    });
    setCoverImagePreview(event.cover_image_url || '');
    setCoverImageFile(null);
    setQrCodePreview(event.qr_code_url || '');
    setQrCodeFile(null);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setEventForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      is_active: true,
      cover_image_url: '',
      formFields: [
        { label: 'Full Name', field_type: 'text', is_required: true, order: 0 },
        { label: 'Email', field_type: 'email', is_required: true, order: 1 }
      ]
    });
    setCoverImagePreview('');
    setCoverImageFile(null);
    setQrCodePreview('');
    setQrCodeFile(null);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // NEW: Handle cover image selection
  const handleCoverImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };


  // NEW: Upload cover image
  const uploadCoverImage = async () => {
    if (!coverImageFile) return null;

    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append('image', coverImageFile);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/admin/events/upload-cover-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload cover image');
      }

      const result = await response.json();
      return result.image_url;
    } catch (error) {
      console.error("Cover upload error:", error);
      throw new Error(error.message || 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleQRSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrCodePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadQR = async () => {
    if (!qrCodeFile) return null;
    try {
      setIsUploadingQR(true);
      const formData = new FormData();
      formData.append('image', qrCodeFile);
      const result = await uploadEventQR(formData);
      return result.image_url;
    } catch (error) {
      console.error("QR upload error:", error);

      let errorMessage = 'Failed to upload QR code';

      if (error.response) {
        // Server responded with a status code
        if (error.response.data && typeof error.response.data === 'object' && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          // Likely HTML error page (500 or 413)
          errorMessage = `Server Error (${error.response.status}): ` + error.response.data.substring(0, 100);
        } else {
          errorMessage = `Upload failed with status ${error.response.status}`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Network Error: No response from server';
      } else {
        errorMessage = error.message || 'Unknown Error';
      }

      throw new Error(errorMessage);
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleFormFieldChange = (index, field, value) => {
    const updatedFields = [...eventForm.formFields];
    updatedFields[index][field] = value;
    setEventForm({ ...eventForm, formFields: updatedFields });
  };

  const addFormField = () => {
    const newField = {
      label: '',
      field_type: 'text',
      is_required: true,
      order: eventForm.formFields.length
    };

    setEventForm({
      ...eventForm,
      formFields: [...eventForm.formFields, newField]
    });
  };

  const removeFormField = (index) => {
    const updatedFields = eventForm.formFields.filter((_, i) => i !== index);
    const reorderedFields = updatedFields.map((field, i) => ({
      ...field,
      order: i
    }));

    setEventForm({ ...eventForm, formFields: reorderedFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalCoverImageUrl = eventForm.cover_image_url;

      // Upload new cover image if selected
      if (coverImageFile) {
        finalCoverImageUrl = await uploadCoverImage();
      }

      let finalQRCodeUrl = eventForm.qr_code_url;
      if (qrCodeFile) {
        finalQRCodeUrl = await uploadQR();
      }

      const finalEventForm = {
        ...eventForm,
        cover_image_url: finalCoverImageUrl,
        qr_code_url: finalQRCodeUrl
      };

      if (selectedEvent) {
        await updateEvent(selectedEvent.id, finalEventForm);
        setMessage({ text: 'Event updated successfully', type: 'success' });
      } else {
        await createEvent(finalEventForm);
        setMessage({ text: 'Event created successfully', type: 'success' });
      }

      loadEvents();
      setShowForm(false);
    } catch (error) {
      console.error("Event submit error:", error);
      setMessage({
        text: error.message || (selectedEvent ? 'Failed to update event' : 'Failed to create event'),
        type: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (window.confirm(`Are you sure you want to delete "${selectedEvent.name}"?`)) {
      try {
        await deleteEvent(selectedEvent.id);
        setMessage({ text: 'Event deleted successfully', type: 'success' });
        loadEvents();
        setShowForm(false);
      } catch (error) {
        setMessage({ text: 'Failed to delete event', type: 'error' });
      }
    }
  };

  if (isLoading && events.length === 0) {
    return <div className="text-center py-10">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-orange-100 pb-4">
        <h2 className="text-2xl font-bold text-orange-900">Events Management</h2>
        <button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Create New Event
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showForm ? (
        <div className="bg-orange-50 p-6 rounded-lg shadow-inner border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold border-b border-orange-200 pb-2 text-orange-900">
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </h3>

            {/* Cover Image Upload Section - NEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>

              {/* Image Preview */}
              <div className="mb-4">
                {coverImagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-orange-200 shadow-sm">
                    <img
                      src={coverImagePreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImagePreview('');
                        setCoverImageFile(null);
                        setEventForm({ ...eventForm, cover_image_url: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-md transition-all"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-orange-200">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No cover image selected</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex items-center justify-center">
                <label className="cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-800 px-6 py-2 rounded-md border border-orange-200 shadow-sm transition-all">
                  <span>{coverImageFile ? 'Change Cover Image' : 'Select Cover Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {coverImageFile && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Selected: {coverImageFile.name}
                </p>
              )}
            </div>

            {/* QR Code Upload Section - NEW */}
            <div className="bg-white p-4 rounded-lg border border-orange-200 mt-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment QR Code (Optional)
              </label>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="mb-4 flex flex-col items-center">
                  {qrCodePreview ? (
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-orange-200 shadow-sm group">
                      <img src={qrCodePreview} alt="QR Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-start justify-end p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQrCodePreview('');
                            setQrCodeFile(null);
                            setEventForm({ ...eventForm, qr_code_url: '' });
                          }}
                          className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md transition-all transform hover:scale-110"
                          title="Remove QR Code"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                      <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <span className="text-xs text-gray-500">No QR Code</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center flex-1">
                  <div className="flex justify-start">
                    <label className="cursor-pointer bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                      <span>{qrCodeFile ? 'Change QR Code' : 'Upload QR Code'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {qrCodeFile ? `Selected: ${qrCodeFile.name}` : 'Upload the payment QR code for this event.'}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">
                    <strong>Note:</strong> If no QR code is uploaded, the event will be treated as <strong>free</strong> (no payment required).
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={eventForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date*
                </label>
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="bg-white">
                <ReactQuill
                  theme="snow"
                  value={eventForm.description}
                  onChange={(content) => setEventForm({ ...eventForm, description: content })}
                  className="h-64 mb-12" // Add margin bottom for toolbar space
                />
              </div>
            </div>

            <div className="flex items-center p-3 bg-white rounded-md border border-orange-100">
              <input
                type="checkbox"
                name="is_active"
                checked={eventForm.is_active}
                onChange={handleInputChange}
                id="is_active"
                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer select-none">
                Event is active (registrations open)
              </label>
            </div>

            {/* Registration Form Fields */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-orange-200 pb-2">
                <h4 className="text-lg font-medium text-orange-900">Registration Form Fields</h4>
                <button
                  type="button"
                  onClick={addFormField}
                  className="text-orange-600 hover:text-orange-800 font-medium flex items-center"
                >
                  <span className="text-xl mr-1">+</span> Add Field
                </button>
              </div>

              {eventForm.formFields.map((field, index) => (
                <div key={index} className="border border-orange-200 rounded-md p-4 mb-4 bg-white shadow-sm relative">
                  <div className="flex justify-between mb-2">
                    <h5 className="font-medium text-gray-700 bg-orange-50 px-2 py-0.5 rounded text-sm">Field #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeFormField(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label*
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFormFieldChange(index, 'label', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type*
                      </label>
                      <select
                        value={field.field_type}
                        onChange={(e) => handleFormFieldChange(index, 'field_type', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="image">Image Upload</option>
                      </select>
                    </div>

                    <div className="flex items-center h-full pt-6">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.is_required}
                        onChange={(e) => handleFormFieldChange(index, 'is_required', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                        Required Field
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>

              {selectedEvent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-md hover:bg-red-50 transition-all shadow-sm"
                >
                  Delete
                </button>
              )}

              <button
                type="submit"
                disabled={isUploadingCover}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-md hover:from-orange-700 hover:to-red-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingCover ? 'Uploading...' : (selectedEvent ? 'Update' : 'Create')} Event
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-100">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-orange-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-100">
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSelectEvent(event)}
                        className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1 rounded-md hover:bg-orange-100 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                    No events found. Create your first event!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Updated Team Management Section for Admin
const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form fields for team member
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    image_url: '',
    description: ''
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 ADMIN: Loading team members...');

      // Use the ADMIN function, not the public one
      const data = await fetchTeamMembers(); // This is the admin API function

      console.log('✅ ADMIN: Team members loaded:', data);
      setTeamMembers(data);
    } catch (error) {
      console.error('❌ ADMIN: Error loading team members:', error);
      setMessage({ text: 'Failed to load team members: ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setMemberForm({
      name: member.name,
      role: member.role,
      image_url: member.image_url || '',
      description: member.description || ''
    });
    setImagePreview(member.image_url || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedMember(null);
    setMemberForm({
      name: '',
      role: '',
      image_url: '',
      description: ''
    });
    setImagePreview('');
    setImageFile(null);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMemberForm({
      ...memberForm,
      [name]: value
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      // ✅ Use environment variable for API base URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/admin/team/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.image_url;
    } catch (error) {
      throw new Error('Failed to upload image: ' + error.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalImageUrl = memberForm.image_url;

      // Upload new image if selected
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }

      const finalMemberForm = {
        ...memberForm,
        image_url: finalImageUrl
      };

      if (selectedMember) {
        // Update existing team member
        await updateTeamMember(selectedMember.id, finalMemberForm);
        setMessage({ text: 'Team member updated successfully', type: 'success' });
      } else {
        // Create new team member
        await createTeamMember(finalMemberForm);
        setMessage({ text: 'Team member added successfully', type: 'success' });
      }

      // Refresh team members list
      loadTeamMembers();
      setShowForm(false);
    } catch (error) {
      setMessage({
        text: selectedMember ? 'Failed to update team member' : 'Failed to add team member',
        type: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    if (window.confirm(`Are you sure you want to remove "${selectedMember.name}" from the team?`)) {
      try {
        await deleteTeamMember(selectedMember.id);
        setMessage({ text: 'Team member removed successfully', type: 'success' });
        loadTeamMembers();
        setShowForm(false);
      } catch (error) {
        setMessage({ text: 'Failed to remove team member', type: 'error' });
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-orange-100 pb-4">
        <h2 className="text-2xl font-bold text-orange-900">Team Management</h2>
        <button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Add New Member
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Debug Panel */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-inner">
        <h3 className="font-semibold mb-2 text-orange-800">🛠️ Admin Team Debug Info:</h3>
        <div className="text-sm text-gray-700">
          <p>• Total members loaded: {teamMembers.length}</p>
          <p>• Members with images: {teamMembers.filter(m => m.image_url).length}</p>
          <p>• Members without images: {teamMembers.filter(m => !m.image_url).length}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-orange-600 hover:text-orange-800">Raw API Data</summary>
            <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40 border border-orange-100">
              {JSON.stringify(teamMembers, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {showForm ? (
        <div className="bg-orange-50 p-6 rounded-lg shadow-inner border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold border-b border-orange-200 pb-2 text-orange-900">
              {selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
            </h3>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>

              {/* Image Preview */}
              <div className="mb-4">
                {imagePreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-4 border-orange-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setMemberForm({ ...memberForm, image_url: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-orange-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex items-center justify-center">
                <label className="cursor-pointer bg-orange-100 hover:bg-orange-200 text-orange-800 px-6 py-2 rounded-md border border-orange-200 shadow-sm transition-all">
                  <span>{imageFile ? 'Change Image' : 'Select Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {imageFile && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={memberForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role*
                </label>
                <input
                  type="text"
                  name="role"
                  value={memberForm.role}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. President, Designer, Faculty Coordinator"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={memberForm.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 border border-orange-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Brief description or bio of the team member"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-all shadow-sm"
              >
                Cancel
              </button>

              {selectedMember && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-md hover:bg-red-50 transition-all shadow-sm"
                >
                  Remove Member
                </button>
              )}

              <button
                type="submit"
                disabled={isUploadingImage}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-md hover:from-orange-700 hover:to-red-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? 'Uploading...' : (selectedMember ? 'Update Member' : 'Add Member')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border border-orange-100 group"
                onClick={() => handleSelectMember(member)}
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="text-orange-300 flex flex-col items-center" style={{ display: member.image_url ? 'none' : 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="mt-2 font-medium">No Image</p>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="bg-white/90 text-orange-800 px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">Edit</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-white to-orange-50">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{member.name}</h3>
                  <p className="text-orange-600 font-medium truncate">{member.role}</p>
                  {member.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed">{member.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No team members found. Add your first team member!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// System Maintenance Section
const SystemSection = () => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleFixSchema = async () => {
    if (!window.confirm("This will attempt to run database migrations on the production server. Continue?")) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: 'Running schema migration...', type: 'info' });

      const result = await fixDatabaseSchema();
      setMessage({ text: 'Database schema updated successfully!', type: 'success' });
    } catch (error) {
      console.error("Schema fix error:", error);
      setMessage({ text: 'Failed to update schema: ' + (error.response?.data?.message || error.message), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-orange-100 pb-4">
        <h2 className="text-2xl font-bold text-orange-900">System Maintenance</h2>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-blue-50 text-blue-800 border-blue-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Schema Repair</h3>
        <p className="text-gray-600 mb-4">
          Use this if you are seeing "UndefinedColumn" errors (e.g., missing qr_code_url column) on the live site.
          This will attempt to manually add missing columns to the production database.
        </p>

        <button
          onClick={handleFixSchema}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow transition-colors disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Migration...
            </>
          ) : 'Fix Database Schema'}
        </button>
      </div>
    </div>
  );
};

export default Admin;