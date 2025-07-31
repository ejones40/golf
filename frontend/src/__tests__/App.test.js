import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock fetch globally
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders main heading', () => {
    render(<App />);
    expect(screen.getByText('Golf Hole Visualizer')).toBeInTheDocument();
  });

  test('renders course selection dropdown', () => {
    render(<App />);
    expect(screen.getByLabelText('Course:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Course 4803 (18 holes)')).toBeInTheDocument();
  });

  test('renders load holes button', () => {
    render(<App />);
    expect(screen.getByText('Load Holes')).toBeInTheDocument();
  });

  test('shows custom course input when "Enter Custom Course ID..." is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const dropdown = screen.getByLabelText('Course:');
    await user.selectOptions(dropdown, 'custom');
    
    expect(screen.getByLabelText('Course ID:')).toBeInTheDocument();
  });

  test('hides custom course input when predefined course is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const dropdown = screen.getByLabelText('Course:');
    await user.selectOptions(dropdown, 'custom');
    expect(screen.getByLabelText('Course ID:')).toBeInTheDocument();
    
    await user.selectOptions(dropdown, '4803');
    expect(screen.queryByLabelText('Course ID:')).not.toBeInTheDocument();
  });

  test('loads holes successfully for predefined course', async () => {
    const mockHoles = {
      resources: [
        {
          id: 25506,
          number: 18,
          courseid: 4803
        },
        {
          id: 25505,
          number: 17,
          courseid: 4803
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockHoles
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Available Holes:')).toBeInTheDocument();
      expect(screen.getByText('Hole 18')).toBeInTheDocument();
      expect(screen.getByText('Hole 17')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/courses/4803/holes');
  });

  test('loads holes successfully for custom course', async () => {
    const mockHoles = {
      resources: [
        {
          id: 12345,
          number: 1,
          courseid: 1000
        }
      ]
    };

    // Mock the initial load (will fail) and then the custom course load
    fetch
      .mockRejectedValueOnce(new Error('Initial load'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoles
      });

    const user = userEvent.setup();
    render(<App />);
    
    // Wait for initial error to clear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load holes/)).toBeInTheDocument();
    });
    
    const dropdown = screen.getByLabelText('Course:');
    await user.selectOptions(dropdown, 'custom');
    
    const courseInput = screen.getByLabelText('Course ID:');
    await user.clear(courseInput);
    await user.type(courseInput, '1000');
    
    const loadButton = screen.getByText('Load Holes');
    await user.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText('Available Holes:')).toBeInTheDocument();
      expect(screen.getByText('Hole 1')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/courses/1000/holes');
  });

  test('shows error message when no holes found', async () => {
    const mockEmptyResponse = { resources: [] };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmptyResponse
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No holes found for course 4803')).toBeInTheDocument();
    });
  });

  test('shows error message when API call fails', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load holes: API Error')).toBeInTheDocument();
    });
  });

  test('shows error message for empty custom course ID', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const dropdown = screen.getByLabelText('Course:');
    await user.selectOptions(dropdown, 'custom');
    
    const courseInput = screen.getByLabelText('Course ID:');
    await user.clear(courseInput);
    
    const loadButton = screen.getByText('Load Holes');
    await user.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a course ID')).toBeInTheDocument();
    });
  });

  test('selects hole and loads polygon data', async () => {
    const mockHoles = {
      resources: [
        {
          id: 25506,
          number: 18,
          courseid: 4803,
          vectors: [
            { type: 'Flag', lat: 47.3893912619, long: -122.2692596912384 }
          ]
        }
      ]
    };

    const mockPolygons = {
      resources: [
        {
          holeid: 25506,
          surfacetype: 'Green',
          polygon: [
            { lat: 47.3814806732001, long: -122.26437270641327 },
            { lat: 47.38148793784317, long: -122.2643968462944 }
          ]
        }
      ]
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoles
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolygons
      });

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hole 18')).toBeInTheDocument();
    });

    const holeButton = screen.getByText('Hole 18');
    await user.click(holeButton);

    await waitFor(() => {
      expect(screen.getByText('Hole 18 - Course 4803')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/holes/25506/polygons');
  });

  test('shows error when polygon loading fails', async () => {
    const mockHoles = {
      resources: [
        {
          id: 25506,
          number: 18,
          courseid: 4803
        }
      ]
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoles
      })
      .mockRejectedValueOnce(new Error('Polygon API Error'));

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hole 18')).toBeInTheDocument();
    });

    const holeButton = screen.getByText('Hole 18');
    await user.click(holeButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to load polygons: Polygon API Error')).toBeInTheDocument();
    });
  });

  test('shows loading state when loading holes', async () => {
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows loading state when loading hole data', async () => {
    const mockHoles = {
      resources: [
        {
          id: 25506,
          number: 18,
          courseid: 4803
        }
      ]
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoles
      })
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hole 18')).toBeInTheDocument();
    });

    const holeButton = screen.getByText('Hole 18');
    await user.click(holeButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('handles HTTP error when loading holes', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load holes: HTTP error! status: 404')).toBeInTheDocument();
    });
  });

  test('handles HTTP error when loading polygons', async () => {
    const mockHoles = {
      resources: [
        {
          id: 25506,
          number: 18,
          courseid: 4803
        }
      ]
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockHoles
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      });

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Hole 18')).toBeInTheDocument();
    });

    const holeButton = screen.getByText('Hole 18');
    await user.click(holeButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to load polygons: HTTP error! status: 500')).toBeInTheDocument();
    });
  });
});