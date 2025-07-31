# Golf API Backend

A FastAPI-based backend service for golf course data management, providing access to GolfBert API data.

## Features

- **FastAPI Framework**: Modern, fast web framework with automatic API documentation
- **AWS Signature Authentication**: Secure authentication for GolfBert API
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Automatic Documentation**: Interactive API docs at `/docs` and `/redoc`
- **Comprehensive Testing**: Full test suite with pytest

## API Endpoints

- `GET /api/config` - Get API configuration status
- `GET /api/test` - Test endpoint to verify API connectivity
- `GET /api/courses/{course_id}/holes` - Get all holes for a specific course
- `GET /api/holes/{hole_id}/polygons` - Get polygon data for a specific hole

## Quick Start

### Installation

```bash
pip install -r requirements.txt
```

### Environment Variables

Set the following environment variables:

```bash
export GOLF_BERT_API_TOKEN="your-api-token"
export GOLF_BERT_ACCESS_KEY="your-access-key"
export GOLF_BERT_SECRET_KEY="your-secret-key"
```

### Running the Server

#### Option 1: Using the startup script
```bash
python start.py
```

#### Option 2: Using uvicorn directly
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Option 3: Using the app directly
```bash
python app.py
```

The server will start on `http://localhost:8000`

### API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Testing

Run the test suite:

```bash
pytest tests/ -v
```

Run tests with coverage:

```bash
pytest tests/ --cov=app --cov-report=html
```

## Migration from Flask

This backend has been refactored from Flask to FastAPI while maintaining full API compatibility:

### Key Changes

1. **Framework**: Migrated from Flask to FastAPI
2. **CORS**: Replaced Flask-CORS with FastAPI's built-in CORS middleware
3. **Response Handling**: Removed `jsonify()` calls (FastAPI handles JSON serialization automatically)
4. **Error Handling**: Replaced Flask's error responses with FastAPI's `HTTPException`
5. **Testing**: Updated tests to use FastAPI's `TestClient` instead of Flask's test client
6. **Server**: Replaced Flask's development server with Uvicorn

### Benefits of FastAPI

- **Performance**: Significantly faster than Flask
- **Type Safety**: Built-in request/response validation with Pydantic
- **Automatic Documentation**: Interactive API docs generated automatically
- **Modern Python**: Full support for async/await and Python type hints
- **Standards-Based**: Built on OpenAPI and JSON Schema standards

### Backward Compatibility

All existing API endpoints remain unchanged:
- Same URL patterns
- Same request/response formats
- Same error handling behavior
- Same CORS configuration

## Development

### Project Structure

```
backend/
├── app.py              # Main FastAPI application
├── start.py            # Startup script
├── requirements.txt    # Python dependencies
├── pytest.ini         # Pytest configuration
├── tests/             # Test suite
│   ├── __init__.py
│   ├── conftest.py    # Test fixtures
│   └── test_app.py    # Application tests
└── README.md          # This file
```

### Adding New Endpoints

1. Add the endpoint function to `app.py`
2. Use FastAPI decorators (`@app.get`, `@app.post`, etc.)
3. Add type hints for parameters and return values
4. Add comprehensive tests in `tests/test_app.py`

Example:

```python
@app.get("/api/courses/{course_id}")
async def get_course(course_id: int):
    """Get course information by ID"""
    # Implementation here
    return {"course_id": course_id}
```