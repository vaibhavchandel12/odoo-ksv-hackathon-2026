import sqlite3
import os

db_path = '/home/dk-parmar/Desktop/odoo-ksv-hackathon-2026/backend/vendorbridge.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("UPDATE users SET email = REPLACE(email, '@vendorbridge.local', '@vendorbridge.com')")
print(f"Rows updated: {c.rowcount}")
conn.commit()
conn.close()
