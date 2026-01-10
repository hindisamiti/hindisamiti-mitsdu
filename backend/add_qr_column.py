
import os
from sqlalchemy import create_engine, text

# Point to the correct database file location
database_url = "sqlite:///backend/instance/database.db"
print(f"Connecting to database: {database_url}")

engine = create_engine(database_url)

try:
    with engine.connect() as connection:
        # Check if column exists first to avoid error if run multiple times
        # SQLite doesn't support IF NOT EXISTS in ADD COLUMN well in all versions, 
        # but standard SQL often does. However, to be safe, we'll just try to add it.
        # If it fails, catch the error.
        
        # NOTE: 'events' table name might be case-sensitive depending on DB, but usually lowercase in SQLAlchemy defaults.
        
        print("Attempting to add qr_code_url column to events table...")
        
        # SQLite syntax for adding a column
        add_column_sql = text("ALTER TABLE events ADD COLUMN qr_code_url VARCHAR(255)")
        
        connection.execute(add_column_sql)
        connection.commit()
        
        print("✅ Successfully added qr_code_url column.")

except Exception as e:
    print(f"❌ Error adding column: {e}")
    # If error is about duplicate column, that's fine.
    if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
         print("⚠️ Column already exists, skipping.")
    else:
         print("Critical error during migration.")
