import pytest
import json
from unittest.mock import patch, Mock
import requests
from app import app, create_aws_signature, make_api_request

class TestApp:
    """Test cases for the Flask application."""

    def test_config_endpoint(self, client, mock_env_vars):
        """Test the /api/config endpoint."""
        response = client.get('/api/config')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'api_key_set' in data
        assert 'access_key_set' in data
        assert 'secret_key_set' in data
        assert data['api_key_set'] is True
        assert data['access_key_set'] is True
        assert data['secret_key_set'] is True

    def test_config_endpoint_missing_env(self, client):
        """Test /api/config endpoint with missing environment variables."""
        with patch('app.API_KEY', None), \
             patch('app.ACCESS_KEY', None), \
             patch('app.SECRET_KEY', None):
            response = client.get('/api/config')
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['api_key_set'] is False
            assert data['access_key_set'] is False
            assert data['secret_key_set'] is False

    @patch('app.make_api_request')
    def test_get_holes_success(self, mock_request, client, mock_env_vars, sample_holes_response):
        """Test successful holes retrieval."""
        mock_request.return_value = sample_holes_response
        
        response = client.get('/api/courses/4803/holes')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'resources' in data
        assert len(data['resources']) == 1
        assert data['resources'][0]['id'] == 25506

    @patch('app.make_api_request')
    def test_get_holes_api_error(self, mock_request, client, mock_env_vars):
        """Test holes retrieval with API error."""
        mock_request.return_value = None
        
        response = client.get('/api/courses/4803/holes')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data

    @patch('app.make_api_request')
    def test_get_polygons_success(self, mock_request, client, mock_env_vars, sample_polygons_response):
        """Test successful polygons retrieval."""
        mock_request.return_value = sample_polygons_response
        
        response = client.get('/api/holes/25506/polygons')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'resources' in data
        assert len(data['resources']) == 1
        assert data['resources'][0]['surfacetype'] == 'Green'

    @patch('app.make_api_request')
    def test_get_polygons_api_error(self, mock_request, client, mock_env_vars):
        """Test polygons retrieval with API error."""
        mock_request.return_value = None
        
        response = client.get('/api/holes/25506/polygons')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data

    def test_cors_headers(self, client):
        """Test CORS headers are present."""
        response = client.get('/api/config')
        assert 'Access-Control-Allow-Origin' in response.headers

    def test_invalid_endpoint(self, client):
        """Test invalid endpoint returns 404."""
        response = client.get('/api/invalid')
        assert response.status_code == 404

    @patch('app.make_api_request')
    def test_test_endpoint_success(self, mock_request, client, mock_env_vars, sample_holes_response):
        """Test the /api/test endpoint with successful response."""
        mock_request.return_value = sample_holes_response
        
        response = client.get('/api/test')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert 'sample_data' in data

    @patch('app.make_api_request')
    def test_test_endpoint_error(self, mock_request, client, mock_env_vars):
        """Test the /api/test endpoint with API error."""
        mock_request.return_value = None
        
        response = client.get('/api/test')
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['status'] == 'error'


class TestAWSSignature:
    """Test cases for AWS signature creation."""

    def test_create_aws_signature(self, mock_env_vars):
        """Test AWS signature creation."""
        method = 'GET'
        url = 'https://api.golfbert.com/v1/courses/4803/holes'
        
        signature = create_aws_signature(method, url)
        
        assert 'Authorization' in signature
        assert signature['Authorization'].startswith('AWS4-HMAC-SHA256')
        assert 'X-Amz-Date' in signature
        assert 'x-api-key' in signature

    def test_create_aws_signature_with_headers(self, mock_env_vars):
        """Test AWS signature creation with custom headers."""
        method = 'POST'
        url = 'https://api.golfbert.com/v1/test'
        headers = {'Content-Type': 'application/json'}
        payload = '{"test": "data"}'
        
        signature = create_aws_signature(method, url, headers, payload)
        
        assert 'Authorization' in signature
        assert 'X-Amz-Date' in signature
        assert 'x-api-key' in signature


class TestAPIRequest:
    """Test cases for API requests."""

    @patch('requests.get')
    def test_make_api_request_success(self, mock_get, mock_env_vars):
        """Test successful API request."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'test': 'data'}
        mock_get.return_value = mock_response
        
        result = make_api_request('/test')
        
        assert result == {'test': 'data'}
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_make_api_request_http_error(self, mock_get, mock_env_vars):
        """Test API request with HTTP error."""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = 'Not Found'
        mock_get.return_value = mock_response
        
        result = make_api_request('/test')
        
        assert result is None
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_make_api_request_exception(self, mock_get, mock_env_vars):
        """Test API request with exception."""
        mock_get.side_effect = requests.exceptions.RequestException("Connection error")
        
        result = make_api_request('/test')
        
        assert result is None
        mock_get.assert_called_once()


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_empty_course_id(self, client, mock_env_vars):
        """Test empty course ID."""
        response = client.get('/api/courses//holes')
        assert response.status_code == 404

    def test_empty_hole_id(self, client, mock_env_vars):
        """Test empty hole ID."""
        response = client.get('/api/holes//polygons')
        assert response.status_code == 404

    @patch('app.make_api_request')
    def test_valid_api_response(self, mock_request, client, mock_env_vars):
        """Test handling of valid API response."""
        mock_request.return_value = {"test": "data"}
        
        response = client.get('/api/courses/4803/holes')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data == {"test": "data"}

    def test_options_request(self, client):
        """Test OPTIONS request for CORS preflight."""
        response = client.options('/api/config')
        assert response.status_code == 200
        assert 'Access-Control-Allow-Origin' in response.headers