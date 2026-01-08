# Save as check_db_fixed.py in your main project directory
# Then run: python backend/check_db_fixed.py

import sqlite3
import os

def check_and_fix_database():
    print("🔍 CHECKING DATABASE ENTRIES (FIXED VERSION)")
    print("=" * 60)
    
    # Get the correct paths
    current_dir = os.getcwd()
    print(f"📍 Current directory: {current_dir}")
    
    # Database path (adjust based on where you're running from)
    if os.path.exists('backend/instance/database.db'):
        db_path = 'backend/instance/database.db'
        backend_dir = 'backend'
    elif os.path.exists('instance/database.db'):
        db_path = 'instance/database.db'
        backend_dir = '.'
    else:
        print("❌ Database not found!")
        return
    
    print(f"📊 Using database: {db_path}")
    print(f"📁 Backend directory: {backend_dir}")
    
    # Team members directory
    team_dir = os.path.join(backend_dir, 'uploads', 'team_members')
    print(f"📁 Team directory: {team_dir}")
    print(f"📁 Team directory exists: {os.path.exists(team_dir)}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all team members
        cursor.execute("SELECT id, name, role, image_url FROM team_members")
        members = cursor.fetchall()
        
        print(f"\n👥 Team members in database: {len(members)}")
        print("-" * 60)
        
        # List actual files in directory
        if os.path.exists(team_dir):
            actual_files = os.listdir(team_dir)
            print(f"📦 Actual files in directory: {actual_files}")
        else:
            actual_files = []
            print("📦 No files directory found")
        
        print("-" * 60)
        
        for member_id, name, role, image_url in members:
            print(f"ID: {member_id}")
            print(f"Name: {name}")
            print(f"Role: {role}")
            print(f"Image URL in DB: {image_url}")
            
            if image_url:
                # Extract filename from URL
                db_filename = os.path.basename(image_url)
                print(f"Filename from DB: {db_filename}")
                
                # Check if this exact file exists
                file_path = os.path.join(team_dir, db_filename)
                file_exists = os.path.exists(file_path)
                print(f"Full file path: {file_path}")
                print(f"File exists: {file_exists}")
                
                if file_exists:
                    file_size = os.path.getsize(file_path)
                    print(f"✅ File found! Size: {file_size} bytes")
                    
                    # Test the URL construction
                    test_url = f"http://localhost:5000{image_url}"
                    print(f"🔗 Test URL: {test_url}")
                    print("   ^ Try this URL in your browser")
                else:
                    print("❌ File not found at expected location")
                    # Look for similar files
                    similar_files = [f for f in actual_files if db_filename[:10] in f or name.lower() in f.lower()]
                    if similar_files:
                        print(f"🔍 Similar files found: {similar_files}")
            else:
                print("⚠️  No image URL set")
            
            print("-" * 30)
        
        conn.close()
        print("✅ Database check complete!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    check_and_fix_database()