import cloudinary
import cloudinary.uploader
import os
from werkzeug.utils import secure_filename

def configure_cloudinary():
    if os.getenv('CLOUDINARY_CLOUD_NAME') and os.getenv('CLOUDINARY_API_KEY') and os.getenv('CLOUDINARY_API_SECRET'):
        cloudinary.config(
            cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key = os.getenv('CLOUDINARY_API_KEY'),
            api_secret = os.getenv('CLOUDINARY_API_SECRET'),
            secure = True
        )
        return True
    return False

def check_cloudinary_config():
    """Helper to check if configuration exists without initializing if not needed"""
    return bool(os.getenv('CLOUDINARY_CLOUD_NAME') and os.getenv('CLOUDINARY_API_KEY') and os.getenv('CLOUDINARY_API_SECRET'))

def upload_image(file, folder="hindi_samiti"):
    """
    Uploads file to Cloudinary and returns the URL.
    If Cloudinary is not configured, returns None.
    """

    if not check_cloudinary_config():
        print("❌ Cloudinary credentials missing in environment variables")
        # Return None or raise? Returning None was old behavior, but better to signal why.
        # However, to keep backward compatibility with other routes that might expect None, 
        # we will print valid error. But for the new route we want to know.
        # Let's return None but ensure we log it.
        return None

    if configure_cloudinary():
        # Let exceptions propagate so the caller (routes.py) knows exactly what went wrong
        # e.g. "File size too large", "Invalid API key", etc.
        upload_result = cloudinary.uploader.upload(file, folder=folder)
        return upload_result['secure_url']
        
    return None
