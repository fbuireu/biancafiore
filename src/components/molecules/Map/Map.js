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
// https://css-tricks.com/making-movies-with-amcharts/#article-header-id-6

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

    //AddCities
    let mapCities = mapChart.series.push(new am4maps.MapImageSeries());
    mapCities.mapImages.template.nonScaling = true;
    mapCities.tooltip.background.strokeWidth = 0;
    mapCities.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    //SetCity
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

    cities.forEach(city => {
      let mapCity = mapCities.mapImages.create();

      mapCity.latitude = city.coordinates.coordinates[1];
      mapCity.longitude = city.coordinates.coordinates[0];
      mapCity.tooltipText = city.name;
      mapCity.name = city.name;

      mapConfiguration.mapCities.push(mapCity);
    });

    //AddLines
    let lineSeries = mapChart.series.push(new am4maps.MapArcSeries());
    lineSeries.mapLines.template.line.strokeWidth = 2;
    lineSeries.mapLines.template.line.stroke = am4core.color(`#d4a259`);
    lineSeries.mapLines.template.line.nonScalingStroke = true;
    lineSeries.mapLines.template.line.strokeDasharray = `.25rem`;
    lineSeries.zIndex = 10;

    //AddDropShadowFilter
    let lineSeriesShadow = lineSeries.filters.push(new am4core.DropShadowFilter);
    lineSeriesShadow.blur = 5;

    //AddShadowLines
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

    //InitialConf
    let initialCity = mapConfiguration.mapCities.find(initialCity => initialCity.name === mapConfiguration.initialCity.name);
    addLine(initialCity, initialCity);

    //CreatePlane
    let planeContainer = lineSeries.mapLines.getIndex(0).lineObjects.create();
    planeContainer.position = 0;
    planeContainer.nonScaling = false;
    planeContainer.adapter.add(`scale`, (scale, target) => .5 * (1 - (Math.abs(.5 - target.position))) / mapChart.zoomLevel);

    //SetPlane
    let plane = planeContainer.createChild(am4core.Sprite);
    plane.scale = .25;
    plane.horizontalCenter = `middle`;
    plane.verticalCenter = `middle`;
    plane.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    plane.fill = am4core.color(`#633a00`);
    plane.strokeOpacity = 0;

    //CreatePlaneShadow
    let planeShadowContainer = shadowLineSeries.mapLines.getIndex(0).lineObjects.create();
    planeShadowContainer.position = 0;
    planeShadowContainer.nonScaling = false;
    planeShadowContainer.adapter.add(`scale`, (scale, target) => {
      target.opacity = .6 - (Math.abs(.5 - target.position));

      return .5 * (1 - (Math.abs(.5 - target.position))) / mapChart.zoomLevel;
    });

    //SetPlaneImage
    let planeShadow = planeShadowContainer.createChild(am4core.Sprite);
    planeShadow.scale = .15;
    planeShadow.horizontalCenter = `middle`;
    planeShadow.verticalCenter = `middle`;
    planeShadow.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    planeShadow.fill = am4core.color(`#000`);
    planeShadow.strokeOpacity = 0;

    // Plane animation
    let currentLine = 0;
    let direction = 1;

    //FlyPlane
    const flyPlane = () => {
      let from = 0,
        to = 1;
      planeContainer.mapLine = lineSeries.mapLines.getIndex(currentLine);
      planeContainer.parent = lineSeries;
      planeShadowContainer.mapLine = shadowLineSeries.mapLines.getIndex(currentLine);
      planeShadowContainer.parent = shadowLineSeries;
      planeShadow.rotation = plane.rotation;

      // Set up flyAnimation
      if (plane.rotation !== 0) plane.animate({ to: 0, property: `rotation` }, 1000).events.on(`animationended`, flyPlane);

      // Start the flyAnimation
      let flyAnimation = planeContainer.animate({
        property: `position`,
        from: from,
        to: to,
      }, 5000, am4core.ease.sinInOut);
      flyAnimation.events.on(`animationended`, flyPlane);

      planeShadowContainer.animate({
        property: `position`,
        from: from,
        to: to,
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