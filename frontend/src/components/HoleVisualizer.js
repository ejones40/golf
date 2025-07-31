import React from 'react';

const HoleVisualizer = ({ hole, polygons }) => {
  if (!hole || !polygons || polygons.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ccc' }}>
        <p>Select a hole to view its visualization</p>
      </div>
    );
  }

  // Calculate bounds for the SVG viewport
  const allPoints = polygons.flatMap(p => p.polygon);
  const lats = allPoints.map(p => p.lat);
  const longs = allPoints.map(p => p.long);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLong = Math.min(...longs);
  const maxLong = Math.max(...longs);
  
  // Add padding
  const padding = 0.0001;
  const viewMinLat = minLat - padding;
  const viewMaxLat = maxLat + padding;
  const viewMinLong = minLong - padding;
  const viewMaxLong = maxLong + padding;
  
  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 600;
  
  // Convert lat/long to SVG coordinates
  const latToY = (lat) => {
    return ((viewMaxLat - lat) / (viewMaxLat - viewMinLat)) * svgHeight;
  };
  
  const longToX = (long) => {
    return ((long - viewMinLong) / (viewMaxLong - viewMinLong)) * svgWidth;
  };

  // Color mapping for different surface types
  const getColor = (surfaceType) => {
    switch (surfaceType?.toLowerCase()) {
      case 'green': return '#4CAF50';
      case 'fairway': return '#8BC34A';
      case 'rough': return '#689F38';
      case 'sand': return '#FFC107';
      case 'water': return '#2196F3';
      case 'woods': return '#3E2723';
      case 'tee': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Hole {hole.number} - Course {hole.courseid}</h3>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
        <svg width={svgWidth} height={svgHeight} style={{ border: '1px solid #eee' }}>
          {/* Render polygons */}
          {polygons.map((polygonData, index) => {
            const points = polygonData.polygon.map(point => 
              `${longToX(point.long)},${latToY(point.lat)}`
            ).join(' ');
            
            return (
              <polygon
                key={index}
                points={points}
                fill={getColor(polygonData.surfacetype)}
                stroke="#333"
                strokeWidth="1"
                opacity="0.8"
              />
            );
          })}
          
          {/* Render hole vectors (tees, flag) */}
          {hole.vectors && hole.vectors.map((vector, index) => {
            const x = longToX(vector.long);
            const y = latToY(vector.lat);
            
            let color = '#000';
            let size = 4;
            
            switch (vector.type?.toLowerCase()) {
              case 'flag': color = '#FF0000'; size = 6; break;
              case 'blue': color = '#0000FF'; size = 5; break;
              case 'white': color = '#FFFFFF'; size = 5; break;
              case 'red': color = '#FF0000'; size = 5; break;
              default: color = '#000000'; break;
            }
            
            return (
              <circle
                key={`vector-${index}`}
                cx={x}
                cy={y}
                r={size}
                fill={color}
                stroke="#000"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        
        {/* Legend */}
        <div style={{ marginTop: '10px' }}>
          <h4>Legend:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {polygons.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: getColor(p.surfacetype),
                    border: '1px solid #333'
                  }}
                ></div>
                <span>{p.surfacetype}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoleVisualizer;