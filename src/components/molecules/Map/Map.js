import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import './Map.scss';

am4core.useTheme(am4themes_animated);
//Todo:
// JSON config (mixed),
// selected point(from to),
// refactor in promises (await)
// Change plane image
// Add series for countries (to remove on create event)
// Custom ZoomIn/Out Buttons
// Loader
// Treure pin al punt on esta l'avio
// Const in mayus

const Map = ({ cities }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const mapReference = useRef(null);
  const mapConfiguration = {
    exclude: `AQ`,
    initialCity: cities.find(city => city.isInitialCity),
    countriesIsoCode: cities.map(city => city.countryIsoCode.toUpperCase()),
    mapCities: [],
  };

  useEffect(() => {
    let mapChart = am4core.create(mapReference.current, am4maps.MapChart);

    //CreateMapChart()
    mapChart.geodata = am4geodata_worldHigh;
    mapChart.projection = new am4maps.projections.Miller();
    mapChart.zoomControl = new am4maps.ZoomControl();
    mapChart.homeZoomLevel = 0;
    mapChart.maxZoomLevel = 4;
    mapChart.homeGeoPoint = {
      latitude: 30,
      longitude: 180,
    };

    //SetPolygonSeries()
    let polygonSeries = mapChart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.fill = am4core.color(`#fff9f1`);
    polygonSeries.mapPolygons.template.stroke = am4core.color(`#b37e33`);
    polygonSeries.tooltip.background.strokeWidth = 0;
    polygonSeries.exclude = mapConfiguration.exclude;

    //SetPolygonTemplate()
    let polygonTemplate = polygonSeries.mapPolygons.template,
      activeState = polygonTemplate.states.create(`active`);
    activeState.properties.fill = am4core.color(`#fbcf90`);

    //SetImageSeries()
    let imageSeries = mapChart.series.push(new am4maps.MapImageSeries());
    imageSeries.mapImages.template.propertyFields.longitude = `longitude`;
    imageSeries.mapImages.template.propertyFields.latitude = `latitude`;
    imageSeries.mapImages.template.propertyFields.url = `url`;

    //AddCities
    let mapCities = mapChart.series.push(new am4maps.MapImageSeries());
    mapCities.mapImages.template.nonScaling = true;
    mapCities.tooltip.background.strokeWidth = 0;
    mapCities.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    let mapCity = mapCities.mapImages.template.createChild(am4core.Sprite);
    mapCity.horizontalCenter = `middle`;
    mapCity.verticalCenter = `bottom`;
    mapCity.width = 8;
    mapCity.height = 8;
    mapCity.scale = .04;
    mapCity.path = `M256,0C153.755,0,70.573,83.182,70.573,185.426c0,126.888,165.939,313.167,173.004,321.035
                    \tc6.636,7.391,18.222,7.378,24.846,0c7.065-7.868,173.004-194.147,173.004-321.035C441.425,83.182,358.244,0,256,0z M256,278.719
                    \tc-51.442,0-93.292-41.851-93.292-93.293S204.559,92.134,256,92.134s93.291,41.851,93.291,93.293S307.441,278.719,256,278.719z`;
    mapCity.fill = am4core.color(`#8b5a14`);
    mapCity.filters.push(new am4core.DropShadowFilter);

    const addCity = (coords, title) => {
      let city = mapCities.mapImages.create();
      city.latitude = coords.latitude;
      city.longitude = coords.longitude;
      city.tooltipText = title;
      city.name = title;

      return city;
    };

    cities.forEach(city => {
      let mapCity = addCity({ 'latitude': city.coordinates.coordinates[1], 'longitude': city.coordinates.coordinates[0] }, city.name);
      mapConfiguration.mapCities.push(mapCity);
    });

    // let genova = addCity({ 'latitude': 44.4056, 'longitude': 8.9463 }, `Genova`);
    // let amman = addCity({ 'latitude': 31.9539, 'longitude': 35.9106 }, `Amman`);
    // let sydney = addCity({ 'latitude': -33.8688, 'longitude': 151.2093 }, `Sydney`);
    // let london = addCity({ 'latitude': 51.5074, 'longitude': -.1278 }, `London`);
    // let barcelona = addCity({ 'latitude': 41.3851, 'longitude': 2.1734 }, `Barcelona`);

    //AddLines
    let lineSeries = mapChart.series.push(new am4maps.MapArcSeries());
    lineSeries.mapLines.template.line.strokeWidth = 2;
    lineSeries.mapLines.template.line.stroke = am4core.color(`#d4a259`);
    lineSeries.mapLines.template.line.nonScalingStroke = true;
    lineSeries.mapLines.template.line.strokeDasharray = `.25rem`;
    lineSeries.zIndex = 10;

    let lineSeriesShadow = lineSeries.filters.push(new am4core.DropShadowFilter);
    lineSeriesShadow.blur = 5;

    // //AddShadowLines
    let shadowLineSeries = mapChart.series.push(new am4maps.MapLineSeries());
    shadowLineSeries.mapLines.template.line.strokeOpacity = 0;
    shadowLineSeries.mapLines.template.line.nonScalingStroke = true;
    shadowLineSeries.mapLines.template.shortestDistance = false;
    shadowLineSeries.zIndex = 5;

    const addLine = (from, to) => {
      let line = lineSeries.mapLines.create(),
        shadowLine = shadowLineSeries.mapLines.create();
      line.className = `path`;
      line.setClassName();
      line.imagesToConnect = [from, to];
      line.line.controlPointDistance = -.3;
      shadowLine.imagesToConnect = [from, to];

      return line;
    };

    let initialCity = mapConfiguration.mapCities.find(initialCity => initialCity.name === mapConfiguration.initialCity.name);
    addLine(initialCity, initialCity);
    // addLine(amman, sydney);
    // addLine(sydney, london);
    // addLine(london, barcelona);

    //CreatePlane
    let plane = lineSeries.mapLines.getIndex(0).lineObjects.create();
    plane.latitude = 0;
    plane.longitude = 0;
    plane.position = 0;
    plane.width = 48;
    plane.height = 48;
    plane.adapter.add(`scale`, (scale, target) => .5 * (1 - (Math.abs(.5 - target.position))));

    //SetPlane
    let planeImage = plane.createChild(am4core.Sprite);
    planeImage.scale = .25;
    planeImage.horizontalCenter = `middle`;
    planeImage.verticalCenter = `middle`;
    planeImage.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    planeImage.fill = am4core.color(`#633a00`);
    planeImage.strokeOpacity = 0;

    //CreatePlaneShadow
    let planeShadow = shadowLineSeries.mapLines.getIndex(0).lineObjects.create();
    planeShadow.position = 0;
    planeShadow.width = 48;
    planeShadow.height = 48;

    //SetPlaneImage
    let shadowPlaneImage = planeShadow.createChild(am4core.Sprite);
    shadowPlaneImage.scale = .25;
    shadowPlaneImage.horizontalCenter = `middle`;
    shadowPlaneImage.verticalCenter = `middle`;
    shadowPlaneImage.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    shadowPlaneImage.fill = am4core.color(`#000`);
    shadowPlaneImage.strokeOpacity = 0;

    planeShadow.adapter.add(`scale`, (scale, target) => {
      target.opacity = .6 - (Math.abs(.5 - target.position));

      return .5 - .3 * (1 - (Math.abs(.5 - target.position)));
    });

    // Plane animation
    let currentLine = 0;
    let direction = 1;

    //FlyPlane
    const flyPlane = () => {
      plane.mapLine = lineSeries.mapLines.getIndex(currentLine);
      plane.parent = lineSeries;
      planeShadow.mapLine = shadowLineSeries.mapLines.getIndex(currentLine);
      planeShadow.parent = shadowLineSeries;
      shadowPlaneImage.rotation = planeImage.rotation;

      // Set up flyAnimation
      let from = 0,
        to = 1;

      if (planeImage.rotation != 0) planeImage.animate({ to: 0, property: `rotation` }, 1000).events.on(`animationended`, flyPlane);

      // Start the flyAnimation
      let flyAnimation = plane.animate({
        from: from,
        to: to,
        property: `position`,
      }, 5000, am4core.ease.sinInOut);
      flyAnimation.events.on(`animationended`, flyPlane);

      planeShadow.animate({
        from: from,
        to: to,
        property: `position`,
      }, 5000, am4core.ease.sinInOut);

      // Increment line, or reverse the direction
      currentLine += direction;
      if (currentLine < 0) {
        currentLine = 0;
        direction = 1;
      }
    };

    polygonTemplate.events.on(`over`, element => {
      mapConfiguration.countriesIsoCode.map(iso => {
        let country = polygonSeries.getPolygonById(iso);

        if (element.target.dataItem.dataContext.id === iso) {
          country.isHover = true;
          country.tooltipText = `{name}`;
          element.target.isActive = true;
        }
      });
    });

    mapConfiguration.mapCities.forEach(city => {
      city.events.on(`hit`, element => {
        // console.log(element.target.name)
        // let clickedCity = mapConfiguration.mapCities.find(city => city.name === element.target.name);
        // console.log(clickedCity)
        //         setDestination(element.target);
        // origin ? setOrigin(initialCity) : setOrigin(destination);

        // console.log('origin', origin);
        // console.log('destination', destination);
        // // console.log('destination', clickedCity);
        //
        addLine(initialCity, element.target);
        flyPlane();
      });
    });
    // amman.events.on(`hit`, element => {
    // console.log(element.target.name);
    // setPlaneDestination(element.target);
    // addLine(genova, amman);
    //   flyPlane();
    //   // console.log(element.target.dataItem.dataContext);
    // });

    polygonTemplate.events.on(`hit`, element => {
      console.log(element.target.dataItem.dataContext);
    });

    mapChart.events.on(`ready`, () => {
      let north, south, west, east;

      mapConfiguration.countriesIsoCode.forEach(isoCode => {
        let country = polygonSeries.getPolygonById(isoCode);

        if (!north || (country.north > north)) north = country.north;
        if (!south || (country.south < south)) south = country.south;
        if (!west || (country.west < west)) west = country.west;
        if (!east || (country.east > east)) east = country.east;

        country.isActive = true;
      });

      mapChart.zoomToRectangle(north, east, south, west, 1, true);
    });

    return () => mapChart && mapChart.dispose();
  }, []);

  return <section>
    <div ref={mapReference} style={{ width: `100%`, height: `500px` }} />
  </section>;

};

Map.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Map.defaultProps = {};

export default Map;