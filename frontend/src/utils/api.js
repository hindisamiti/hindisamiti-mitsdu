import axios from 'axios';

// ✅ Use environment variable instead of hardcoded localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_ENDPOINT = '/api';

// Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}${API_ENDPOINT}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===================== FIXED IMAGE URL PROCESSING =====================

/**
 * Convert relative image URL to absolute URL
 */
export const getAbsoluteImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  console.log(`🔧 Processing image URL: ${imageUrl}`);

  // If already absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log(`   Already absolute: ${imageUrl}`);
    return imageUrl;
  }

  // If relative URL starting with /, prepend base URL
  if (imageUrl.startsWith('/')) {
    const absoluteUrl = `${API_BASE_URL}${imageUrl}`;
    console.log(`   Made absolute: ${absoluteUrl}`);
    return absoluteUrl;
  }

  // If just filename or relative path, prepend base URL with slash
  const absoluteUrl = `${API_BASE_URL}/${imageUrl}`;
  console.log(`   Added base URL: ${absoluteUrl}`);
  return absoluteUrl;
};

/**
 * Process events data to fix cover image URLs
 */
export const processEventsImages = (events) => {
  console.log('🔄 Processing events images...');

  return events.map(event => {
    const originalUrl = event.cover_image_url;
    const processedUrl = getAbsoluteImageUrl(originalUrl);

    console.log(`📅 Event: ${event.name}`);
    console.log(`   Original cover URL: ${originalUrl || 'null'}`);
    console.log(`   Processed cover URL: ${processedUrl || 'null'}`);

    return {
      ...event,
      cover_image_url: processedUrl
    };
  });
};

// ===================== PUBLIC APIs =====================

// Public Events with corrected image URLs
export const fetchPublicEvents = async (includeFormFields = false) => {
  try {
    console.log('📡 Fetching public events...');
    const response = await api.get('/events', {
      params: { include_form_fields: includeFormFields }
    });
    const events = response.data;

    console.log('📥 Raw events from API:', events);

    // Process image URLs to make them absolute
    const processedEvents = processEventsImages(events);

    console.log('✅ Processed events:', processedEvents);

    return processedEvents;
  } catch (error) {
    console.error('❌ Error fetching public events:', error);
    throw error;
  }
};

// Public Event Details with corrected image URL
export const fetchPublicEventDetails = async (eventId) => {
  try {
    console.log(`📡 Fetching event details for ID: ${eventId}`);
    const response = await api.get(`/events/${eventId}`);
    const event = response.data;

    console.log('📥 Raw event details from API:', event);

    // Process the single event's cover image URL
    const processedEvent = {
      ...event,
      cover_image_url: getAbsoluteImageUrl(event.cover_image_url)
    };

    console.log('✅ Processed event details:', processedEvent);

    return processedEvent;
  } catch (error) {
    console.error('❌ Error fetching event details:', error);
    throw error;
  }
};

// ===================== ADMIN EVENTS APIs =====================

export const fetchEvents = async () => {
  try {
    console.log('📡 Fetching admin events...');
    const response = await api.get('/admin/events');
    const events = response.data;

    console.log('📥 Raw admin events from API:', events);

    // Process image URLs for admin side too
    const processedEvents = processEventsImages(events);

    console.log('✅ Processed admin events:', processedEvents);

    return processedEvents;
  } catch (error) {
    console.error('❌ Error fetching admin events:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    console.log('📤 Creating event with data:', eventData);
    const response = await api.post('/admin/events', eventData);
    console.log('✅ Event created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    console.log(`📤 Updating event ${eventId} with data:`, eventData);
    const response = await api.put(`/admin/events/${eventId}`, eventData);
    console.log('✅ Event updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/admin/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    throw error;
  }
};

// ===================== ALL OTHER APIs =====================

// Public Intro
export const fetchPublicIntro = async () => {
  const response = await api.get('/intro');
  return response.data;
};

// Public Images
export const fetchPublicImages = async () => {
  const response = await api.get('/images');
  return response.data;
};

// Public Team Members
export const fetchPublicTeamMembers = async () => {
  try {
    console.log('📡 Fetching public team members...');
    const response = await api.get('/team-members');
    const teamMembers = response.data;

    console.log('📥 Raw team members from API:', teamMembers);

    // Process image URLs
    const processedTeamMembers = teamMembers.map(member => ({
      ...member,
      image_url: getAbsoluteImageUrl(member.image_url)
    }));

    console.log('✅ Processed team members:', processedTeamMembers);

    return processedTeamMembers;
  } catch (error) {
    console.error('❌ Error fetching team members:', error);
    throw error;
  }
};

// Auth APIs
export const login = async (credentials) => {
  try {
    console.log('🔐 Attempting login with:', credentials.username);

    const response = await api.post('/auth/login', credentials);

    console.log('📥 Login response:', response.data);

    // Check if login was successful
    if (response.data?.success && response.data?.access_token) {
      // Store token
      localStorage.setItem('authToken', response.data.access_token);

      // Store user info
      localStorage.setItem('authUser', JSON.stringify({
        id: response.data.admin.id,
        username: response.data.admin.username
      }));

      console.log('✅ Login successful');
      return response.data;
    } else {
      // If success is false or no token, throw error
      const errorMessage = response.data?.message || 'Login failed';
      console.error('❌ Login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('❌ Login error:', error);

    // Handle different error types
    if (error.response?.data?.message) {
      // Server returned an error message
      throw new Error(error.response.data.message);
    } else if (error.message) {
      // Use the error message we threw above
      throw error;
    } else {
      // Generic error
      throw new Error('Login failed. Please try again.');
    }
  }
};

export const verifyToken = async () => {
  const response = await api.get('/admin/verify-token');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  window.location.href = '/login';
};

// Admin Content APIs
export const fetchIntro = async () => {
  const response = await api.get('/admin/intro');
  return response.data;
};

export const updateIntro = async (introData) => {
  const response = await api.put('/admin/intro', introData);
  return response.data;
};

export const fetchImages = async () => {
  const response = await api.get('/admin/images');
  return response.data;
};

export const uploadImage = async (formData) => {
  const response = await api.post('/admin/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const uploadEventQR = async (formData) => {
  const response = await api.post('/admin/events/upload-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const fixDatabaseSchema = async () => {
  const response = await api.post('/admin/fix-schema', {});
  return response.data;
};

export const deleteImage = async (imageId) => {
  const response = await api.delete(`/admin/images/${imageId}`);
  return response.data;
};

// Admin Registration APIs
export const fetchRegistrations = async (eventId) => {
  const response = await api.get(`/admin/registrations/${eventId}`);
  return response.data;
};

export const updateRegistrationStatus = async (registrationId, status) => {
  const response = await api.put(`/admin/registrations/${registrationId}/status`, { status });
  return response.data;
};

export const downloadRegistrationsExcel = async (eventId) => {
  try {
    const response = await api.get(`/admin/registrations/${eventId}/download`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    let filename = `registrations_event_${eventId}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;

    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const matches = /filename="([^"]*)"/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, message: 'Download started' };
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

// Admin Team APIs
export const fetchTeamMembers = async () => {
  try {
    console.log('📡 Fetching admin team members...');
    const response = await api.get('/admin/team');
    const teamMembers = response.data;

    console.log('📥 Raw admin team members from API:', teamMembers);

    // Process image URLs
    const processedTeamMembers = teamMembers.map(member => ({
      ...member,
      image_url: getAbsoluteImageUrl(member.image_url)
    }));

    console.log('✅ Processed admin team members:', processedTeamMembers);

    return processedTeamMembers;
  } catch (error) {
    console.error('❌ Error fetching admin team members:', error);
    throw error;
  }
};

export const createTeamMember = async (memberData) => {
  const response = await api.post('/admin/team', memberData);
  return response.data;
};

export const updateTeamMember = async (memberId, memberData) => {
  const response = await api.put(`/admin/team/${memberId}`, memberData);
  return response.data;
};

export const deleteTeamMember = async (memberId) => {
  const response = await api.delete(`/admin/team/${memberId}`);
  return response.data;
};

// Admin Blog APIs
export const createBlog = async (blogData) => {
  const response = await api.post('/admin/blogs', blogData);
  return response.data;
};

export const updateBlog = async (blogId, blogData) => {
  const response = await api.put(`/admin/blogs/${blogId}`, blogData);
  return response.data;
};

export const deleteBlog = async (blogId) => {
  const response = await api.delete(`/admin/blogs/${blogId}`);
  return response.data;
};

export const uploadBlogCover = async (formData) => {
  const response = await api.post('/admin/blogs/upload-cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Utility functions
export const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const viewScreenshot = async (registrationId) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('You are not authorized to view the screenshot.');
  }

  // ✅ Use API_BASE_URL from environment variable
  const response = await fetch(`${API_BASE_URL}/api/admin/registrations/${registrationId}/screenshot`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to load screenshot');
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  return imageUrl;
};

export default api;