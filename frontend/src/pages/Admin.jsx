import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchIntro, updateIntro, fetchImages, uploadImage, deleteImage,
  fetchEvents, createEvent, updateEvent, deleteEvent,
  fetchRegistrations, updateRegistrationStatus, downloadRegistrationsExcel,
  fetchTeamMembers, fetchPublicTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember,
  createBlog, updateBlog, deleteBlog, uploadBlogCover,
  viewScreenshot
} from '../utils/api';
import { checkAuth, logout } from '../utils/auth';




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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-indigo-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hindi Samiti Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="bg-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto">
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'home' ? 'bg-indigo-900' : 'hover:bg-indigo-800'}`}
              onClick={() => setActiveTab('home')}
            >
              Home Content
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'events' ? 'bg-indigo-900' : 'hover:bg-indigo-800'}`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'registrations' ? 'bg-indigo-900' : 'hover:bg-indigo-800'}`}
              onClick={() => setActiveTab('registrations')}
            >
              Registrations
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'team' ? 'bg-indigo-900' : 'hover:bg-indigo-800'}`}
              onClick={() => setActiveTab('team')}
            >
              Team
            </button>
            <button
              className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === 'blogs' ? 'bg-indigo-900' : 'hover:bg-indigo-800'}`}
              onClick={() => setActiveTab('blogs')}
            >
              Blogs
            </button>
          </nav>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'home' && <HomeContentSection />}
        {activeTab === 'events' && <EventsSection />}
        {activeTab === 'registrations' && <RegistrationsSection />}
        {activeTab === 'team' && <TeamSection />}
        {activeTab === 'blogs' && <BlogsSection />}
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
    cover_image_url: ''
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
      setBlogs(data);
    } catch (error) {
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
      cover_image_url: ''
    });
    setShowForm(true);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setBlogForm({
      title: blog.title,
      author: blog.author || '',
      content: blog.content,
      cover_image_url: blog.cover_image_url || ''
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <button
          onClick={handleCreateNew}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Create New Blog
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">{selectedBlog ? 'Edit Blog' : 'Create Blog'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={blogForm.title}
                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                value={blogForm.author}
                onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Leave blank to use default (Admin)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={blogForm.content}
                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-64"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={blogForm.cover_image_url}
                  onChange={(e) => setBlogForm({ ...blogForm, cover_image_url: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <span className="text-gray-500 text-sm">OR Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImageFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {selectedBlog ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blog.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <h2 className="text-2xl font-bold">Registration Management</h2>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={handleEventChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download Excel
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-6">Loading registrations...</div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Screenshot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${registration.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : registration.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.screenshot_url && (
                        <button
                          onClick={() => handleViewScreenshot(registration.id)}
                          className="text-indigo-600 hover:text-indigo-900"
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
                          className={`px-2 py-1 rounded-md ${registration.status === 'verified'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          Verify
                        </button>

                        <button
                          onClick={() => handleStatusChange(registration.id, 'rejected')}
                          disabled={registration.status === 'rejected'}
                          className={`px-2 py-1 rounded-md ${registration.status === 'rejected'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleStatusChange(registration.id, 'pending')}
                          disabled={registration.status === 'pending'}
                          className={`px-2 py-1 rounded-md ${registration.status === 'pending'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                        >
                          Mark Pending
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No registrations found for this event.
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
      <h2 className="text-2xl font-bold border-b pb-2">Home Page Content</h2>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Intro Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Club Introduction</h3>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          className="w-full h-40 p-3 border rounded-md"
          placeholder="Write club introduction here..."
        ></textarea>
        <button
          onClick={handleIntroSave}
          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Save Introduction
        </button>
      </div>

      {/* Image Management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Carousel Images</h3>

        {/* Upload Form */}
        <form onSubmit={handleImageUpload} className="mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
              className="flex-1"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              disabled={!newImage}
            >
              Upload
            </button>
          </div>
        </form>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt={img.caption || 'Carousel image'}
                className="w-full h-40 object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                <button
                  onClick={() => handleImageDelete(img.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  Delete
                </button>
              </div>
              {img.caption && (
                <p className="mt-1 text-sm text-gray-600 truncate">{img.caption}</p>
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

      const response = await fetch('/api/admin/events/upload-cover-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload cover image');
      }

      const result = await response.json();
      return result.image_url;
    } catch (error) {
      throw new Error('Failed to upload cover image: ' + error.message);
    } finally {
      setIsUploadingCover(false);
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

      const finalEventForm = {
        ...eventForm,
        cover_image_url: finalCoverImageUrl
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
      setMessage({
        text: selectedEvent ? 'Failed to update event' : 'Failed to create event',
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events Management</h2>
        <button
          onClick={handleCreateNew}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Create New Event
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">
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
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-300">
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
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No cover image selected</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex items-center justify-center">
                <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md border border-indigo-300">
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
                  className="w-full p-2 border rounded-md"
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
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 border rounded-md"
              ></textarea>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={eventForm.is_active}
                onChange={handleInputChange}
                id="is_active"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Event is active (registrations open)
              </label>
            </div>

            {/* Registration Form Fields */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Registration Form Fields</h4>
                <button
                  type="button"
                  onClick={addFormField}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  + Add Field
                </button>
              </div>

              {eventForm.formFields.map((field, index) => (
                <div key={index} className="border rounded-md p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h5 className="font-medium">Field #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeFormField(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
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
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type*
                      </label>
                      <select
                        value={field.field_type}
                        onChange={(e) => handleFormFieldChange(index, 'field_type', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="image">Image Upload</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.is_required}
                        onChange={(e) => handleFormFieldChange(index, 'is_required', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700">
                        Required Field
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>

              {selectedEvent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              )}

              <button
                type="submit"
                disabled={isUploadingCover}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingCover ? 'Uploading...' : (selectedEvent ? 'Update' : 'Create')} Event
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
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
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleSelectEvent(event)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <button
          onClick={handleCreateNew}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Add New Member
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Debug Panel */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">🛠️ Admin Team Debug Info:</h3>
        <div className="text-sm">
          <p>• Total members loaded: {teamMembers.length}</p>
          <p>• Members with images: {teamMembers.filter(m => m.image_url).length}</p>
          <p>• Members without images: {teamMembers.filter(m => !m.image_url).length}</p>
          <details className="mt-2">
            <summary className="cursor-pointer">Raw API Data</summary>
            <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(teamMembers, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">
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
                      className="w-full h-full object-cover rounded-full border-4 border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setMemberForm({ ...memberForm, image_url: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex items-center justify-center">
                <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md border border-indigo-300">
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description or bio of the team member"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>

              {selectedMember && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Remove Member
                </button>
              )}

              <button
                type="submit"
                disabled={isUploadingImage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectMember(member)}
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="text-gray-400 flex flex-col items-center" style={{ display: member.image_url ? 'none' : 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="mt-2">No Image</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-indigo-600">{member.role}</p>
                  {member.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">{member.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No team members found. Add your first team member!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;