from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import hmac
import hashlib
from datetime import datetime, timezone
from urllib.parse import urlparse, quote

app = FastAPI(title="Golf API", description="API for golf course data", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# GolfBert API configuration
API_BASE_URL = "https://api.golfbert.com/v1"
API_KEY = os.getenv('GOLF_BERT_API_TOKEN')
ACCESS_KEY = os.getenv('GOLF_BERT_ACCESS_KEY')
SECRET_KEY = os.getenv('GOLF_BERT_SECRET_KEY')

def create_aws_signature(method, url, headers=None, payload=''):
    """Create AWS signature for API requests"""
    if headers is None:
        headers = {}
    
    parsed_url = urlparse(url)
    host = parsed_url.netloc
    path = parsed_url.path
    query = parsed_url.query or ''
    
    # Create timestamp
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    date = timestamp[:8]
    
    # Create canonical headers (must be sorted)
    canonical_headers = f"host:{host}\nx-amz-date:{timestamp}\nx-api-key:{API_KEY}\n"
    signed_headers = "host;x-amz-date;x-api-key"
    
    # Create canonical request
    canonical_request = f"{method}\n{path}\n{query}\n{canonical_headers}\n{signed_headers}\n{hashlib.sha256(payload.encode()).hexdigest()}"
    
    # Create string to sign
    credential_scope = f"{date}/us-east-1/execute-api/aws4_request"
    string_to_sign = f"AWS4-HMAC-SHA256\n{timestamp}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode()).hexdigest()}"
    
    # Calculate signature
    def sign(key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()
    
    k_date = sign(('AWS4' + SECRET_KEY).encode('utf-8'), date)
    k_region = sign(k_date, 'us-east-1')
    k_service = sign(k_region, 'execute-api')
    k_signing = sign(k_service, 'aws4_request')
    signature = hmac.new(k_signing, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    # Create authorization header
    authorization = f"AWS4-HMAC-SHA256 Credential={ACCESS_KEY}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
    
    return {
        'Authorization': authorization,
        'X-Amz-Date': timestamp,
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }

def make_api_request(endpoint):
    """Make authenticated request to GolfBert API"""
    url = f"{API_BASE_URL}{endpoint}"
    headers = create_aws_signature('GET', url)
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Request to {url} returned status: {response.status_code}")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Response content: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return None

@app.get("/api/courses/{course_id}/holes")
async def get_course_holes(course_id: int):
    """Get all holes for a specific course"""
    data = make_api_request(f"/courses/{course_id}/holes")
    if data:
        return data
    else:
        raise HTTPException(status_code=500, detail="Failed to fetch course holes")

@app.get("/api/holes/{hole_id}/polygons")
async def get_hole_polygons(hole_id: int):
    """Get polygon data for a specific hole"""
    data = make_api_request(f"/holes/{hole_id}/polygons")
    if data:
        return data
    else:
        raise HTTPException(status_code=500, detail="Failed to fetch hole polygons")

@app.get("/api/test")
async def test_api():
    """Test endpoint to verify API connectivity"""
    # Test with the example course ID from your sample
    data = make_api_request("/courses/4803/holes")
    if data:
        return {"status": "success", "sample_data": data}
    else:
        raise HTTPException(status_code=500, detail="API connection failed")

@app.get("/api/config")
async def get_config():
    """Get API configuration status"""
    return {
        "api_key_set": bool(API_KEY),
        "access_key_set": bool(ACCESS_KEY),
        "secret_key_set": bool(SECRET_KEY)
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000, reload=True)