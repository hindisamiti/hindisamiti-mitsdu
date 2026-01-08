import cloudinary
import cloudinary.uploader
import os
from werkzeug.utils import secure_filename

def configure_cloudinary():
    if os.getenv('CLOUDINARY_CLOUD_NAME'):
        cloudinary.config(
            cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key = os.getenv('CLOUDINARY_API_KEY'),
            api_secret = os.getenv('CLOUDINARY_API_SECRET'),
            secure = True
        )
        return True
    return False

def upload_image(file, folder="hindi_samiti"):
    """
    Uploads file to Cloudinary and returns the URL.
    If Cloudinary is not configured, returns None.
    """
    if configure_cloudinary():
        try:
            upload_result = cloudinary.uploader.upload(file, folder=folder)
            return upload_result['secure_url']
        except Exception as e:
            print(f"Cloudinary upload failed: {str(e)}")
            return None
    return None
