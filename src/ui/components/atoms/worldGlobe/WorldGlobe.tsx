import { memo, useCallback, useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import * as Three from "three";
import countries from "@data/countries.geojson.json";
import "./world-globe.css";
import { calculateCenter } from "@components/atoms/worldGlobe/utils/calculateCenter";
import { renderPin } from "@components/atoms/worldGlobe/utils/renderPin";
import type { ReactGlobePoint } from "./utils/refineCities";
import { refineCities } from "./utils/refineCities";
import horizontalArrow from "@assets/images/svg/left-arrow.svg";
import zoomIn from "@assets/images/svg/zoom-in.svg";
import zoomOut from "@assets/images/svg/zoom-out.svg";
import useTabVisibility, { TabVisibility } from "@ui/hooks/useTabVisibility/useTabVisibility.ts";
import { WORLD_GLOBE_CONFIG } from "@const/index.ts";

export interface City {
	latitude: string;
	longitude: string;
	name: string;
}

interface GlobeAllCitiesProps {
	cities: City[];
	width?: number;
}

enum MovementType {
	MOVE = "move",
	ZOOM = "zoom",
}

enum Direction {
	CLOCKWISE = "clockwise",
	COUNTERCLOCKWISE = "counterClockwise",
}

enum Zoom {
	IN = "in",
	OUT = "out",
}

interface HandleActionParams {
	movementDirection: Direction | Zoom;
	type: MovementType;
}

const worldGlobeSize = {
	width: window.innerWidth > 720 ? 680 : undefined,
	height: 458,
};
const {
	meshPhongMaterialConfig,
	hexagonPolygonColor,
	backgroundColor,
	showAtmosphere,
	animateIn,
	pointsMerge,
	animationDuration,
	movementOffset,
	zoomOffset,
} = WORLD_GLOBE_CONFIG;

const WorldGlobe = memo(({ cities, width = worldGlobeSize.width }: GlobeAllCitiesProps) => {
	const tabVisibility = useTabVisibility();
	const worldGlobeReference = useRef<GlobeMethods | undefined>(undefined);

	const onGlobeReady = () => {
		if (!worldGlobeReference.current || !cities) return;
		const { latitude, longitude } = calculateCenter(cities);
		worldGlobeReference.current.controls().autoRotate = true;
		worldGlobeReference.current.controls().enableZoom = false;
		worldGlobeReference.current.controls().autoRotateSpeed = 0.5;
		worldGlobeReference.current.pointOfView({
			lat: latitude,
			lng: longitude,
			altitude: 1.5,
		});
	};

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (!worldGlobeReference.current) return;
			worldGlobeReference.current.controls().autoRotate = document.visibilityState === TabVisibility.VISIBLE;
		};

		handleVisibilityChange();

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [tabVisibility, worldGlobeReference]);

	const handleAction = useCallback(
		({ movementDirection, type }: HandleActionParams) => {
			if (!worldGlobeReference.current) return;
			const { lng: currentLongitude, altitude: currentZoom } = worldGlobeReference.current.pointOfView();

			if (type === MovementType.MOVE) {
				const offset = movementDirection === Direction.CLOCKWISE ? movementOffset : -movementOffset;
				const newLongitude = currentLongitude + offset;

				worldGlobeReference.current.pointOfView({ lng: newLongitude }, animationDuration);
			} else if (type === MovementType.ZOOM) {
				const newZoom = movementDirection === Zoom.IN ? currentZoom - zoomOffset : currentZoom + zoomOffset;

				worldGlobeReference.current.pointOfView({ altitude: newZoom }, animationDuration);
			}
		},
		[worldGlobeReference],
	);

	return (
		<aside className="world-globe__wrapper">
			<Globe
				ref={worldGlobeReference}
				height={worldGlobeSize.height}
				width={width}
				onGlobeReady={onGlobeReady}
				pointsMerge={pointsMerge}
				animateIn={animateIn}
				showAtmosphere={showAtmosphere}
				backgroundColor={backgroundColor}
				hexPolygonsData={countries.features}
				hexPolygonColor={() => hexagonPolygonColor}
				globeMaterial={
					new Three.MeshPhongMaterial({
						color: meshPhongMaterialConfig.color,
						opacity: meshPhongMaterialConfig.opacity,
						transparent: meshPhongMaterialConfig.transparent,
					})
				}
				pointsData={refineCities(cities)}
				pointAltitude="altitude"
				pointRadius="radius"
				pointColor="color"
				htmlElementsData={refineCities(cities)}
				htmlElement={(data) => renderPin({ markerData: data as ReactGlobePoint })}
			/>
			<div className="world-globe__controls flex row-wrap justify-center">
				<div className="world-globe__controls__direction-wrapper flex row-wrap">
					<button
						className="world-globe__controls__move --left flex clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Direction.CLOCKWISE,
								type: MovementType.MOVE,
							})
						}
					>
						<img src={horizontalArrow.src} alt="Move left" />
					</button>
					<button
						className="world-globe__controls__move --right flex clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Direction.COUNTERCLOCKWISE,
								type: MovementType.MOVE,
							})
						}
					>
						<img src={horizontalArrow.src} alt="Move Right" />
					</button>
				</div>
				<div className="world-globe__controls__zoom-wrapper flex row-wrap">
					<button
						className="world-globe__controls__move --zoom-in clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Zoom.IN,
								type: MovementType.ZOOM,
							})
						}
					>
						<img src={zoomIn.src} alt="Zoom in" />
					</button>
					<button
						className="world-globe__controls__move --zoom-out clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Zoom.OUT,
								type: MovementType.ZOOM,
							})
						}
					>
						<img src={zoomOut.src} alt="Zoom out" />
					</button>
				</div>
			</div>
		</aside>
	);
});

WorldGlobe.displayName = "WorldGlobe";

export default WorldGlobe;
