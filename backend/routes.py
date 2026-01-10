import ast
import base64
import csv
from datetime import datetime
import io
from flask import current_app
from flask import Blueprint, request, jsonify, send_file, abort
from sqlalchemy import extract, func, text
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload

from flask_cors import CORS
from werkzeug.utils import secure_filename
from functools import wraps
import jwt as pyjwt
import os
from io import BytesIO
import uuid
import mimetypes
from utils.image_upload import upload_image

# Import your models
from models import db, Admin, Image, Intro, Event, EventFormField, Registration, RegistrationFieldResponse, TeamMember, Blog

# JWT Secret Key (Change this for production!)
jwt = JWTManager()
SECRET_KEY = "ShreyaKhantal:)"

route = Blueprint('main', __name__)

# Allowed file extensions for image uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Enable CORS for all routes including static files
def configure_cors(app):
    """Configure CORS for the Flask app"""
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        },
        r"/uploads/*": {
            "origins": "*",
            "methods": ["GET"],
            "allow_headers": ["Content-Type"]
        }
    })


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print("🔥 Raw token header:", token)

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            if token.startswith('Bearer '):
                token = token[7:]

            print("🧪 Decoding token...")
            data = pyjwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            print("✅ Token decoded:", data)

            admin_id = data.get("sub")  # we encoded admin_id as a string in 'sub'

            if not admin_id:
                return jsonify({'message': 'Token payload missing `sub` (admin_id)'}), 401

            current_admin = Admin.query.get(int(admin_id))  # convert to int
            if not current_admin:
                return jsonify({'message': 'Invalid token: admin not found'}), 401

        except pyjwt.ExpiredSignatureError:
            print("❌ Token expired")
            return jsonify({'message': 'Token has expired'}), 401
        except pyjwt.InvalidTokenError as e:
            print("❌ Invalid token:", str(e))
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401

        return f(current_admin, *args, **kwargs)

    return decorated

# Public Routes (No Authentication Required)

@route.route('/api/intro', methods=['GET'])
def get_public_intro():
    """Public endpoint to get introduction text for homepage"""
    try:
        intro = Intro.query.first()
        if intro:
            return jsonify({'text': intro.text}), 200
        else:
            return jsonify({'text': ''}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/images', methods=['GET'])
def get_public_images():
    """Public endpoint to get all images for homepage gallery"""
    try:
        images = Image.query.order_by(Image.created_at.desc()).all()
        images_data = []
        
        for img in images:
            images_data.append({
                'id': img.id,
                'url': img.url,
                'caption': img.caption,
                'created_at': img.created_at.isoformat()
            })
        
        return jsonify(images_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/team-members', methods=['GET'])
def get_public_team_members():
    """Public endpoint to get team members for about/team page"""
    try:
        team_members = TeamMember.query.all()
        team_data = []
        
        for member in team_members:
            team_data.append({
                'id': member.id,
                'name': member.name,
                'role': member.role,
                'image_url': member.image_url,
                'description': member.description
            })
        
        return jsonify(team_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/events', methods=['GET'])
def get_public_events():
    """Public endpoint to get active events for events page"""
    try:
        include_form_fields = request.args.get('include_form_fields', 'false').lower() == 'true'
        
        events = Event.query.order_by(Event.date.desc()).all()
        events_data = []
        
        for event in events:
            print(f"Public event {event.id} cover_image_url: {event.cover_image_url}")
            
            event_data = {
                'id': event.id,
                'name': event.name,
                'date': event.date.isoformat(),
                'description': event.description,
                'cover_image_url': event.cover_image_url,
                'is_active': event.is_active
            }
            
            # Include form fields if requested
            if include_form_fields:
                form_fields = []
                for field in event.form_fields:
                    form_fields.append({
                        'id': field.id,
                        'label': field.label,
                        'field_type': field.field_type,
                        'is_required': field.is_required,
                        'order': field.order
                    })
                event_data['form_fields'] = sorted(form_fields, key=lambda x: x['order'])
            
            events_data.append(event_data)
        
        return jsonify(events_data), 200
        
    except Exception as e:
        print(f"❌ Error in get_public_events: {str(e)}")
        return jsonify({'message': str(e)}), 500

@route.route('/api/events/<int:event_id>', methods=['GET'])
def get_public_event_details(event_id):
    """Public endpoint to get specific event details with form fields"""
    try:
        event = Event.query.filter_by(id=event_id).first()
        
        if not event:
            return jsonify({'message': 'Event not found or not active'}), 404
        
        form_fields = []
        for field in event.form_fields:
            form_fields.append({
                'id': field.id,
                'label': field.label,
                'field_type': field.field_type,
                'is_required': field.is_required,
                'order': field.order
            })
        
        event_data = {
            'id': event.id,
            'name': event.name,
            'date': event.date.isoformat(),
            'description': event.description,
            'cover_image_url': event.cover_image_url,
            'form_fields': sorted(form_fields, key=lambda x: x['order']),
            'is_active': event.is_active
        }
        
        return jsonify(event_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Authentication Routes

@route.route('/api/auth/login', methods=['POST'])
def admin_login():
    """Admin login endpoint - MAIN LOGIN ROUTE"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        # Validate input
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        # Find admin by username
        admin = Admin.query.filter_by(username=username).first()
        
        if not admin:
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Check password
        if not check_password_hash(admin.password_hash, password):
            return jsonify({
                'success': False,
                'message': 'Invalid username or password'
            }), 401
        
        # Create JWT token using pyjwt (consistent with token_required decorator)
        payload = {
            'sub': str(admin.id),  # Keep as string for consistency
            'username': admin.username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = pyjwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'access_token': token,
            'admin': {
                'id': admin.id,
                'username': admin.username
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")  # For debugging
        return jsonify({
            'success': False,
            'message': 'Login failed. Please try again.'
        }), 500

@route.route('/api/admin/verify-token', methods=['GET'])
@token_required
def verify_token(current_admin):
    """Verify admin token"""
    return jsonify({
        'valid': True, 
        'admin': {
            'id': current_admin.id,
            'username': current_admin.username
        }
    }), 200

@route.route('/api/admin/fix-schema', methods=['POST'])
@token_required
def fix_schema(current_admin):
    """Run manual schema migration for production"""
    try:
        print("🔧 SCHEMA FIX: Attempting to add qr_code_url column")
        # Raw SQL to add column - compatible with Postgres
        db.session.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS qr_code_url VARCHAR(255)"))
        db.session.commit()
        print("✅ SCHEMA FIX: Successfully updated schema")
        return jsonify({'message': 'Schema updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"❌ SCHEMA FIX ERROR: {str(e)}")
        # Check if error is because column exists (for databases that don't support IF NOT EXISTS like old SQLite)
        if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
             return jsonify({'message': 'Column already exists'}), 200
        return jsonify({'message': str(e)}), 500

# Admin Home Content Routes

@route.route('/api/admin/intro', methods=['GET'])
@token_required
def get_intro(current_admin):
    intro = Intro.query.first()
    return jsonify({'text': intro.text if intro else ''}), 200

@route.route('/api/admin/intro', methods=['PUT'])
@token_required
def update_intro(current_admin):
    data = request.get_json()
    text = data.get('text', '')
    intro = Intro.query.first()
    if intro:
        intro.text = text
    else:
        intro = Intro(text=text)
        db.session.add(intro)
    db.session.commit()
    return jsonify({'message': 'Intro updated successfully'}), 200



@route.route('/api/admin/blogs/upload-cover', methods=['POST'])
@token_required
def upload_blog_cover(current_admin):
    try:
        print("📤 UPLOAD: Received blog cover image upload request")
        
        if 'image' not in request.files:
            print("❌ UPLOAD: No image file in request")
            return jsonify({'success': False, 'error': 'No image file provided'}), 400
            
        file = request.files['image']
        print(f"📎 UPLOAD: File received: {file.filename}")
        
        if file.filename == '':
            print("❌ UPLOAD: Empty filename")
            return jsonify({'success': False, 'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            print(f"❌ UPLOAD: Invalid file type: {file.filename}")
            return jsonify({
                'success': False, 
                'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP files are allowed'
            }), 400

        # Try Cloudinary upload first
        cloudinary_url = upload_image(file, folder="hindi_samiti/blogs")
        if cloudinary_url:
            print(f"✅ UPLOAD: Uploaded to Cloudinary: {cloudinary_url}")
            return jsonify({
                'success': True,
                'image_url': cloudinary_url
            }), 200
        
        # Fallback to local storage
        print("📁 UPLOAD: Cloudinary failed, using local storage")
        
        # Create blog covers upload directory
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        blog_covers_folder = os.path.join(upload_folder, 'blog_covers')
        os.makedirs(blog_covers_folder, exist_ok=True)
        
        # Reset file pointer if read by cloudinary
        file.seek(0)
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = str(uuid.uuid4()) + '.' + file_extension
        filepath = os.path.join(blog_covers_folder, filename)
        
        print(f"💾 UPLOAD: Saving to: {filepath}")
        
        # Save the file
        file.save(filepath)
        
        # Verify file was saved
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            print(f"✅ UPLOAD: File saved successfully ({file_size} bytes)")
        else:
            print(f"❌ UPLOAD: File not found after save!")
            return jsonify({'success': False, 'error': 'Failed to save file'}), 500
        
        # Return the image URL
        image_url = f'/uploads/blog_covers/{filename}'
        print(f"🔗 UPLOAD: Returning URL: {image_url}")
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'filename': filename
        }), 200
            
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@route.route('/api/admin/images', methods=['GET'])
@token_required
def get_images(current_admin):
    try:
        images = Image.query.order_by(Image.created_at.desc()).all()
        images_data = []
        
        for img in images:
            images_data.append({
                'id': img.id,
                'url': img.url,
                'caption': img.caption,
                'created_at': img.created_at.isoformat()
            })
        
        return jsonify(images_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/images', methods=['POST'])
@token_required
def upload_gallery_image(current_admin):
    try:
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        caption = request.form.get('caption', '')
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        # Try Cloudinary upload
        cloudinary_url = upload_image(file, folder="hindi_samiti/home")
        
        if cloudinary_url:
            # Create image record with Cloudinary URL
            new_image = Image(url=cloudinary_url, caption=caption)
            db.session.add(new_image)
            db.session.commit()
            
            return jsonify({
                'id': new_image.id,
                'url': new_image.url,
                'caption': new_image.caption,
                'created_at': new_image.created_at.isoformat()
            }), 201
            
        # Fallback to local (only if Cloudinary fails)
        if file and allowed_file(file.filename):
            print("📁 UPLOAD: Cloudinary failed, using local storage")
            
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)
            
            # Create image record
            image_url = f'/uploads/{filename}'
            new_image = Image(url=image_url, caption=caption)
            db.session.add(new_image)
            db.session.commit()
            
            return jsonify({
                'id': new_image.id,
                'url': new_image.url,
                'caption': new_image.caption,
                'created_at': new_image.created_at.isoformat()
            }), 201
        else:
            return jsonify({'message': 'Invalid file type'}), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/images/<int:image_id>', methods=['DELETE'])
@token_required
def delete_image(current_admin, image_id):
    try:
        image = Image.query.get_or_404(image_id)
        
        # Delete physical file
        if image.url.startswith('/uploads/'):
            filename = image.url.replace('/uploads/', '')
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            filepath = os.path.join(upload_folder, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        db.session.delete(image)
        db.session.commit()
        
        return jsonify({'message': 'Image deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# Admin Events Routes

@route.route('/api/admin/events', methods=['GET'])
@token_required
def get_events(current_admin):
    try:
        events = Event.query.order_by(Event.date.desc()).all()
        events_data = []
        
        for event in events:
            form_fields = []
            for field in event.form_fields:
                form_fields.append({
                    'id': field.id,
                    'label': field.label,
                    'field_type': field.field_type,
                    'is_required': field.is_required,
                    'order': field.order
                })
            
            # Log the cover_image_url for debugging
            print(f"Event {event.id} cover_image_url in DB: {event.cover_image_url}")
            
            events_data.append({
                'id': event.id,
                'name': event.name,
                'date': event.date.isoformat(),
                'description': event.description,
                'is_active': event.is_active,
                'cover_image_url': event.cover_image_url,  # Send exactly what's in DB
                'form_fields': sorted(form_fields, key=lambda x: x['order'])
            })
        
        return jsonify(events_data), 200
        
    except Exception as e:
        print(f"❌ Error fetching events: {str(e)}")
        return jsonify({'message': str(e)}), 500
    
@route.route('/api/admin/events/upload-qr', methods=['POST'])
@token_required
def upload_event_qr(current_admin):
    """Upload QR code for events"""
    try:
        print("📤 UPLOAD: Received event QR upload request")
        
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
            
        # Try Cloudinary upload
        cloudinary_url = upload_image(file, folder="hindi_samiti/event_qrs")
        
        if cloudinary_url:
            return jsonify({
                'success': True,
                'image_url': cloudinary_url,
                'filename': file.filename
            }), 200
            
        return jsonify({'message': 'Upload failed'}), 500
            
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/events', methods=['POST'])
@token_required
def create_event(current_admin):
    try:
        data = request.get_json()
        
        print(f"📝 Creating event with data: {data}")
        
        # IMPORTANT: Make sure cover_image_url is saved
        cover_image_url = data.get('cover_image_url', '')
        print(f"🖼️ Cover image URL: {cover_image_url}")
        
        # Create event
        event = Event(
            name=data['name'],
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            description=data.get('description', ''),
            is_active=data.get('is_active', True),
            cover_image_url=cover_image_url,
            qr_code_url=data.get('qr_code_url', '')  # Add QR code URL
        )
        
        db.session.add(event)
        db.session.flush()  # Get the event ID
        
        print(f"✅ Event created with ID: {event.id}, cover_image_url: {event.cover_image_url}")
        
        # Create form fields
        for field_data in data.get('formFields', []):
            form_field = EventFormField(
                event_id=event.id,
                label=field_data['label'],
                field_type=field_data['field_type'],
                is_required=field_data.get('is_required', True),
                order=field_data.get('order', 0)
            )
            db.session.add(form_field)
        
        db.session.commit()
        
        print(f"✅ Event and form fields committed to database")
        
        return jsonify({
            'message': 'Event created successfully', 
            'id': event.id,
            'cover_image_url': event.cover_image_url
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating event: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500


@route.route('/api/admin/events/<int:event_id>', methods=['PUT'])
@token_required
def update_event(current_admin, event_id):
    try:
        event = Event.query.get_or_404(event_id)
        data = request.get_json()
        
        print(f"📝 Updating event {event_id} with data: {data}")
        
        # Update event details
        event.name = data['name']
        event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        event.description = data.get('description', '')
        event.is_active = data.get('is_active', True)
        
        # IMPORTANT: Update cover_image_url if provided
        if 'cover_image_url' in data:
            event.cover_image_url = data['cover_image_url']
        if 'qr_code_url' in data:
            event.qr_code_url = data['qr_code_url']
            print(f"🖼️ Updated cover_image_url: {event.cover_image_url}")
        
        # Delete existing form fields
        EventFormField.query.filter_by(event_id=event_id).delete()
        
        # Create new form fields
        for field_data in data.get('formFields', []):
            form_field = EventFormField(
                event_id=event.id,
                label=field_data['label'],
                field_type=field_data['field_type'],
                is_required=field_data.get('is_required', True),
                order=field_data.get('order', 0)
            )
            db.session.add(form_field)
        
        db.session.commit()
        
        print(f"✅ Event updated successfully")
        
        return jsonify({
            'message': 'Event updated successfully',
            'cover_image_url': event.cover_image_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating event: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/events/<int:event_id>', methods=['DELETE'])
@token_required
def delete_event(current_admin, event_id):
    try:
        event = Event.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({'message': 'Event deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500



# Event Cover Image Upload Route
@route.route('/api/admin/events/upload-cover-image', methods=['POST'])
@token_required
def upload_event_cover(current_admin):
    try:
        print("📤 EVENT UPLOAD: Received event cover image upload request")
        
        if 'image' not in request.files:
            print("❌ EVENT UPLOAD: No image file in request")
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        print(f"📎 EVENT UPLOAD: File received: {file.filename}")
        
        if file.filename == '':
            print("❌ EVENT UPLOAD: Empty filename")
            return jsonify({'message': 'No file selected'}), 400
            
        # Try Cloudinary upload (primary)
        # Using "hindi_samiti/events" folder
        cloudinary_url = upload_image(file, folder="hindi_samiti/events")
        
        if cloudinary_url:
            print(f"✅ EVENT UPLOAD: Uploaded to Cloudinary: {cloudinary_url}")
            return jsonify({
                'success': True,
                'image_url': cloudinary_url
            }), 200
            
        # Fallback to local storage
        print("📁 EVENT UPLOAD: Cloudinary failed or not configured, using local storage")
        
        # Create events upload directory
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        event_covers_folder = os.path.join(upload_folder, 'event_covers')
        os.makedirs(event_covers_folder, exist_ok=True)
        
        # Reset file pointer
        file.seek(0)
        
        # Generate unique filename
        # Basic extension handling if missing
        if '.' in file.filename:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
        else:
            file_extension = 'jpg' # Default to jpg if no extension
            
        filename = str(uuid.uuid4()) + '.' + file_extension
        filepath = os.path.join(event_covers_folder, filename)
        
        print(f"💾 EVENT UPLOAD: Saving to local: {filepath}")
        file.save(filepath)
        
        # Return the local image URL
        image_url = f'/uploads/event_covers/{filename}'
        print(f"🔗 EVENT UPLOAD: Returning URL: {image_url}")
        
        return jsonify({
            'success': True,
            'image_url': image_url
        }), 200
        
    except Exception as e:
        print(f"❌ EVENT UPLOAD ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500


# Admin Registrations Routes

@route.route('/api/admin/registrations/<int:event_id>', methods=['GET'])
@token_required
def get_registrations(current_admin, event_id):
    try:
        registrations = Registration.query.filter_by(event_id=event_id).order_by(Registration.timestamp.desc()).all()
        registrations_data = []
        for reg in registrations:
            responses = {}
            for response in reg.responses:
                if response.field and hasattr(response.field, 'label'):
                    responses[response.field.label] = response.value
                else:
                    print(f"Warning: Invalid response for registration {reg.id}")
            registrations_data.append({
                'id': reg.id,
                'email': reg.email or '',
                'screenshot_url': reg.screenshot_url or '',
                'status': reg.status or 'pending',
                'timestamp': reg.timestamp.isoformat() if reg.timestamp else None,
                'responses': responses
            })
        return jsonify(registrations_data), 200
    except Exception as e:
        print(f"Error in get_registrations: {str(e)}")
        return jsonify({'message': str(e)}), 500
    
@route.route('/api/admin/registrations/<int:registration_id>/status', methods=['PUT'])
@token_required
def update_registration_status(current_admin, registration_id):
    try:
        registration = Registration.query.get_or_404(registration_id)
        data = request.get_json()
        
        status = data.get('status')
        if status not in ['pending', 'verified', 'rejected']:
            return jsonify({'message': 'Invalid status'}), 400
        
        registration.status = status
        db.session.commit()
        
        return jsonify({'message': 'Registration status updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# Admin Team Routes

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Add this new route for team member image upload
@route.route('/api/admin/team/upload-image', methods=['POST'])
@token_required
def upload_team_member_image(current_admin):
    try:
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        # Try Cloudinary upload
        cloudinary_url = upload_image(file, folder="hindi_samiti/team")
        
        if cloudinary_url:
            return jsonify({
                'success': True,
                'image_url': cloudinary_url,
                'filename': file.filename
            }), 200
            
        # Fallback to local (though Cloudinary should work)
        if file and allowed_file(file.filename):
            # Create team members upload directory
            team_upload_folder = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'team_members')
            os.makedirs(team_upload_folder, exist_ok=True)
            
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            filepath = os.path.join(team_upload_folder, filename)
            file.save(filepath)
            
            # Return the image URL
            image_url = f'/uploads/team_members/{filename}'
            
            return jsonify({
                'success': True,
                'image_url': image_url,
                'filename': filename
            }), 200
        else:
            return jsonify({'message': 'Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP files are allowed'}), 400
            
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/team', methods=['GET'])
@token_required
def get_team_members(current_admin):
    try:
        team_members = TeamMember.query.all()
        team_data = []
        
        for member in team_members:
            team_data.append({
                'id': member.id,
                'name': member.name,
                'role': member.role,
                'image_url': member.image_url,
                'description': member.description
            })
        
        return jsonify(team_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/team', methods=['POST'])
@token_required
def create_team_member(current_admin):
    try:
        data = request.get_json()
        
        team_member = TeamMember(
            name=data['name'],
            role=data['role'],
            image_url=data.get('image_url', ''),
            description=data.get('description', '')
        )
        
        db.session.add(team_member)
        db.session.commit()
        
        return jsonify({
            'message': 'Team member added successfully',
            'id': team_member.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/team/<int:member_id>', methods=['PUT'])
@token_required
def update_team_member(current_admin, member_id):
    try:
        member = TeamMember.query.get_or_404(member_id)
        data = request.get_json()
        
        member.name = data['name']
        member.role = data['role']
        member.image_url = data.get('image_url', '')
        member.description = data.get('description', '')
        
        db.session.commit()
        return jsonify({'message': 'Team member updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/team/<int:member_id>', methods=['DELETE'])
@token_required
def delete_team_member(current_admin, member_id):
    try:
        member = TeamMember.query.get_or_404(member_id)
        
        # Delete associated image file if it exists
        if member.image_url and member.image_url.startswith('/uploads/team_members/'):
            filename = os.path.basename(member.image_url)
            team_upload_folder = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), 'team_members')
            filepath = os.path.join(team_upload_folder, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        db.session.delete(member)
        db.session.commit()
        
        return jsonify({'message': 'Team member removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500



@route.route('/uploads/team_members/<filename>')
def serve_team_member_image(filename):
    """Serve team member images with proper headers and error handling"""
    try:
        import os
        from flask import current_app, send_file, abort
        import mimetypes
        
        # Get the upload folder path
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        team_members_folder = os.path.join(upload_folder, 'team_members')
        
        # Security check - prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            print(f"Security: Blocked access to {filename}")
            abort(404)
        
        # Construct full file path
        file_path = os.path.join(team_members_folder, filename)
        
        
        print(f"🔍 Attempting to serve team member image:")



        print(f"   Filename: {filename}")
        print(f"   Full path: {file_path}")
        print(f"   File exists: {os.path.exists(file_path)}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            # List available files for debugging
            if os.path.exists(team_members_folder):
                available_files = os.listdir(team_members_folder)
                print(f"📁 Available files: {available_files}")
            else:
                print(f"📁 Directory doesn't exist: {team_members_folder}")
            abort(404)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        print(f"📦 File size: {file_size} bytes")
        
        # Determine MIME type
        mimetype, _ = mimetypes.guess_type(file_path)
        if not mimetype:
            # Default to image/jpeg for unknown types
            mimetype = 'image/jpeg'
        
        print(f"🎯 MIME type: {mimetype}")
        
        # Create response
        response = send_file(
            file_path, 
            mimetype=mimetype,
            as_attachment=False,  # Display inline, not download
            conditional=True  # Enable HTTP caching
        )
        
        # Add CORS headers to allow cross-origin requests
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        # Add caching headers
        response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        
        print(f"✅ Successfully serving: {filename}")
        return response
        
    except Exception as e:
        print(f"❌ Error serving team member image {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        abort(500)        

# ==================== BLOG ROUTES ====================

@route.route('/api/blogs', methods=['GET'])
def get_public_blogs():
    """Public endpoint to get all blogs"""
    try:
        blogs = Blog.query.order_by(Blog.created_at.desc()).all()
        blogs_data = []
        
        for blog in blogs:
            blogs_data.append({
                'id': blog.id,
                'title': blog.title,
                'content': blog.content,
                'author': blog.author,
                'cover_image_url': blog.cover_image_url,
                'created_at': blog.created_at.isoformat() + 'Z'
            })
        
        return jsonify(blogs_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/blogs/<int:blog_id>', methods=['GET'])
def get_public_blog_details(blog_id):
    """Public endpoint to get a single blog"""
    try:
        blog = Blog.query.get_or_404(blog_id)
        
        return jsonify({
            'id': blog.id,
            'title': blog.title,
            'content': blog.content,
            'author': blog.author,
            'cover_image_url': blog.cover_image_url,
            'created_at': blog.created_at.isoformat() + 'Z'
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/blogs', methods=['POST'])
@token_required
def create_blog(current_admin):
    """Admin endpoint to create a blog"""
    try:
        data = request.get_json()
        
        blog = Blog(
            title=data['title'],
            content=data['content'],
            author=data.get('author', current_admin.username),
            cover_image_url=data.get('cover_image_url', '')
        )
        
        db.session.add(blog)
        db.session.commit()
        
        return jsonify({
            'message': 'Blog created successfully',
            'id': blog.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/blogs/<int:blog_id>', methods=['PUT'])
@token_required
def update_blog(current_admin, blog_id):
    """Admin endpoint to update a blog"""
    try:
        blog = Blog.query.get_or_404(blog_id)
        data = request.get_json()
        if 'title' in data:
            blog.title = data['title']
        if 'content' in data:
            blog.content = data['content']
        if 'author' in data:
            blog.author = data['author']
        if 'cover_image_url' in data:
            blog.cover_image_url = data['cover_image_url']
            
        db.session.commit()
        return jsonify({'message': 'Blog updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@route.route('/api/admin/blogs/<int:blog_id>', methods=['DELETE'])
@token_required
def delete_blog(current_admin, blog_id):
    """Admin endpoint to delete a blog"""
    try:
        blog = Blog.query.get_or_404(blog_id)
        db.session.delete(blog)
        db.session.commit()
        return jsonify({'message': 'Blog deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==================== UTILITY ROUTES ====================

# Serve uploaded files (for development - use nginx/apache in production)

@route.route('/uploads/event_covers/<filename>')
def serve_event_cover_image(filename):
    """Serve event cover images with proper headers and error handling"""
    try:
        # Get the upload folder path
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        event_covers_folder = os.path.join(upload_folder, 'event_covers')
        
        # Security check - prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            print(f"Security: Blocked access to {filename}")
            abort(404)
        
        # Construct full file path
        file_path = os.path.join(event_covers_folder, filename)
        
        print(f"🔍 Attempting to serve event cover image:")
        print(f"   Filename: {filename}")
        print(f"   Full path: {file_path}")
        print(f"   File exists: {os.path.exists(file_path)}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            # List available files for debugging
            if os.path.exists(event_covers_folder):
                available_files = os.listdir(event_covers_folder)
                print(f"📁 Available files: {available_files}")
            else:
                print(f"📁 Directory doesn't exist: {event_covers_folder}")
            abort(404)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        print(f"📦 File size: {file_size} bytes")
        
        # Determine MIME type
        mimetype, _ = mimetypes.guess_type(file_path)
        if not mimetype:
            mimetype = 'image/jpeg'
        
        print(f"🎯 MIME type: {mimetype}")
        
        # Create response
        response = send_file(
            file_path, 
            mimetype=mimetype,
            as_attachment=False,
            conditional=True
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        # Add caching headers
        response.headers['Cache-Control'] = 'public, max-age=3600'
        
        print(f"✅ Successfully serving: {filename}")
        return response
        
    except Exception as e:
        print(f"❌ Error serving event cover image {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        abort(500)


# Verify your upload route is correct
@route.route('/api/admin/events/upload-cover-image', methods=['POST'])
@token_required
def upload_event_cover_image(current_admin):
    """Upload cover image for events - FIXED VERSION"""
    try:
        print("📤 UPLOAD: Received event cover image upload request")
        
        if 'image' not in request.files:
            print("❌ UPLOAD: No image file in request")
            return jsonify({'success': False, 'message': 'No image file provided'}), 400
        
        file = request.files['image']
        print(f"📎 UPLOAD: File received: {file.filename}")
        
        if file.filename == '':
            print("❌ UPLOAD: Empty filename")
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            print(f"❌ UPLOAD: Invalid file type: {file.filename}")
            return jsonify({
                'success': False, 
                'message': 'Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP files are allowed'
            }), 400
        
        # Create event covers upload directory
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        event_covers_folder = os.path.join(upload_folder, 'event_covers')
        os.makedirs(event_covers_folder, exist_ok=True)
        
        # TRY CLOUDINARY UPLOAD FIRST
        cloudinary_url = upload_image(file, folder="hindi_samiti/events")
        if cloudinary_url:
            print(f"✅ UPLOAD: Uploaded to Cloudinary: {cloudinary_url}")
            return jsonify({
                'success': True,
                'image_url': cloudinary_url,
                'filename': file.filename
            }), 200

        print(f"📁 UPLOAD: Upload folder: {event_covers_folder}")
        
        # Generate unique filename
        file.seek(0) # Reset file pointer if read by cloudinary
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = str(uuid.uuid4()) + '.' + file_extension
        filepath = os.path.join(event_covers_folder, filename)
        
        print(f"💾 UPLOAD: Saving to: {filepath}")
        
        # Save the file
        file.save(filepath)
        
        # Verify file was saved
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            print(f"✅ UPLOAD: File saved successfully ({file_size} bytes)")
        else:
            print(f"❌ UPLOAD: File not found after save!")
            return jsonify({'success': False, 'message': 'Failed to save file'}), 500
        
        # Return the image URL - THIS IS CRITICAL
        image_url = f'/uploads/event_covers/{filename}'
        print(f"🔗 UPLOAD: Returning URL: {image_url}")
        
        return jsonify({
            'success': True,
            'image_url': image_url,
            'filename': filename
        }), 200
            
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@route.route('/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    return send_file(os.path.join(upload_folder, filename))

@route.route('/uploads/blog_covers/<filename>')
def serve_blog_cover_image(filename):
    """Serve blog cover images with proper headers and error handling"""
    try:
        # Get the upload folder path
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        blog_covers_folder = os.path.join(upload_folder, 'blog_covers')
        
        # Security check - prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            print(f"Security: Blocked access to {filename}")
            abort(404)
        
        # Construct full file path
        file_path = os.path.join(blog_covers_folder, filename)
        
        print(f"🔍 Attempting to serve blog cover image:")
        print(f"   Filename: {filename}")
        print(f"   Full path: {file_path}")
        print(f"   File exists: {os.path.exists(file_path)}")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            if os.path.exists(blog_covers_folder):
                available_files = os.listdir(blog_covers_folder)
                print(f"📁 Available files: {available_files}")
            else:
                print(f"📁 Directory doesn't exist: {blog_covers_folder}")
            abort(404)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        print(f"📦 File size: {file_size} bytes")
        
        # Determine MIME type
        mimetype, _ = mimetypes.guess_type(file_path)
        if not mimetype:
            mimetype = 'image/jpeg'
        
        print(f"🎯 MIME type: {mimetype}")
        
        # Create response
        response = send_file(
            file_path, 
            mimetype=mimetype,
            as_attachment=False,
            conditional=True
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        # Add caching headers
        response.headers['Cache-Control'] = 'public, max-age=3600'
        
        print(f"✅ Successfully serving: {filename}")
        return response
        
    except Exception as e:
        print(f"❌ Error serving blog cover image {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        abort(500)


@route.route('/api/events/<int:event_id>/check-registration', methods=['GET'])
def check_registration_status(event_id):
    """
    Check if an email is already registered for an event and return registration status
    """
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({'error': 'Email parameter is required'}), 400
        
        # Check if the event exists
        event = db.session.query(Event).filter_by(id=event_id).first()
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Check if email is already registered for this event
        registration = db.session.query(Registration).filter_by(
            event_id=event_id,
            email=email.lower().strip()
        ).first()
        
        if registration:
            return jsonify({
                'exists': True,
                'status': registration.status,
                'registration_id': registration.id,
                'timestamp': registration.timestamp.isoformat()
            }), 200
        else:
            return jsonify({
                'exists': False
            }), 200
            
    except Exception as e:
        print(f"Error checking registration status: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@route.route('/api/events/<int:event_id>/register', methods=['POST'])
def register_for_event(event_id):
    """
    Register a user for an event
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        email = data.get('email', '').lower().strip()
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if the event exists and is active
        event = db.session.query(Event).filter_by(id=event_id).first()
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if not event.is_active:
            return jsonify({'error': 'Registration is closed for this event'}), 400
        
        # Check if email is already registered
        existing_registration = db.session.query(Registration).filter_by(
            event_id=event_id,
            email=email
        ).first()
        
        if existing_registration:
            return jsonify({
                'error': 'Email already registered',
                'status': existing_registration.status
            }), 400
        
        # Create new registration
        registration = Registration(
            event_id=event_id,
            email=email,
            status='pending'
        )
        
        db.session.add(registration)
        db.session.flush()  # To get the registration ID
        
        # Handle form field responses
        form_responses = data.get('responses', [])
        for response_data in form_responses:
            field_id = response_data.get('field_id')
            value = response_data.get('value')
            
            if field_id and value:
                field_response = RegistrationFieldResponse(
                    registration_id=registration.id,
                    field_id=field_id,
                    value=value
                )
                db.session.add(field_response)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'registration_id': registration.id,
            'status': registration.status,
            'message': 'Registration submitted successfully. Please wait for verification.'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error registering for event: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

import re

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads/screenshots'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_email(email):
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(pattern, email) is not None

@route.route('/api/registrations/check/<int:event_id>', methods=['GET'])
def check_existing_registration(event_id):
    """
    Check if an email is already registered for a specific event
    """
    try:
        email = request.args.get('email')
        
        if not email:
            return jsonify({'error': 'Email parameter is required'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Normalize email
        email = email.lower().strip()
        
        # Check if the event exists
        event = db.session.query(Event).filter_by(id=event_id).first()
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Check for existing registration
        registration = db.session.query(Registration).filter_by(
            event_id=event_id,
            email=email
        ).first()
        
        if registration:
            return jsonify({
                'exists': True,
                'status': registration.status,
                'registration_id': registration.id,
                'timestamp': registration.timestamp.isoformat(),
                'event_name': event.name
            }), 200
        else:
            return jsonify({
                'exists': False,
                'event_name': event.name
            }), 200
            
    except Exception as e:
        print(f"Error checking registration: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@route.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Handle file upload for payment screenshots
    """
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File size exceeds 5MB limit'}), 400
        
        if file and allowed_file(file.filename):
            # Create upload directory if it doesn't exist
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            # Generate unique filename
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            filename = secure_filename(unique_filename)
            
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Return the file URL (adjust based on your static file serving setup)
            file_url = f"/uploads/screenshots/{filename}"
            
            return jsonify({
                'success': True,
                'url': file_url,
                'filename': filename
            }), 200
        else:
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, and GIF files are allowed'}), 400
            
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return jsonify({'error': 'File upload failed'}), 500


@route.route('/api/registrations', methods=['POST'])
def create_registration():
    """
    Create a new registration for an event
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # Extract and validate required fields
        event_id = data.get('event_id')
        email = data.get('email', '').lower().strip()
        screenshot_url = data.get('screenshot_url')
        responses = data.get('responses', [])
        
        # Validation
        if not event_id:
            return jsonify({'error': 'Event ID is required'}), 400
        
        if not email or not validate_email(email):
            return jsonify({'error': 'Valid email is required'}), 400
        
        if not screenshot_url:
            return jsonify({'error': 'Payment screenshot is required'}), 400
        
        # Check if event exists and is active
        event = db.session.query(Event).filter_by(id=event_id).first()
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if not event.is_active:
            return jsonify({'error': 'Registration is closed for this event'}), 400
        
        # Check if email is already registered
        existing_registration = db.session.query(Registration).filter_by(
            event_id=event_id,
            email=email
        ).first()
        
        if existing_registration:
            return jsonify({
                'error': 'Email already registered for this event',
                'existing_status': existing_registration.status
            }), 400
        
        # Validate form field responses
        required_fields = db.session.query(EventFormField).filter_by(
            event_id=event_id,
            is_required=True
        ).all()
        
        response_field_ids = {r.get('field_id') for r in responses if r.get('field_id')}
        required_field_ids = {field.id for field in required_fields}
        
        missing_fields = required_field_ids - response_field_ids
        if missing_fields:
            missing_field_labels = [
                field.label for field in required_fields 
                if field.id in missing_fields
            ]
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_field_labels)}'
            }), 400
        
        # Create the registration
        registration = Registration(
            event_id=event_id,
            email=email,
            screenshot_url=screenshot_url,
            status='pending',
            timestamp=datetime.utcnow()
        )
        
        db.session.add(registration)
        db.session.flush()  # Get the registration ID
        
        # Add form field responses
        for response_data in responses:
            field_id = response_data.get('field_id')
            value = response_data.get('value', '').strip()
            
            if field_id and value:
                # Verify the field exists and belongs to this event
                field = db.session.query(EventFormField).filter_by(
                    id=field_id,
                    event_id=event_id
                ).first()
                
                if field:
                    field_response = RegistrationFieldResponse(
                        registration_id=registration.id,
                        field_id=field_id,
                        value=value
                    )
                    db.session.add(field_response)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'registration_id': registration.id,
            'status': registration.status,
            'message': 'Registration submitted successfully. Please wait for verification.',
            'event_name': event.name,
            'timestamp': registration.timestamp.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating registration: {str(e)}")
        return jsonify({'error': 'Failed to create registration'}), 500


@route.route('/api/registrations/<int:registration_id>', methods=['GET'])
def get_registration_details(registration_id):
    """
    Get details of a specific registration (optional - for admin use)
    """
    try:
        registration = db.session.query(Registration).filter_by(id=registration_id).first()
        
        if not registration:
            return jsonify({'error': 'Registration not found'}), 404
        
        # Get form field responses
        responses = db.session.query(RegistrationFieldResponse)\
            .join(EventFormField)\
            .filter(RegistrationFieldResponse.registration_id == registration_id)\
            .all()
        
        response_data = []
        for response in responses:
            response_data.append({
                'field_label': response.field.label,
                'field_type': response.field.field_type,
                'value': response.value
            })
        
        registration_data = {
            'id': registration.id,
            'event_id': registration.event_id,
            'event_name': registration.event.name,
            'email': registration.email,
            'status': registration.status,
            'screenshot_url': registration.screenshot_url,
            'timestamp': registration.timestamp.isoformat(),
            'responses': response_data
        }
        
        return jsonify(registration_data), 200
        
    except Exception as e:
        print(f"Error fetching registration details: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    
# Fixed Backend Route
@route.route('/api/admin/registrations/<int:registration_id>/screenshot', methods=['GET'])
@token_required
def view_screenshot(current_admin, registration_id):
    try:
        # Query the registration by ID
        registration = Registration.query.filter_by(id=registration_id).first()
        if not registration:
            return jsonify({'message': 'Registration not found'}), 404
            
        if not registration.screenshot_url:
            return jsonify({'message': 'No screenshot available for this registration'}), 404
            
        # FIXED: Better file path construction
        # Get the uploads directory (should be consistent with where files are saved)
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'screenshots')
        
        # Handle different URL formats that might be stored in database
        if registration.screenshot_url.startswith('/uploads/'):
            # URL format: /uploads/screenshots/filename.jpg
            filename = os.path.basename(registration.screenshot_url)
        elif registration.screenshot_url.startswith('uploads/'):
            # Path format: uploads/screenshots/filename.jpg
            filename = os.path.basename(registration.screenshot_url)
        else:
            # Just filename: filename.jpg
            filename = registration.screenshot_url
            
        file_path = os.path.join(uploads_dir, filename)
        
        print(f"Registration ID: {registration_id}")  # Debug
        print(f"Screenshot URL in DB: {registration.screenshot_url}")  # Debug
        print(f"Constructed file path: {file_path}")  # Debug
        print(f"File exists: {os.path.exists(file_path)}")  # Debug
        
        if not os.path.exists(file_path):
            # FIXED: Also check if file exists with different extensions
            possible_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            base_filename = os.path.splitext(filename)[0]
            
            found_file = None
            for ext in possible_extensions:
                test_path = os.path.join(uploads_dir, base_filename + ext)
                if os.path.exists(test_path):
                    found_file = test_path
                    break
                    
            if not found_file:
                print(f"File not found at: {file_path}")  # Debug
                print(f"Directory contents: {os.listdir(uploads_dir) if os.path.exists(uploads_dir) else 'Directory does not exist'}")  # Debug
                return jsonify({'message': 'Screenshot file not found on server'}), 404
            
            file_path = found_file
            
        # Determine MIME type dynamically
        mimetype, _ = mimetypes.guess_type(file_path)
        if not mimetype:
            mimetype = 'image/png'  # Fallback
            
        # FIXED: Add proper headers for browser display
        response = send_file(
            file_path,
            mimetype=mimetype,
            as_attachment=False
        )
        
        # Add headers to ensure proper display in browser
        response.headers['Content-Disposition'] = 'inline'
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        return response
        
    except Exception as e:
        print(f"Error in view_screenshot: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        return jsonify({'message': f'Failed to retrieve screenshot: {str(e)}'}), 500



@route.route('/admin/registrations/<int:event_id>/download', methods=['GET'])
@token_required
def download_registrations_excel(event_id):
    """
    Download all registrations for an event as Excel file
    """
    try:
        # Check if event exists
        event = Event.query.get_or_404(event_id)
        
        # Get all registrations for the event
        registrations = Registration.query.filter_by(event_id=event_id).all()
        
        if not registrations:
            return jsonify({'error': 'No registrations found for this event'}), 404
        
        # Get all form fields for the event
        form_fields = EventFormField.query.filter_by(event_id=event_id).order_by(EventFormField.order).all()
        
        # Prepare data for Excel
        excel_data = []
        
        for registration in registrations:
            row_data = {
                'ID': registration.id,
                'Email': registration.email,
                'Status': registration.status,
                'Registration Date': registration.timestamp.strftime('%Y-%m-%d %H:%M:%S') if registration.timestamp else '',
                'Screenshot URL': registration.screenshot_url or ''
            }
            
            # Add form field responses
            response_dict = {resp.field_id: resp.value for resp in registration.responses if resp.field}
            
            for field in form_fields:
                row_data[field.label] = response_dict.get(field.id, '')
            
            excel_data.append(row_data)
        
        # Create DataFrame
        df = pd.DataFrame(excel_data)
        
        # Create Excel file in memory
        output = BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Write main data
            df.to_excel(writer, sheet_name='Registrations', index=False)
            
            # Get the workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Registrations']
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                
                adjusted_width = min(max_length + 2, 50)  # Cap at 50 characters
                worksheet.column_dimensions[column_letter].width = adjusted_width
            
            # Add summary sheet
            summary_data = {
                'Metric': [
                    'Event Name',
                    'Total Registrations',
                    'Pending Registrations',
                    'Verified Registrations',
                    'Rejected Registrations',
                    'Export Date'
                ],
                'Value': [
                    event.name,
                    len(registrations),
                    len([r for r in registrations if r.status == 'pending']),
                    len([r for r in registrations if r.status == 'verified']),
                    len([r for r in registrations if r.status == 'rejected']),
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                ]
            }
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Auto-adjust summary sheet columns
            summary_worksheet = writer.sheets['Summary']
            for column in summary_worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                
                adjusted_width = max_length + 2
                summary_worksheet.column_dimensions[column_letter].width = adjusted_width
        
        output.seek(0)
        
        # Generate filename
        safe_event_name = "".join(c for c in event.name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{safe_event_name}_registrations_{timestamp}.xlsx"
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        print(f"Error downloading registrations: {str(e)}")
        return jsonify({'error': 'Failed to generate Excel file'}), 500

@route.route('/api/admin/registrations/<int:event_id>/download', methods=['GET'])
@token_required
def download_registrations_csv(current_admin, event_id):
    # Fetch the event
    event = Event.query.get(event_id)
    if not event:
        abort(404, description="Event not found")
    
    # Fetch form fields for the event, ordered by 'order'
    form_fields = EventFormField.query.filter_by(event_id=event_id).order_by(EventFormField.order).all()
    
    # Fetch registrations for the specified event
    registrations = Registration.query.filter_by(event_id=event_id).all()
    
    # Create CSV headers: base fields + dynamic form fields
    base_headers = ['Email', 'Timestamp', 'Status', 'Screenshot URL']
    dynamic_headers = [field.label for field in form_fields]
    headers = base_headers + dynamic_headers
    
    # Create a CSV file in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow(headers)
    
    # Write registration data
    for registration in registrations:
        # Fetch responses for this registration
        responses = RegistrationFieldResponse.query.filter_by(registration_id=registration.id).all()
        # Create a dictionary for quick lookup of response values by field_id
        response_dict = {response.field_id: response.value for response in responses}
        
        # Prepare base fields
        row = [
            registration.email,
            registration.timestamp.strftime('%Y-%m-%d %H:%M:%S') if registration.timestamp else 'N/A',
            registration.status,
            registration.screenshot_url if registration.screenshot_url else 'N/A'
        ]
        
        # Append dynamic field responses in the order of form_fields
        for field in form_fields:
            row.append(response_dict.get(field.id, 'N/A'))
        
        writer.writerow(row)
    
    # Convert string data to bytes
    output_bytes = io.BytesIO(output.getvalue().encode('utf-8'))
    output_bytes.seek(0)
    
    # Generate filename with event ID and current date
    filename = f'registrations_event_{event_id}_{datetime.now().strftime("%Y%m%d")}.csv'
    
    return send_file(
        output_bytes,
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename
    )