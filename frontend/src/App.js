import React, { useState, useEffect } from 'react';
import HoleVisualizer from './components/HoleVisualizer';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';

// Predefined courses (can be expanded as more courses are discovered)
const AVAILABLE_COURSES = [
  { id: '4803', name: 'Course 4803 (18 holes)' },
  { id: 'custom', name: 'Enter Custom Course ID...' }
];

function App() {
  const [courseId, setCourseId] = useState('4803'); // Default to example course
  const [customCourseId, setCustomCourseId] = useState('');
  const [holes, setHoles] = useState([]);
  const [selectedHole, setSelectedHole] = useState(null);
  const [polygons, setPolygons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load holes when course ID changes
  useEffect(() => {
    if (courseId) {
      loadHoles();
    }
  }, [courseId]);

  const loadHoles = async (targetCourseId = null) => {
    const actualCourseId = targetCourseId || (courseId === 'custom' ? customCourseId : courseId);
    
    if (!actualCourseId) {
      setError('Please enter a course ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${actualCourseId}/holes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const holes = data.resources || [];
      
      if (holes.length === 0) {
        setError(`No holes found for course ${actualCourseId}`);
      }
      
      setHoles(holes);
      setSelectedHole(null);
      setPolygons([]);
    } catch (err) {
      setError(`Failed to load holes: ${err.message}`);
      setHoles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPolygons = async (holeId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/holes/${holeId}/polygons`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPolygons(data.resources || []);
    } catch (err) {
      setError(`Failed to load polygons: ${err.message}`);
      setPolygons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHoleSelect = (hole) => {
    setSelectedHole(hole);
    loadPolygons(hole.id);
  };

  return (
    <div className="App">
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1>Golf Hole Visualizer</h1>
          <p>Select a course and hole to view the polygon rendering</p>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="courseSelect" style={{ marginRight: '10px' }}>Course:</label>
            <select
              id="courseSelect"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={{ padding: '5px', minWidth: '200px' }}
            >
              {AVAILABLE_COURSES.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          {courseId === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="customCourseId">Course ID:</label>
              <input
                id="customCourseId"
                type="text"
                value={customCourseId}
                onChange={(e) => setCustomCourseId(e.target.value)}
                placeholder="Enter course ID (e.g., 4803)"
                style={{ padding: '5px', minWidth: '150px' }}
              />
            </div>
          )}
          
          <button 
            onClick={() => loadHoles()} 
            disabled={loading || (courseId === 'custom' && !customCourseId)}
            style={{ padding: '8px 16px' }}
          >
            Load Holes
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            Loading...
          </div>
        )}

        {holes.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Available Holes:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {holes.map((hole) => (
                <button
                  key={hole.id}
                  onClick={() => handleHoleSelect(hole)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: selectedHole?.id === hole.id ? '#007bff' : '#f8f9fa',
                    color: selectedHole?.id === hole.id ? 'white' : 'black',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Hole {hole.number}
                </button>
              ))}
            </div>
          </div>
        )}

        <HoleVisualizer hole={selectedHole} polygons={polygons} />
      </div>
    </div>
  );
}

export default App;
