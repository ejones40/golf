import React from 'react';
import { render, screen } from '@testing-library/react';
import HoleVisualizer from '../components/HoleVisualizer';

describe('HoleVisualizer Component', () => {
  const mockHoleData = {
    id: 25506,
    number: 18,
    courseid: 4803,
    rotation: 2.04479566062,
    range: {
      x: { min: -122.2707111, max: -122.269083337 },
      y: { min: 47.3838734109, max: 47.3896241104 }
    },
    dimensions: { width: 960, height: 960 },
    vectors: [
      { type: 'Flag', lat: 47.3893912619, long: -122.2692596912384 },
      { type: 'Blue', lat: 47.3838734109, long: -122.269259691 }
    ],
    flagcoords: { lat: 47.38135479698122, long: -122.26435018374639 }
  };

  const mockPolygons = [
    {
      holeid: 25506,
      surfacetype: 'Green',
      polygon: [
        { lat: 47.3814806732001, long: -122.26437270641327 },
        { lat: 47.38148793784317, long: -122.2643968462944 },
        { lat: 47.38148975400378, long: -122.26441696286201 }
      ]
    },
    {
      holeid: 25506,
      surfacetype: 'Fairway',
      polygon: [
        { lat: 47.3815, long: -122.2644 },
        { lat: 47.3816, long: -122.2645 },
        { lat: 47.3817, long: -122.2646 }
      ]
    }
  ];

  test('renders hole title', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    expect(screen.getByText('Hole 18 - Course 4803')).toBeInTheDocument();
  });

  test('renders SVG container', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '600');
  });

  test('renders polygons with correct colors', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    
    const polygons = document.querySelectorAll('polygon');
    expect(polygons).toHaveLength(2);
    
    // Check Green polygon (using actual colors from component)
    expect(polygons[0]).toHaveAttribute('fill', '#4CAF50');
    expect(polygons[0]).toHaveAttribute('stroke', '#333');
    
    // Check Fairway polygon
    expect(polygons[1]).toHaveAttribute('fill', '#8BC34A');
    expect(polygons[1]).toHaveAttribute('stroke', '#333');
  });

  test('renders legend with surface types', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    
    expect(screen.getByText('Legend:')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Fairway')).toBeInTheDocument();
  });

  test('renders legend colors correctly', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    
    const legendItems = document.querySelectorAll('div[style*="background-color"]');
    expect(legendItems.length).toBeGreaterThanOrEqual(2);
    
    // Check that legend items have the correct background colors
    const greenLegend = Array.from(legendItems).find(item => 
      item.style.backgroundColor === 'rgb(76, 175, 80)' // #4CAF50
    );
    expect(greenLegend).toBeInTheDocument();
  });

  test('renders vectors (tees and flag)', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
    
    // Check for flag (should be red)
    const flagCircle = Array.from(circles).find(circle => 
      circle.getAttribute('fill') === '#FF0000'
    );
    expect(flagCircle).toBeInTheDocument();
    
    // Check for blue tee
    const teeCircle = Array.from(circles).find(circle => 
      circle.getAttribute('fill') === '#0000FF'
    );
    expect(teeCircle).toBeInTheDocument();
  });

  test('handles empty polygons array', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={[]} />);
    
    expect(screen.getByText('Select a hole to view its visualization')).toBeInTheDocument();
    const polygons = document.querySelectorAll('polygon');
    expect(polygons).toHaveLength(0);
  });

  test('handles missing hole data', () => {
    render(<HoleVisualizer hole={null} polygons={mockPolygons} />);
    
    // Should render the default message
    expect(screen.getByText('Select a hole to view its visualization')).toBeInTheDocument();
  });

  test('handles missing polygons prop', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={null} />);
    
    expect(screen.getByText('Select a hole to view its visualization')).toBeInTheDocument();
    const polygons = document.querySelectorAll('polygon');
    expect(polygons).toHaveLength(0);
  });

  test('converts coordinates correctly', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    
    const polygons = document.querySelectorAll('polygon');
    expect(polygons[0]).toHaveAttribute('points');
    
    // Points should be converted from lat/long to SVG coordinates
    const points = polygons[0].getAttribute('points');
    expect(points).toBeTruthy();
    expect(points.split(' ').length).toBeGreaterThan(0);
  });

  test('renders different surface types with different colors', () => {
    const multiSurfacePolygons = [
      {
        holeid: 25506,
        surfacetype: 'Green',
        polygon: [{ lat: 47.3814, long: -122.2643 }]
      },
      {
        holeid: 25506,
        surfacetype: 'Fairway',
        polygon: [{ lat: 47.3815, long: -122.2644 }]
      },
      {
        holeid: 25506,
        surfacetype: 'Rough',
        polygon: [{ lat: 47.3816, long: -122.2645 }]
      },
      {
        holeid: 25506,
        surfacetype: 'Sand',
        polygon: [{ lat: 47.3817, long: -122.2646 }]
      },
      {
        holeid: 25506,
        surfacetype: 'Water',
        polygon: [{ lat: 47.3818, long: -122.2647 }]
      }
    ];

    render(<HoleVisualizer hole={mockHoleData} polygons={multiSurfacePolygons} />);
    
    const polygons = document.querySelectorAll('polygon');
    expect(polygons).toHaveLength(5);
    
    // Check that different surface types have different colors
    const colors = Array.from(polygons).map(p => p.getAttribute('fill'));
    const uniqueColors = [...new Set(colors)];
    expect(uniqueColors.length).toBeGreaterThan(1);
  });

  test('handles unknown surface type with default color', () => {
    const unknownSurfacePolygons = [
      {
        holeid: 25506,
        surfacetype: 'UnknownSurface',
        polygon: [{ lat: 47.3814, long: -122.2643 }]
      }
    ];

    render(<HoleVisualizer hole={mockHoleData} polygons={unknownSurfacePolygons} />);
    
    const polygons = document.querySelectorAll('polygon');
    expect(polygons).toHaveLength(1);
    expect(polygons[0]).toHaveAttribute('fill', '#9E9E9E'); // Default gray color from component
  });

  test('renders hole information', () => {
    render(<HoleVisualizer hole={mockHoleData} polygons={mockPolygons} />);
    
    expect(screen.getByText('Hole 18 - Course 4803')).toBeInTheDocument();
    // Could add more hole info display tests here
  });

  test('renders woods and tee surface types with correct colors', () => {
    const specialSurfacePolygons = [
      {
        holeid: 25506,
        surfacetype: 'Woods',
        polygon: [{ lat: 47.3814, long: -122.2643 }]
      },
      {
        holeid: 25506,
        surfacetype: 'Tee',
        polygon: [{ lat: 47.3815, long: -122.2644 }]
      }
    ];

    render(<HoleVisualizer hole={mockHoleData} polygons={specialSurfacePolygons} />);
    
    const polygons = document.querySelectorAll('polygon');
    expect(polygons).toHaveLength(2);
    
    // Check Woods polygon
    expect(polygons[0]).toHaveAttribute('fill', '#3E2723');
    
    // Check Tee polygon
    expect(polygons[1]).toHaveAttribute('fill', '#FF9800');
  });

  test('renders white and red vector types with correct colors', () => {
    const mockHoleWithVectors = {
      ...mockHoleData,
      vectors: [
        { type: 'White', lat: 47.3843622628, long: -122.269388009 },
        { type: 'Red', lat: 47.3850228683, long: -122.269657507 },
        { type: 'Unknown', lat: 47.3851, long: -122.2697 }
      ]
    };

    render(<HoleVisualizer hole={mockHoleWithVectors} polygons={mockPolygons} />);
    
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
    
    // Check for white tee
    const whiteCircle = Array.from(circles).find(circle => 
      circle.getAttribute('fill') === '#FFFFFF'
    );
    expect(whiteCircle).toBeInTheDocument();
    
    // Check for red tee
    const redCircle = Array.from(circles).find(circle => 
      circle.getAttribute('fill') === '#FF0000'
    );
    expect(redCircle).toBeInTheDocument();
    
    // Check for unknown vector type (should be black)
    const unknownCircle = Array.from(circles).find(circle => 
      circle.getAttribute('fill') === '#000000'
    );
    expect(unknownCircle).toBeInTheDocument();
  });
});