import React, { memo, useCallback, useRef } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import countries from '@data/countries.geojson.json';
import './world-globe.css';

interface GlobeAllCitiesValues {
  latitude: string;
  longitude: string;
  name: string;
}

interface GlobeAllCitiesProps {
  data: GlobeAllCitiesValues[];
  width?: number;
}

const enum MovementType {
  MOVE = 'move',
  ZOOM = 'zoom',
}

const enum Direction {
  CLOCKWISE = 'clockwise',
  COUNTERCLOCKWISE = 'counterclockwise',
}

const enum Zoom {
  IN = 'in',
  OUT = 'out',
}

// separate fn
const calculateCenter = (data: GlobeAllCitiesValues[]) => {
  const latitudes = data.map((point) => parseFloat(point.latitude));
  const longitudes = data.map((point) => parseFloat(point.longitude));

  const centerLatitude = latitudes.reduce((acc, latitude) => acc + latitude, 0) / latitudes.length;
  const centerLongitude = longitudes.reduce((acc, longitude) => acc + longitude, 0) / longitudes.length;

  return { latitude: centerLatitude, longitude: centerLongitude };
};

const WorldGlobe = memo(({ data, width = 390 }: GlobeAllCitiesProps) => {
  const worldGlobeReference = useRef<GlobeMethods | undefined>(undefined);
  const onGlobeReady = () => {
    if (worldGlobeReference.current) {
      const { latitude, longitude } = calculateCenter(data);
      worldGlobeReference.current.controls().autoRotate = true;
      worldGlobeReference.current.controls().autoRotateSpeed = 0.5;
      worldGlobeReference.current.pointOfView({
        lat: latitude,
        lng: longitude,
        altitude: 1.5,
      });
    }
  };
  // separate variable (worldglobe.animationduration) for each of these. Same for defaults controls (autoRotate = true;)
  const ANIMATION_DURATION = 500;
  const MOVEMENT_OFFSET = 20;
  const ZOOM_OFFSET = 0.1;

  const handleAction = useCallback(
    (movementDirection: Direction | Zoom, type: MovementType) => {
      if (worldGlobeReference.current) {
        const { lng: currentLongitude, altitude: currentZoom } = worldGlobeReference.current.pointOfView();

        if (type === MovementType.MOVE) {
          const offset = movementDirection === Direction.CLOCKWISE ? MOVEMENT_OFFSET : -MOVEMENT_OFFSET;
          const newLongitude = currentLongitude + offset;
          worldGlobeReference.current.pointOfView({ lng: newLongitude }, ANIMATION_DURATION);
        } else if (type === MovementType.ZOOM) {
          const newZoom = movementDirection === Zoom.IN ? currentZoom - ZOOM_OFFSET : currentZoom + ZOOM_OFFSET;
          worldGlobeReference.current.pointOfView({ altitude: newZoom }, ANIMATION_DURATION);
        }
      }
    },
    [worldGlobeReference]
  );

  // treat data before sending it
  const points = data.map((data) => {
    const { latitude, longitude, name } = data;

    return {
      lat: latitude,
      lng: longitude,
      label: name,
    };
  });

  // import it
  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"/>
  <circle fill="currentColor" cx="14" cy="14" r="7"/>
  </svg>`;

  return (
    <>
      <Globe
        ref={worldGlobeReference}
        height={458}
        width={width}
        onGlobeReady={onGlobeReady}
        pointsMerge={true}
        animateIn={true}
        showAtmosphere={false}
        backgroundColor={'rgba(255, 255, 255, 0)'}
        pointsData={points}
        pointAltitude="altitude"
        pointRadius="radius"
        pointColor="color"
        htmlElementsData={points}
        htmlElement={(d) => {
          const marker = document.createElement('div');
          marker.innerHTML = markerSvg;
          marker.classList.add('marker');
          marker.onclick = () => console.info(d);
          return marker;
        }}
        hexPolygonsData={countries.features}
        hexPolygonColor={() => '#d4a259'}
        globeMaterial={
          new THREE.MeshPhongMaterial({
            color: '#f7ecd6',
            opacity: 0.7,
            transparent: true,
          })
        }
      />
      <button onClick={() => handleAction(Direction.CLOCKWISE, MovementType.MOVE)}>&larr; Move Left</button>
      <button onClick={() => handleAction(Direction.COUNTERCLOCKWISE, MovementType.MOVE)}>Move Right &rarr;</button>
      <button onClick={() => handleAction(Zoom.IN, MovementType.ZOOM)}>Zoom In</button>
      <button onClick={() => handleAction(Zoom.OUT, MovementType.ZOOM)}>Zoom Out</button>
    </>
  );
});

WorldGlobe.displayName = 'WorldGlobe';

export default WorldGlobe;
