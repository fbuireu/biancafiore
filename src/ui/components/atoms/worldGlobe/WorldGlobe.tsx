import React, { type FunctionComponent, memo, useCallback, useRef } from 'react';
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

const calculateCenter = (data: GlobeAllCitiesValues[]) => {
    const latitudes = data.map((point) => parseFloat(point.latitude));
    const longitudes = data.map((point) => parseFloat(point.longitude));

    const centerLatitude = latitudes.reduce((acc, latitude) => acc + latitude, 0) / latitudes.length;
    const centerLongitude = longitudes.reduce((acc, longitude) => acc + longitude, 0) / longitudes.length;

    return { latitude: centerLatitude, longitude: centerLongitude };
};

const WorldGlobe: FunctionComponent<GlobeAllCitiesProps> = memo(({ data, width = 390 }) => {
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

    const points = data.map((data) => {
        const { latitude, longitude, name } = data;

        return {
            lat: latitude,
            lng: longitude,
            // altitude: 0.05,
            // radius: 0.3,
            color: '#8e6e38',
            label: name,
        };
    });

    return (
        <Globe
            ref={worldGlobeReference}
            height={458}
            width={width}
            onGlobeReady={onGlobeReady}
            pointsMerge={true}
            animateIn={true}
            showAtmosphere={false}
            rendererConfig={{ antialias: true, alpha: true }}
            backgroundColor={'rgba(255, 255, 255, 0)'}
            pointsData={points}
            pointAltitude="altitude"
            pointRadius="radius"
            pointColor="color"
            labelsData={points}
            labelText={'label'}
            labelSize={2.25}
            labelColor={useCallback(() => '#67501f', [])}
            labelDotRadius={0.75}
            labelAltitude={0.025}
            hexPolygonsData={countries.features}
            hexPolygonColor={() => '#d4a259'}
            onLabelClick={useCallback(() => {
                console.log('hehehe');
            }, [])}
            globeMaterial={
                new THREE.MeshPhongMaterial({
                    color: '#f7ecd6',
                    opacity: 0.7,
                    transparent: true,
                })
            }
        />
    );
});

WorldGlobe.displayName = 'WorldGlobe';

export default WorldGlobe;
