import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import React, { useEffect, useRef, useState } from 'react';

am4core.useTheme(am4themes_animated);
//Todo:
// Add country field in cities CMS (ISO code)
// Change all CMS page schema (no need 4 pages, just 1 pages collection and all types inside [investigate])
// JSON config,
// selected point(from to),
// retrieve selected point from CMS,
// refactor in promises (await)
// Change plane image
// Add custom marker
// Add series for countries (to remove on create event)
// Decrease plane scale on higher point

const Map = () => {
  const [planeOrigin, setPlaneOrigin] = useState(null);
  const [planeDstination, setPlaneDestination] = useState(null);
  const mapReference = useRef(null);
  const countriesISO = [`ES`, `GB`, `JO`, `AU`, `IT`];
  const mapConfiguration = {
    exclude: `AQ`,
  };

  useEffect(() => {
    let mapChart = am4core.create(mapReference.current, am4maps.MapChart);

    //CreateMapChart()
    mapChart.geodata = am4geodata_worldHigh;
    mapChart.projection = new am4maps.projections.Miller();
    mapChart.homeZoomLevel = 0;
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
    let cities = mapChart.series.push(new am4maps.MapImageSeries());
    cities.mapImages.template.nonScaling = true;
    cities.tooltip.background.strokeWidth = 0;
    cities.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    let city = cities.mapImages.template.createChild(am4core.Circle);
    city.radius = 6;
    city.fill = am4core.color(`#d4a259`);

    const addCity = (coords, title) => {
      let city = cities.mapImages.create();
      city.latitude = coords.latitude;
      city.longitude = coords.longitude;
      city.tooltipText = title;
      city.name = title;

      return city;
    };

    let genova = addCity({ 'latitude': 44.4056, 'longitude': 8.9463 }, `Genova`);
    let amman = addCity({ 'latitude': 31.9539, 'longitude': 35.9106 }, `Amman`);
    let sydney = addCity({ 'latitude': -33.8688, 'longitude': 151.2093 }, `Sydney`);
    let london = addCity({ 'latitude': 51.5074, 'longitude': -.1278 }, `London`);
    let barcelona = addCity({ 'latitude': 41.3851, 'longitude': 2.1734 }, `Barcelona`);

    //AddLines
    let lineSeries = mapChart.series.push(new am4maps.MapArcSeries());
    lineSeries.mapLines.template.line.strokeWidth = 2;
    lineSeries.mapLines.template.line.stroke = am4core.color(`#d4a259`);
    lineSeries.mapLines.template.line.nonScalingStroke = true;
    lineSeries.mapLines.template.line.strokeDasharray = `.5rem`;
    lineSeries.zIndex = 10;

    //AddShadowLines
    let shadowLineSeries = mapChart.series.push(new am4maps.MapLineSeries());
    shadowLineSeries.mapLines.template.line.strokeOpacity = 0;
    shadowLineSeries.mapLines.template.line.nonScalingStroke = true;
    shadowLineSeries.mapLines.template.shortestDistance = false;
    shadowLineSeries.zIndex = 5;

    function addLine(from, to) {
      let line = lineSeries.mapLines.create();
      line.imagesToConnect = [from, to];
      line.line.controlPointDistance = -.3;

      let shadowLine = shadowLineSeries.mapLines.create();
      shadowLine.imagesToConnect = [from, to];

      return line;
    }

    addLine(genova, genova);
    // addLine(amman, sydney);
    // addLine(sydney, london);
    // addLine(london, barcelona);
    //
    //CreatePlane
    let plane = lineSeries.mapLines.getIndex(0).lineObjects.create();
    plane.position = 0;
    plane.width = 48;
    plane.height = 48;
    plane.adapter.add(`scale`, (scale, target) => .5 * (1 - (Math.abs(.5 - target.position))));

    //SetPlane
    let planeImage = plane.createChild(am4core.Sprite);
    planeImage.scale = .125;
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
    shadowPlaneImage.scale = .125;
    shadowPlaneImage.horizontalCenter = `middle`;
    shadowPlaneImage.verticalCenter = `middle`;
    shadowPlaneImage.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    shadowPlaneImage.fill = am4core.color(`#000`);
    shadowPlaneImage.strokeOpacity = 0;

    planeShadow.adapter.add(`scale`, (scale, target) => {
      target.opacity = (.6 - (Math.abs(.5 - target.position)));

      return .5 - .3 * (1 - (Math.abs(.5 - target.position)));
    });

    // Plane animation
    let currentLine = 0;
    let direction = 1;

    //FlyPlane
    function flyPlane() {
      plane.mapLine = lineSeries.mapLines.getIndex(currentLine);
      plane.parent = lineSeries;
      planeShadow.mapLine = shadowLineSeries.mapLines.getIndex(currentLine);
      planeShadow.parent = shadowLineSeries;
      shadowPlaneImage.rotation = planeImage.rotation;

      // Set up animation
      let from,
        to,
        numLines = lineSeries.mapLines.length;

      if (direction === 1) {
        from = 0;
        to = 1;

        if (planeImage.rotation != 0) planeImage.animate({ to: 0, property: `rotation` }, 1000).events.on(`animationended`, flyPlane);

      }

      // Start the animation
      let animation = plane.animate({
        from: from,
        to: to,
        property: `position`,
      }, 5000, am4core.ease.sinInOut);
      animation.events.on(`animationended`, flyPlane);

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
      } else if ((currentLine + 1) > numLines) {
        currentLine = numLines - 1;
        direction = -1;
      }
    }

    // Go!
    // flyPlane();

    polygonTemplate.events.on(`over`, element => {
      countriesISO.map(iso => {
        let country = polygonSeries.getPolygonById(iso);

        if (element.target.dataItem.dataContext.id === iso) {
          country.isHover = true;
          country.tooltipText = `{name}`;
          element.target.isActive = true;
        }
      });
    });

    amman.events.on(`hit`, element => {
      // console.log(element.target.name);
      // setPlaneDestination(element.target);
      addLine(genova, amman);
      flyPlane()
      // console.log(element.target.dataItem.dataContext);
    });

    polygonTemplate.events.on(`hit`, element => {
      console.log(element.target.dataItem.dataContext);
    });

    mapChart.events.on(`ready`, () => {
      let north, south, west, east;

      for (let i = 0; i < countriesISO.length; i++) {
        let country = polygonSeries.getPolygonById(countriesISO[i]);
        if (!north || (country.north > north)) north = country.north;
        if (!south || (country.south < south)) south = country.south;
        if (!west || (country.west < west)) west = country.west;
        if (!east || (country.east > east)) east = country.east;

        country.isActive = true;
      }

      mapChart.zoomToRectangle(north, east, south, west, 1, true);
    });

    return () => mapChart && mapChart.dispose();
  });

  return <section>
    <div ref={mapReference} style={{ width: `100%`, height: `500px` }} />
  </section>;

};

Map.propTypes = {};

Map.defaultProps = {};

export default Map;