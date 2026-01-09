import sqlite3
import os

# Path to the database
DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'database.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        return

    print(f"✅ Found database at {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(events)")
    columns = [info[1] for info in cursor.fetchall()]
    print(f"Current columns in events table: {columns}")
    
    new_columns = [
        ("coordinator1_name", "VARCHAR(100)"),
        ("coordinator1_phone", "VARCHAR(20)"),
        ("coordinator2_name", "VARCHAR(100)"),
        ("coordinator2_phone", "VARCHAR(20)")
    ]
    
    for col_name, col_type in new_columns:
        if col_name not in columns:
            try:
                print(f"➕ Adding column {col_name}...")
                cursor.execute(f"ALTER TABLE events ADD COLUMN {col_name} {col_type}")
                print(f"✅ Added {col_name}")
            except Exception as e:
                print(f"❌ Failed to add {col_name}: {e}")
        else:
            print(f"ℹ️ Column {col_name} already exists")
            
    conn.commit()
    conn.close()
    print("✨ Migration complete!")

if __name__ == "__main__":
    migrate()
