from pymongo import MongoClient

# Use pymongo to connect to MongoDB
try:
    client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=5000)
    # Trigger a server check
    client.server_info()
    print("Successfully connected to MongoDB!")
except Exception as e:
    print("Warning: Could not connect to MongoDB. Is it running?", e)

db = client["student_shield_db"]

users_collection = db["users"]
scan_history_collection = db["scan_history"]
cyber_scores_collection = db["cyber_scores"]
