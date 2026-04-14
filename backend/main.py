from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the database module to ensure the MongoDB connection runs when the app starts
import database
# Import the auth module to use our registration API
import auth


app = FastAPI()

# --- ENABLE CORS (Cross-Origin Resource Sharing) ---
# This is required so our React frontend (running on port 5173) 
# can successfully make API requests to our backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In a real app, you would restrict this to exactly "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication routes in our main app
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "StudentShield Backend Running"}

