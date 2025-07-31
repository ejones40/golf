from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
import hmac
import hashlib
from datetime import datetime
from urllib.parse import urlparse, quote

app = Flask(__name__)
CORS(app)

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
    timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
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

@app.route('/api/courses/<int:course_id>/holes')
def get_course_holes(course_id):
    """Get all holes for a specific course"""
    data = make_api_request(f"/courses/{course_id}/holes")
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch course holes"}), 500

@app.route('/api/holes/<int:hole_id>/polygons')
def get_hole_polygons(hole_id):
    """Get polygon data for a specific hole"""
    data = make_api_request(f"/holes/{hole_id}/polygons")
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch hole polygons"}), 500

@app.route('/api/test')
def test_api():
    """Test endpoint to verify API connectivity"""
    # Test with the example course ID from your sample
    data = make_api_request("/courses/4803/holes")
    if data:
        return jsonify({"status": "success", "sample_data": data})
    else:
        return jsonify({"status": "error", "message": "API connection failed"}), 500

@app.route('/api/config')
def get_config():
    """Get API configuration status"""
    return jsonify({
        "api_key_set": bool(API_KEY),
        "access_key_set": bool(ACCESS_KEY),
        "secret_key_set": bool(SECRET_KEY)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)