from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt
from database import users_collection, scan_history_collection, cyber_scores_collection
import jwt
import datetime

SECRET_KEY = "my_super_secret_studentshield_key"
ALGORITHM = "HS256"

router = APIRouter()
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- AUTHENTICATION ---

class UserRegistration(BaseModel):
    name: str
    email: str
    password: str

@router.post("/register")
def register_user_direct(user: UserRegistration):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)

    user_document = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password.decode('utf-8')
    }
    users_collection.insert_one(user_document)
    return {"message": "User registered successfully!"}

@router.post("/auth/register")
def register_user(user: UserRegistration):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)

    user_document = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password.decode('utf-8')
    }
    users_collection.insert_one(user_document)
    return {"message": "User registered successfully!"}


class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login_user_direct(user: UserLogin):
    existing_user = users_collection.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    stored_password_hash = existing_user["password"].encode('utf-8')
    if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    payload = {
        "email": existing_user["email"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/auth/login")
def login_user(user: UserLogin):
    existing_user = users_collection.find_one({"email": user.email})
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    stored_password_hash = existing_user["password"].encode('utf-8')
    if not bcrypt.checkpw(user.password.encode('utf-8'), stored_password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    payload = {
        "email": existing_user["email"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/dashboard")
def get_dashboard(user_payload: dict = Depends(verify_token)):
    return {"message": f"Welcome to StudentShield Dashboard, {user_payload.get('email')}!"}

@router.get("/history")
def get_scan_history(user_payload: dict = Depends(verify_token)):
    email = user_payload.get("email")
    cursor = scan_history_collection.find({"user_id": email}, {"_id": 0}).sort("_id", -1)
    history = list(cursor)
    return {"history": history}


# --- SCANNING TOOLS ---

def log_scan_history(email: str, scan_type: str, input_data: str, result: dict):
    scan_history_collection.insert_one({
        "user_id": email,
        "type": scan_type,
        "input": input_data,
        "result": result,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

class PasswordCheckRequest(BaseModel):
    password: str

# Direct routes for frontend compatibility
@router.post("/check-password")
def check_password_strength_direct(req: PasswordCheckRequest, user_payload: dict = Depends(verify_token)):
    return check_password_strength(req, user_payload)

@router.post("/scan/password")
def check_password_strength(req: PasswordCheckRequest, user_payload: dict = Depends(verify_token)):
    password = req.password
    suggestions = []
    
    if len(password) < 8: suggestions.append("increase length")
    if not any(char.isupper() for char in password): suggestions.append("add uppercase")
    if not any(char.islower() for char in password): suggestions.append("add lowercase")
    if not any(char.isdigit() for char in password): suggestions.append("add numbers")
    if not any(not char.isalnum() for char in password): suggestions.append("add special characters")
        
    strength = "Strong" if len(suggestions) == 0 else "Medium" if len(suggestions) <= 2 else "Weak"
    result = {"strength": strength, "suggestions": suggestions}
    
    # Mask password before storing! Secure practice.
    masked = password[0] + "***" + password[-1] if len(password) >= 2 else "***"
    log_scan_history(user_payload.get("email"), "password", masked, result)
    return result


class URLCheckRequest(BaseModel):
    url: str

# Direct routes for frontend compatibility
@router.post("/check-url")
def check_url_safety_direct(req: URLCheckRequest, user_payload: dict = Depends(verify_token)):
    return check_url_safety(req, user_payload)

@router.post("/scan/url")
def check_url_safety(req: URLCheckRequest, user_payload: dict = Depends(verify_token)):
    url = req.url.lower()
    reasons = []
    
    if url.startswith("http://"): reasons.append("Unsecured connection (HTTP instead of HTTPS)")
    suspicious_words = ["login", "verify", "bank", "update", "secure", "account"]
    if any(w in url for w in suspicious_words): reasons.append("Contains suspicious words")
    if len(url) > 75: reasons.append("URL is unusually long")
    if url.count(".") > 3: reasons.append("Possible subdomain masking (too many dots)")
    if url.count("-") > 3: reasons.append("Contains too many hyphens")
    if any(t in url for t in [".xyz", ".tk", ".club", ".top", ".online", ".site"]): reasons.append("Suspicious domain ending")
            
    is_safe = len(reasons) == 0
    risk_level = "Low" if len(reasons) == 0 else "Medium" if len(reasons) <= 2 else "High"
        
    result = {"is_safe": is_safe, "risk_level": risk_level, "reasons": reasons}
    log_scan_history(user_payload.get("email"), "url", req.url, result)
    return result


class EmailCheckRequest(BaseModel):
    email_text: str

# Direct routes for frontend compatibility
@router.post("/check-email")
def check_email_safety_direct(req: EmailCheckRequest, user_payload: dict = Depends(verify_token)):
    return check_email_safety(req, user_payload)

@router.post("/scan/email")
def check_email_safety(req: EmailCheckRequest, user_payload: dict = Depends(verify_token)):
    text_lower = req.email_text.lower()
    reasons = []
    
    if any(w in text_lower for w in ["urgent", "immediately", "action required", "act now", "suspended", "warning"]): 
        reasons.append("Urgent/pressure language")
    if any(w in text_lower for w in ["bank", "account", "transfer", "otp", "password", "ssn", "payment"]): 
        reasons.append("Asks for sensitive info")
    if any(w in text_lower for w in ["click here", "verify now", "win", "prize", "gift card", "claim"]): 
        reasons.append("Common scam phrase or trap")
    
    capital_count = sum(1 for c in req.email_text if c.isupper())
    if len(req.email_text) > 15 and (capital_count / len(req.email_text)) > 0.2:
        reasons.append("Too many CAPITAL letters")
        
    is_scam = len(reasons) >= 3
    risk_level = "Low" if len(reasons) == 0 else "Medium" if len(reasons) <= 2 else "High"
        
    result = {"is_scam": is_scam, "risk_level": risk_level, "reasons": reasons}
    log_scan_history(user_payload.get("email"), "email", req.email_text[:50]+"...", result)
    return result


class SafetyScoreRequest(BaseModel):
    password: str
    url: str
    email_text: str

# Direct routes for frontend compatibility
@router.post("/safety-score")
def get_safety_score_direct(req: SafetyScoreRequest, user_payload: dict = Depends(verify_token)):
    return get_safety_score(req, user_payload)

@router.post("/scan/safety-score")
def get_safety_score(req: SafetyScoreRequest, user_payload: dict = Depends(verify_token)):
    email = user_payload.get("email")

    pass_result = check_password_strength(PasswordCheckRequest(password=req.password), user_payload)
    url_result = check_url_safety(URLCheckRequest(url=req.url), user_payload)
    email_result = check_email_safety(EmailCheckRequest(email_text=req.email_text), user_payload)

    score = 0
    all_suggestions = []

    if pass_result["strength"] == "Strong": score += 30
    elif pass_result["strength"] == "Medium": score += 20
    else: score += 10
    for s in pass_result["suggestions"]: all_suggestions.append(f"Password: {s}")

    if url_result["risk_level"] == "Low": score += 30
    elif url_result["risk_level"] == "Medium": score += 20
    else: score += 10
    for s in url_result["reasons"]: all_suggestions.append(f"URL: {s}")

    if email_result["risk_level"] == "Low": score += 40
    elif email_result["risk_level"] == "Medium": score += 25
    else: score += 10
    for s in email_result["reasons"]: all_suggestions.append(f"Email: {s}")

    if score >= 80: status = "Safe"
    elif score >= 50: status = "Moderate Risk"
    else: status = "High Risk"
    
    result = {"safety_score": score, "status": status, "suggestions": all_suggestions}
    
    cyber_scores_collection.insert_one({
        "user_id": email,
        "score": score,
        "status": status,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

    return result
