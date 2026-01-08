import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCheck, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import qrCode from '../assets/qr.png';

const RegistrationForm = ({ event, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event && event.form_fields) {
      // Sort form fields by order if available
      const sortedFields = [...event.form_fields].sort((a, b) => (a.order || 0) - (b.order || 0));
      setFormFields(sortedFields);
      
      const initialData = {};
      sortedFields.forEach(field => {
        initialData[field.id] = '';
      });
      setFormData(initialData);
    }
  }, [event]);

  const checkExistingRegistration = async () => {
    if (!event) {
      setErrors({ submit: 'Event data is not available. Please try again later.' });
      return;
    }

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }
    
    setErrors({});
    setCheckingEmail(true);
    
    try {
      const response = await api.get(`/registrations/check/${event.id}?email=${encodeURIComponent(email)}`);
      if (response.data.exists) {
        setRegistrationStatus(response.data.status);
        console.log('Registration exists:', response.data.exists);
      } else {
        setRegistrationStatus('new');
        console.log('New registration:', response.data.exists);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      setErrors({ submit: 'Failed to check registration. Please try again.' });
      setRegistrationStatus('new'); // Assume new if error occurs
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
    
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ screenshot: 'File size must be less than 5MB' });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ screenshot: 'Only PNG, JPG, JPEG, and GIF files are allowed' });
        return;
      }

      setScreenshot(file);
      const previewUrl = URL.createObjectURL(file);
      setScreenshotPreview(previewUrl);
      
      if (errors.screenshot) {
        const newErrors = { ...errors };
        delete newErrors.screenshot;
        setErrors(newErrors);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required form fields
    formFields.forEach(field => {
      if (field.is_required && (!formData[field.id] || formData[field.id].trim() === '')) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    
    // Validate screenshot
    if (!screenshot) {
      newErrors.screenshot = 'Payment screenshot is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!event) {
      setErrors({ submit: 'Event data is not available. Please try again later.' });
      return;
    }

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate screenshot file again before upload
      if (!screenshot || !(screenshot instanceof File)) {
        setErrors({ submit: 'Invalid screenshot file. Please select a valid image file.' });
        setLoading(false);
        return;
      }

      // Upload screenshot first
      const formDataWithFile = new FormData();
      formDataWithFile.append('file', screenshot, screenshot.name);
      
      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataWithFile.entries()) {
        console.log(key, value);
      }
      
      // Make upload request with proper headers
      const uploadResponse = await api.post('/upload', formDataWithFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const screenshotUrl = uploadResponse.data.url;
      
      // Prepare registration data
      const registrationData = {
        event_id: event.id,
        email: email.toLowerCase().trim(),
        screenshot_url: screenshotUrl,
        responses: Object.keys(formData)
          .filter(fieldId => formData[fieldId] && formData[fieldId].trim() !== '')
          .map(fieldId => ({
            field_id: parseInt(fieldId),
            value: formData[fieldId].trim()
          }))
      };
      
      // Submit registration
      const response = await api.post('/registrations', registrationData);
      
      setRegistrationStatus('pending');
      
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      
      // Handle specific error messages from backend
      if (error.response && error.response.data && error.response.data.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: 'Failed to submit registration. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldInput = (field) => {
    const fieldValue = formData[field.id] || '';
    const hasError = errors[field.id];
    const baseInputClass = `w-full border ${hasError ? 'border-red-500' : 'border-orange-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500`;

    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            id={`field-${field.id}`}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            id={`field-${field.id}`}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={3}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={`field-${field.id}`}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'tel':
        return (
          <input
            type="tel"
            id={`field-${field.id}`}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            value={fieldValue}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  const renderStatusMessage = () => {
    switch (registrationStatus) {
      case 'pending':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
          >
            Your registration is pending verification. We'll notify you once it's approved.
          </motion.div>
        );
      case 'verified':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          >
            Your registration has been verified. You're all set for the event!
          </motion.div>
        );
      case 'rejected':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          >
            Your registration was rejected. Please contact us for more information.
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (!event) {
    return (
      <div className="bg-orange-50 rounded-lg shadow-lg p-6 max-w-xl mx-auto">
        <p className="text-red-500 text-center">Error: Event data is not available. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 rounded-lg shadow-lg p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-900 mb-6 text-center">
        {registrationStatus && registrationStatus !== 'new' 
          ? 'Registration Status' 
          : `Register for ${event?.name}`}
      </h2>
      
      {renderStatusMessage()}
      
      {(!registrationStatus || registrationStatus === 'new') && (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex space-x-2">
              <div className="flex-grow">
                <label htmlFor="email" className="block text-orange-800 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-orange-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  disabled={checkingEmail || registrationStatus === 'checking'}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div className="self-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={checkExistingRegistration}
                  disabled={checkingEmail}
                  className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:bg-orange-400"
                >
                  {checkingEmail ? (
                    <FaSpinner className="animate-spin mx-auto" />
                  ) : 'Check'}
                </motion.button>
              </div>
            </div>
          </div>
          
          {registrationStatus === 'new' && (
            <>
              {formFields.length > 0 && formFields.map((field) => (
                <div key={field.id} className="mb-4">
                  <label htmlFor={`field-${field.id}`} className="block text-orange-800 font-medium mb-1">
                    {field.label} {field.is_required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {renderFieldInput(field)}
                  
                  {errors[field.id] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
                  )}
                </div>
              ))}
              {/* QR Code Display */}
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Scan & Pay</h3>
                <div className="inline-block p-3 bg-white rounded-xl shadow-lg border border-orange-200">
                  <img
                    src={qrCode}
                    alt="QR Code for Payment"
                    className="w-40 h-40 object-contain mx-auto rounded"
                  />
                  <p className="text-sm text-orange-600 mt-2">Scan this code to pay</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-orange-800 font-medium mb-1">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <div 
                  className={`border-2 border-dashed ${errors.screenshot ? 'border-red-500' : 'border-orange-300'} rounded-lg p-4 text-center cursor-pointer hover:bg-orange-100 transition-colors`}
                  onClick={() => document.getElementById('screenshot-upload').click()}
                >
                  <input
                    type="file"
                    id="screenshot-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotChange}
                  />
                  
                  {screenshotPreview ? (
                    <div className="relative">
                      <img 
                        src={screenshotPreview} 
                        alt="Payment Screenshot" 
                        className="max-h-48 mx-auto rounded"
                      />
                      <div className="mt-2 text-green-600 flex items-center justify-center">
                        <FaCheck className="mr-1" /> Screenshot uploaded
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <FaCloudUploadAlt className="text-4xl text-orange-500 mx-auto mb-2" />
                      <p className="text-orange-800">Click or drag to upload payment screenshot</p>
                      <p className="text-orange-500 text-sm mt-1">
                        JPG, PNG or GIF • Max 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.screenshot && (
                  <p className="text-red-500 text-sm mt-1">{errors.screenshot}</p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors font-bold disabled:bg-orange-400 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </>
                ) : 'Submit Registration'}
              </motion.button>
              
              {errors.submit && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.submit}</p>
              )}
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default RegistrationForm;