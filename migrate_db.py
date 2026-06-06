import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'backend', 'vendorbridge.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

queries = [
    "ALTER TABLE quotations ADD COLUMN manager_status VARCHAR(50) NOT NULL DEFAULT 'Awaiting';",
    "ALTER TABLE quotations ADD COLUMN financer_status VARCHAR(50) NOT NULL DEFAULT 'Awaiting';",
    "ALTER TABLE quotations ADD COLUMN manager_remarks VARCHAR(500);",
    "ALTER TABLE quotations ADD COLUMN financer_remarks VARCHAR(500);",
    "ALTER TABLE quotations ADD COLUMN manager_id CHAR(32);",
    "ALTER TABLE quotations ADD COLUMN financer_id CHAR(32);",
    "ALTER TABLE quotations ADD COLUMN manager_approved_at DATETIME;",
    "ALTER TABLE quotations ADD COLUMN financer_approved_at DATETIME;"
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
