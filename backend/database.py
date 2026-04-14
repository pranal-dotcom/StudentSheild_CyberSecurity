from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use pymongo to connect to MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017/")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "student_shield_db")

try:
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    # Trigger a server check
    client.server_info()
    print("Successfully connected to MongoDB!")
except Exception as e:
    print("Warning: Could not connect to MongoDB. Is it running?", e)

db = client[MONGODB_DB_NAME]

users_collection = db["users"]
scan_history_collection = db["scan_history"]
cyber_scores_collection = db["cyber_scores"]
