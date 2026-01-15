from app import app, db
from models import Blog, Event
from routes import generate_unique_slug
from sqlalchemy import text

def migrate_slugs():
    with app.app_context():
        print("🔧 MIGRATION: Checking for slug columns...")
        
        # 1. Add columns using raw SQL
        commands = [
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE",
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE"
        ]
        
        for cmd in commands:
            try:
                db.session.execute(text(cmd))
            except Exception as e:
                print(f"⚠️ SQL execution note: {e}")
        
        db.session.commit()
        print("✅ Columns checked/added")

        # 2. Backfill Event Slugs
        print("🔄 Backfilling Events...")
        events = Event.query.all() # Fetch all to check if slug matches default
        count = 0
        for event in events:
            if not event.slug:
                event.slug = generate_unique_slug(Event, event.name)
                print(f"   Updated: {event.name} -> {event.slug}")
                count += 1
        
        # 3. Backfill Blog Slugs
        print("🔄 Backfilling Blogs...")
        blogs = Blog.query.all()
        for blog in blogs:
            if not blog.slug:
                blog.slug = generate_unique_slug(Blog, blog.title)
                print(f"   Updated: {blog.title} -> {blog.slug}")
                count += 1
                
        if count > 0:
            db.session.commit()
            print(f"✅ Backfill complete. Updated {count} records.")
        else:
            print("✅ No records needed backfilling.")

if __name__ == "__main__":
    migrate_slugs()
