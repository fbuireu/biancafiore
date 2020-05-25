import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import './Map.scss';

am4core.useTheme(am4themes_animated);

const Map = ({ cities, showCityInformation }) => {
  const mapReference = useRef(null);
  const previousDestinationRef = useRef();
  const previousLineRef = useRef();
  const mapConfiguration = {
    exclude: `AQ`,
    initialCity: cities.find(city => city.isInitialCity),
    countriesIsoCode: cities.map(city => city.countryIsoCode),
    mapCities: [],
    flight: {
      from: 0,
      to: 1,
    },
  };
  let origin, destination;

  const createMapChart = mapChart => {
    mapChart.geodata = am4geodata_worldHigh;
    mapChart.preloader.disabled = false;
    mapChart.projection = new am4maps.projections.Miller();
    mapChart.zoomControl = new am4maps.ZoomControl();
    mapChart.homeZoomLevel = 0;
  };

  const setLoader = mapChart => {
    const loader = mapChart.tooltipContainer.createChild(am4core.Container);
    loader.background.fill = am4core.color(`#fff`);
    loader.background.fillOpacity = 0.8;
    loader.width = am4core.percent(100);
    loader.height = am4core.percent(100);

    const loaderLabel = loader.createChild(am4core.Label);
    loaderLabel.text = `Loading stuff...`;
    loaderLabel.align = `center`;
    loaderLabel.valign = `middle`;
    loaderLabel.fontSize = `1rem`;
    loaderLabel.dy = 50;

    const hourGlass = loader.createChild(am4core.Image);
    hourGlass.href = `/assets/svg/loader.svg`;
    hourGlass.align = `center`;
    hourGlass.valign = `middle`;
    hourGlass.horizontalCenter = `middle`;
    hourGlass.verticalCenter = `middle`;
    hourGlass.scale = 0.7;

    return loader;
  };

  const setPolygonSeries = mapChart => {
    const polygonSeries = mapChart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.fill = am4core.color(`#fff9f1`);
    polygonSeries.mapPolygons.template.stroke = am4core.color(`#b37e33`);
    polygonSeries.tooltip.background.strokeWidth = 0;
    polygonSeries.exclude = mapConfiguration.exclude;

    return polygonSeries;
  };

  const setPolygonTemplate = polygonSeries => {
    const polygonTemplate = polygonSeries.mapPolygons.template;
    const activeState = polygonTemplate.states.create(`active`);
    activeState.properties.fill = am4core.color(`#fbcf90`);

    return polygonTemplate;
  };

  const setLineSeries = mapChart => {
    const lineSeries = mapChart.series.push(new am4maps.MapArcSeries());
    lineSeries.mapLines.template.line.strokeWidth = 2;
    lineSeries.mapLines.template.line.stroke = am4core.color(`#d4a259`);
    lineSeries.mapLines.template.line.nonScalingStroke = true;
    lineSeries.mapLines.template.line.strokeDasharray = `.25rem`;
    lineSeries.zIndex = 10;

    return lineSeries;
  };

  const setDropShadowFilter = lineSeries => {
    const lineSeriesShadow = lineSeries.filters.push(new am4core.DropShadowFilter());
    lineSeriesShadow.blur = 5;
  };

  const setShadowLineSeries = mapChart => {
    const shadowLineSeries = mapChart.series.push(new am4maps.MapLineSeries());
    shadowLineSeries.mapLines.template.line.strokeOpacity = 0;
    shadowLineSeries.mapLines.template.line.nonScalingStroke = true;
    shadowLineSeries.mapLines.template.shortestDistance = false;
    shadowLineSeries.zIndex = 5;

    return shadowLineSeries;
  };

  const setCities = mapChart => {
    const mapCities = mapChart.series.push(new am4maps.MapImageSeries());
    mapCities.mapImages.template.nonScaling = true;
    mapCities.tooltip.background.strokeWidth = 0;
    mapCities.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    return mapCities;
  };

  const setCity = mapCities => {
    const mapCity = mapCities.mapImages.template.createChild(am4core.Image);
    mapCity.href = `/assets/svg/pin.svg`;
    mapCity.horizontalCenter = `middle`;
    mapCity.verticalCenter = `bottom`;
    mapCity.scale = .75;
    mapCity.rotation = `15deg`;

    return mapCity;
  };

  const setCitiesShadowFilter = mapCity => {
    let cityShadow = mapCity.filters.push(new am4core.DropShadowFilter());
    cityShadow.dy = 10;
    cityShadow.blur = 3;
  };

  const setInitialCities = mapCities => {
    cities.forEach(city => {
      const mapCity = mapCities.mapImages.create();

      mapCity.latitude = city.coordinates.coordinates[1];
      mapCity.longitude = city.coordinates.coordinates[0];
      mapCity.tooltipText = city.name;
      mapCity.countryIsoCode = city.countryIsoCode;
      mapCity.name = city.name;

      mapConfiguration.mapCities.push(mapCity);
    });
  };

  const setPlaneContainer = lineSeries => {
    const planeContainer = lineSeries.mapLines.getIndex(0).lineObjects.create();
    planeContainer.position = 0;
    planeContainer.nonScaling = false;
    planeContainer.adapter.add(`scale`, (scale, target) => .5 * (1 - (Math.abs(.5 - target.position))));

    return planeContainer;
  };

  const setPlaneShadowContainer = shadowLineSeries => {
    const planeShadowContainer = shadowLineSeries.mapLines.getIndex(0).lineObjects.create();
    planeShadowContainer.position = 0;
    planeShadowContainer.nonScaling = false;
    planeShadowContainer.adapter.add(`scale`, (scale, target) => {
      target.opacity = .6 - (Math.abs(.5 - target.position));

      return .5 * (1 - (Math.abs(.5 - target.position)));
    });

    return planeShadowContainer;
  };

  const setPlane = planeContainer => {
    const plane = planeContainer.createChild(am4core.Sprite);
    plane.scale = .2;
    plane.horizontalCenter = `middle`;
    plane.verticalCenter = `middle`;
    plane.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    plane.fill = am4core.color(`#633a00`);
    plane.strokeOpacity = 0;

    return plane;
  };

  const setPlaneShadow = planeShadowContainer => {
    const planeShadow = planeShadowContainer.createChild(am4core.Sprite);
    planeShadow.scale = .1;
    planeShadow.horizontalCenter = `middle`;
    planeShadow.verticalCenter = `middle`;
    planeShadow.path = `m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47`;
    planeShadow.fill = am4core.color(`#000`);
    planeShadow.strokeOpacity = 0;

    return planeShadow;
  };

  const addLines = (lineSeries, shadowLineSeries) => {
    return (from, to) => {
      const line = lineSeries.mapLines.create();
      const shadowLine = shadowLineSeries.mapLines.create();
      line.className = `--is-created`;
      line.setClassName();
      line.imagesToConnect = [from, to];
      line.line.controlPointDistance = -0.3;
      shadowLine.imagesToConnect = [from, to];

      return line;
    };
  };

  const eraseLine = line => {
    line.className = `--is-erased`;
    line.setClassName();
  };

  const flyPlane = (currentLine, planeContainer, lineSeries, planeShadowContainer, shadowLineSeries, plane, planeShadow) => {
    const { from, to } = mapConfiguration.flight;

    planeContainer.mapLine = lineSeries.mapLines.getIndex(currentLine);
    planeContainer.parent = planeContainer.mapLine;
    planeShadowContainer.mapLine = shadowLineSeries.mapLines.getIndex(currentLine);
    planeShadowContainer.parent = planeShadowContainer.mapLine;
    plane.rotation = planeShadow.rotation;

    planeContainer.animate({
      property: `position`,
      from: from,
      to: to,
    }, 4000, am4core.ease.sinInOut).delay(1000);

    planeShadowContainer.animate({
      property: `position`,
      from: from,
      to: to,
    }, 4000, am4core.ease.sinInOut).delay(1000);
  };

  const buildMap = mapChart => {
    const currentLine = 1;

    const loader = setLoader(mapChart);
    loader.show();
    createMapChart(mapChart);

    const polygonSeries = setPolygonSeries(mapChart);
    const polygonTemplate = setPolygonTemplate(polygonSeries);
    const lineSeries = setLineSeries(mapChart);
    setDropShadowFilter(lineSeries);

    const shadowLineSeries = setShadowLineSeries(mapChart);
    const mapCities = setCities(mapChart);

    const mapCity = setCity(mapCities);
    setCitiesShadowFilter(mapCity);
    setInitialCities(mapCities);

    const initialCity = mapConfiguration.mapCities.find(initialCity => initialCity.name === mapConfiguration.initialCity.name);
    const addLine = addLines(lineSeries, shadowLineSeries);

    addLine(initialCity, initialCity);

    const planeContainer = setPlaneContainer(lineSeries);
    const planeShadowContainer = setPlaneShadowContainer(shadowLineSeries);

    const plane = setPlane(planeContainer);
    const planeShadow = setPlaneShadow(planeShadowContainer);
    loader.hide();

    return {
      currentLine,
      polygonSeries,
      polygonTemplate,
      lineSeries,
      shadowLineSeries,
      initialCity,
      addLine,
      eraseLine,
      planeContainer,
      planeShadowContainer,
      plane,
      planeShadow,
    };
  };

  useEffect(() => {
    const mapChart = am4core.create(mapReference.current, am4maps.MapChart);
    let {
      currentLine,
      polygonSeries,
      polygonTemplate,
      lineSeries,
      shadowLineSeries,
      initialCity,
      addLine,
      eraseLine,
      planeContainer,
      planeShadowContainer,
      plane,
      planeShadow,
    } = buildMap(mapChart);

    polygonTemplate.events.on(`over`, element => {
      mapConfiguration.countriesIsoCode.map(iso => {
        const country = polygonSeries.getPolygonById(iso);

        if (element.target.dataItem.dataContext.id === iso) {
          country.isHover = true;
          country.cursorOverStyle = am4core.MouseCursorStyle.pointer;
          country.tooltipText = `{name}`;
          element.target.isActive = true;
        }
      });
    });

    mapConfiguration.mapCities.forEach(city => {
      city.events.on(`hit`, element => {
        destination = element.target;
        origin = previousDestinationRef.current || initialCity;

        showCityInformation(destination.name);

        if (destination !== origin) {
          if (currentLine > 1) eraseLine(previousLineRef.current);

          const line = addLine(origin, destination);
          flyPlane(currentLine, planeContainer, lineSeries, planeShadowContainer, shadowLineSeries, plane, planeShadow);

          previousDestinationRef.current = element.target;
          previousLineRef.current = line;
          currentLine++;
        }
      });
    });

    polygonTemplate.events.on(`hit`, country => {
      destination = mapConfiguration.mapCities.find(city => city.countryIsoCode === country.target.dataItem.dataContext.id);
      origin = previousDestinationRef.current || initialCity;

      if (destination !== origin) {
        if (currentLine > 1) eraseLine(previousLineRef.current);

        const line = addLine(origin, destination);
        flyPlane(currentLine, planeContainer, lineSeries, planeShadowContainer, shadowLineSeries, plane, planeShadow);

        previousDestinationRef.current = mapConfiguration.mapCities.find(city => city.countryIsoCode === country.target.dataItem.dataContext.id);
        previousLineRef.current = line;
        currentLine++;
      }
    });

    mapChart.events.on(`zoomlevelchanged`, () => {
      plane.scale = .25 / mapChart.zoomLevel;
      planeShadow.scale = .15 / mapChart.zoomLevel;
    });

    mapChart.events.on(`ready`, () => {
      let north, south, west, east;

      mapConfiguration.countriesIsoCode.forEach(isoCode => {
        const country = polygonSeries.getPolygonById(isoCode);

        north = !north || (country.north > north) ? country.north : north;
        south = !south || (country.south < south) ? country.south : south;
        west = !west || (country.north < west) ? country.west : west;
        east = !east || (country.east > east) ? country.east : east;

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
  showCityInformation: PropTypes.func.isRequired,
};

Map.defaultProps = {};

export default Map;
