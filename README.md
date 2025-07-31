# Golf Hole Visualizer

A full-stack web application for visualizing golf hole polygons using the GolfBert API. This application allows users to select golf courses, view available holes, and visualize the polygon rendering of each hole with different surface types.

## Features

- **Course Selection**: Choose from predefined courses or enter a custom course ID
- **Hole Visualization**: Interactive SVG rendering of golf holes with:
  - Different surface types (Green, Fairway, Rough, Sand, Water, Woods, Tee)
  - Color-coded polygons for easy identification
  - Tee markers and flag positions
  - Interactive legend
- **Responsive Design**: Clean, modern interface that works on different screen sizes
- **Error Handling**: Comprehensive error handling for API failures and invalid inputs
- **Loading States**: Visual feedback during data loading

## Architecture

### Backend (Flask)
- **Framework**: Flask with Flask-CORS for cross-origin requests
- **Authentication**: AWS Signature Version 4 for GolfBert API authentication
- **Endpoints**:
  - `GET /api/courses/{courseId}/holes` - Retrieve holes for a course
  - `GET /api/holes/{holeId}/polygons` - Retrieve polygon data for a hole
  - `GET /api/test` - Test API connectivity
  - `GET /api/config` - Check API configuration status

### Frontend (React)
- **Framework**: React with Create React App
- **Components**:
  - `App.js` - Main application component with course selection and hole management
  - `HoleVisualizer.js` - SVG-based hole visualization component
- **Features**:
  - Dropdown course selection with custom course input
  - Dynamic hole loading and selection
  - Real-time polygon visualization
  - Comprehensive error handling

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Environment Variables
Create a `.env` file in the backend directory with:
```
GOLF_BERT_API_TOKEN=your_api_token
GOLF_BERT_ACCESS_KEY=your_access_key
GOLF_BERT_SECRET_KEY=your_secret_key
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The backend will run on `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3001`

## Testing

### Backend Tests
```bash
cd backend
python -m pytest --cov=app --cov-report=term-missing
```
- **Coverage**: 99% (19 tests)
- **Test Types**: Unit tests, integration tests, error handling, AWS signature validation

### Frontend Tests
```bash
cd frontend
npm test -- --coverage --watchAll=false
```
- **Coverage**: 91.2% overall, 100% on main components (31 tests)
- **Test Types**: Component rendering, user interactions, API integration, error states

## API Integration

The application integrates with the GolfBert API using AWS Signature Version 4 authentication:

### Example API Calls

1. **Get Holes for Course**:
```bash
GET https://api.golfbert.com/v1/courses/4803/holes
```

2. **Get Polygon Data for Hole**:
```bash
GET https://api.golfbert.com/v1/holes/25506/polygons
```

### Response Format

**Holes Response**:
```json
{
  "resources": [
    {
      "id": 25506,
      "number": 18,
      "courseid": 4803,
      "rotation": 2.04479566062,
      "range": {
        "x": { "min": -122.2707111, "max": -122.269083337 },
        "y": { "min": 47.3838734109, "max": 47.3896241104 }
      },
      "vectors": [
        { "type": "Flag", "lat": 47.3893912619, "long": -122.2692596912384 },
        { "type": "Blue", "lat": 47.3838734109, "long": -122.269259691 }
      ]
    }
  ]
}
```

**Polygons Response**:
```json
{
  "resources": [
    {
      "holeid": 25506,
      "surfacetype": "Green",
      "polygon": [
        { "lat": 47.3814806732001, "long": -122.26437270641327 },
        { "lat": 47.38148793784317, "long": -122.2643968462944 }
      ]
    }
  ]
}
```

## Usage

1. **Start the Application**:
   - Run both backend and frontend servers
   - Navigate to `http://localhost:3001`

2. **Select a Course**:
   - Choose from the dropdown (default: Course 4803)
   - Or select "Enter Custom Course ID..." to input a different course

3. **Load Holes**:
   - Click "Load Holes" to fetch available holes for the selected course
   - Holes will appear as clickable buttons

4. **Visualize Holes**:
   - Click on any hole button to load and visualize the hole
   - View the SVG rendering with color-coded surface types
   - Use the legend to understand surface type colors

## Surface Type Colors

- **Green**: #4CAF50 (Green)
- **Fairway**: #8BC34A (Light Green)
- **Rough**: #689F38 (Dark Green)
- **Sand**: #FFC107 (Yellow)
- **Water**: #2196F3 (Blue)
- **Woods**: #3E2723 (Brown)
- **Tee**: #FF9800 (Orange)
- **Unknown**: #9E9E9E (Gray)

## Vector Type Colors

- **Flag**: #FF0000 (Red, size 6)
- **Blue Tee**: #0000FF (Blue, size 5)
- **White Tee**: #FFFFFF (White, size 5)
- **Red Tee**: #FF0000 (Red, size 5)
- **Unknown**: #000000 (Black, size 4)

## Development

### Project Structure
```
golf/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── pytest.ini         # Test configuration
│   └── tests/
│       ├── conftest.py     # Test fixtures
│       └── test_app.py     # Test cases
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── components/
│   │   │   └── HoleVisualizer.js  # Visualization component
│   │   └── __tests__/      # Test files
│   ├── package.json        # Node dependencies
│   └── public/
└── README.md
```

### Adding New Courses
To add new courses to the dropdown:
1. Update the `AVAILABLE_COURSES` array in `frontend/src/App.js`
2. Add course objects with `id` and `name` properties

### Extending Surface Types
To add new surface types:
1. Update the `getColor()` function in `HoleVisualizer.js`
2. Add corresponding test cases

## Troubleshooting

### Common Issues

1. **API Authentication Errors**:
   - Verify environment variables are set correctly
   - Check API token validity
   - Ensure AWS signature is properly generated

2. **CORS Errors**:
   - Backend includes Flask-CORS configuration
   - Ensure backend is running on port 8000

3. **No Holes Found**:
   - Verify course ID exists in GolfBert API
   - Check API response format
   - Try the default course (4803) first

4. **Visualization Issues**:
   - Ensure polygon data contains valid lat/long coordinates
   - Check browser console for JavaScript errors
   - Verify SVG rendering in browser developer tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass with good coverage
5. Submit a pull request

## License

This project is for educational and demonstration purposes.

## Test Coverage Summary

- **Backend**: 99% coverage (19 tests passing)
- **Frontend**: 91.2% coverage (31 tests passing)
- **Total**: 50 comprehensive tests covering all functionality