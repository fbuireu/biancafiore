import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import SEO from '../components/organisms/SEO/SEO';
import Layout from '../components/templates/Layout/Layout';

const AboutMe = props => {
  const [map, setMap] = useState(null),
    mapReference = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

    const initializeMap = ({ setMap, mapReference }) => {
      const map = new mapboxgl.Map({
        container: mapReference.current,
        style: `mapbox://styles/mapbox/streets-v11`,
        center: [-96, 37.8],
        zoom: 3,
      });

      map.on(`load`, () => {
        setMap(map);
        map.resize();
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource(`route`, {
          'type': `geojson`,
          'data': route,
        });
        map.addSource(`point`, {
          'type': `geojson`,
          'data': point,
        });
        map.addLayer({
          'id': `route`,
          'source': `route`,
          'type': `line`,
          'paint': {
            'line-width': 2,
            'line-color': `#007cbf`,
          },
        });
        map.addLayer({
          'id': `point`,
          'source': `point`,
          'type': `symbol`,
          'layout': {
            'icon-image': `airport-15`,
            'icon-rotate': [`get`, `bearing`],
            'icon-rotation-alignment': `map`,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          },
        });

        function animate() {
          // Update point geometry to a new position based on counter denoting
          // the index to access the arc.
          point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];

          // Calculate the bearing to ensure the icon is rotated to match the route arc
          // The bearing is calculate between the current point and the next point, except
          // at the end of the arc use the previous point and the current point
          point.features[0].properties.bearing = turf.bearing(
            turf.point(route.features[0].geometry.coordinates[
              counter >= steps ? counter - 1 : counter
              ],
            ),
            turf.point(
              route.features[0].geometry.coordinates[
                counter >= steps ? counter : counter + 1
                ],
            ),
          );

          // Update the source with this new data.
          map.getSource(`point`).setData(point);

          // Request the next frame of animation so long the end has not been reached.
          if (counter < steps) {
            requestAnimationFrame(animate);
          }

          counter++;
        }

        animate(counter);
      });
    };

    if (!map) initializeMap({ setMap, mapReference });

  }, [map]);

  // Sydney
  let origin = [151.209900, -33.865143];

  // London
  let destination = [-0.118092, 51.509865];

  // A simple line from origin to destination.
  let route = {
    'type': `FeatureCollection`,
    'features': [
      {
        'type': `Feature`,
        'geometry': {
          'type': `LineString`,
          'coordinates': [origin, destination],
        },
      },
    ],
  };

  // A single point that animates along the route.
  // Coordinates are initially set to origin.
  let point = {
    'type': `FeatureCollection`,
    'features': [
      {
        'type': `Feature`,
        'properties': {},
        'geometry': {
          'type': `Point`,
          'coordinates': origin,
        },
      },
    ],
  };

  // Calculate the distance in kilometers between route start/end point.
  let lineDistance = turf.length(route.features[0], { units: `kilometers` });

  let arc = [];

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  let steps = 500;

  // Draw an arc between the `origin` & `destination` of the two points
  for (let i = 0; i < lineDistance; i += lineDistance / steps) {
    let segment = turf.along(route.features[0], i, { units: `kilometers` });
    arc.push(segment.geometry.coordinates);
  }

  // Update the route with calculated arc coordinates
  route.features[0].geometry.coordinates = arc;

  // Used to increment the value of the point measurement against the route.
  let counter = 0;

  return <Layout>
    <SEO title="Home" />
    <h1>Hi About page</h1>
    <p>This will be an amazing portfolio for the best content writer ever.</p>
    <p>Now go build something great.</p>
    <map ref={mapReference} />
  </Layout>;
};

export default AboutMe;
