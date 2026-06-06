import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'vendorbridge.db')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

queries = [
    "ALTER TABLE users ADD COLUMN phone VARCHAR(50);",
    "ALTER TABLE users ADD COLUMN last_login DATETIME;",
    "ALTER TABLE users ADD COLUMN gst_details VARCHAR(50);"
]

for q in queries:
    try:
        cursor.execute(q)
        print(f"Executed: {q}")
    except sqlite3.OperationalError as e:
        print(f"Skipped: {q} (Reason: {e})")

conn.commit()
conn.close()
print("Migration completed.")
