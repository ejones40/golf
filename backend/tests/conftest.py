import pytest
import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from app import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def mock_env_vars():
    """Mock environment variables for testing."""
    with patch.dict(os.environ, {
        'GOLF_BERT_API_TOKEN': 'test-token',
        'GOLF_BERT_ACCESS_KEY': 'test-access-key',
        'GOLF_BERT_SECRET_KEY': 'test-secret-key'
    }):
        yield

@pytest.fixture
def sample_holes_response():
    """Sample holes API response."""
    return {
        "resources": [
            {
                "id": 25506,
                "number": 18,
                "courseid": 4803,
                "rotation": 2.04479566062,
                "range": {
                    "x": {"min": -122.2707111, "max": -122.269083337},
                    "y": {"min": 47.3838734109, "max": 47.3896241104}
                },
                "dimensions": {"width": 960, "height": 960},
                "vectors": [
                    {"type": "Flag", "lat": 47.3893912619, "long": -122.2692596912384},
                    {"type": "Blue", "lat": 47.3838734109, "long": -122.269259691}
                ],
                "flagcoords": {"lat": 47.38135479698122, "long": -122.26435018374639}
            }
        ]
    }

@pytest.fixture
def sample_polygons_response():
    """Sample polygons API response."""
    return {
        "resources": [
            {
                "holeid": 25506,
                "surfacetype": "Green",
                "polygon": [
                    {"lat": 47.3814806732001, "long": -122.26437270641327},
                    {"lat": 47.38148793784317, "long": -122.2643968462944},
                    {"lat": 47.38148975400378, "long": -122.26441696286201}
                ]
            }
        ]
    }