import type { CityDTO } from "@application/dto/city/types.ts";
import horizontalArrow from "@assets/images/svg/left-arrow.svg";
import zoomIn from "@assets/images/svg/zoom-in.svg";
import zoomOut from "@assets/images/svg/zoom-out.svg";
import { WORLD_GLOBE_CONFIG } from "@const/index.ts";
import countries from "@data/countries.geojson.json";
import useTabVisibility, { TabVisibility } from "@modules/about/hooks/useTabVisibility/useTabVisibility.ts";
import { calculateCenter } from "@modules/about/utils/calculateCenter";
import { refineCities } from "@modules/about/utils/refineCities";
import { renderPin } from "@modules/about/utils/renderPin";
import { Image } from "@modules/core/components/image";
import { memo, useCallback, useEffect, useRef } from "react";
import type { GlobeMethods } from "react-globe.gl";
import Globe from "react-globe.gl";
import * as Three from "three";
import "./world-globe.css";

interface GlobeAllCitiesProps {
	cities: CityDTO[];
	width?: number;
}

export interface ReactGlobePoint {
	lat: number;
	lng: number;
	label: string;
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
	MESH_PHONG_MATERIAL_CONFIG,
	HEXAGON_POLYGON_COLOR,
	BACKGROUND_COLOR,
	SHOW_ATMOSPHERE,
	ANIMATE_IN,
	POINTS_MERGE,
	ANIMATION_DURATION,
	MOVEMENT_OFFSET,
	ZOOM_OFFSET,
} = WORLD_GLOBE_CONFIG;

const WorldGlobe = memo(({ cities, width = worldGlobeSize.width }: GlobeAllCitiesProps) => {
	const tabVisibility = useTabVisibility();
	const worldGlobeReference = useRef<GlobeMethods | undefined>(undefined);

	const onGlobeReady = () => {
		if (!worldGlobeReference.current || !cities) return;
		const { latitude, longitude } = calculateCenter(cities);
		worldGlobeReference.current.controls().autoRotate = true;
		worldGlobeReference.current.controls().enableZoom = false;
		worldGlobeReference.current.controls().autoRotateSpeed = 0.25;
		worldGlobeReference.current.pointOfView({
			lat: latitude,
			lng: longitude,
			altitude: 1.5,
		});
	};

	useEffect(() => {
		if (!worldGlobeReference.current) return;
		worldGlobeReference.current.controls().autoRotate = tabVisibility === TabVisibility.VISIBLE;
	}, [tabVisibility]);

	const handleAction = useCallback(({ movementDirection, type }: HandleActionParams) => {
		if (!worldGlobeReference.current) return;
		const { lng: currentLongitude, altitude: currentZoom } = worldGlobeReference.current.pointOfView();

		if (type === MovementType.MOVE) {
			const offset = movementDirection === Direction.CLOCKWISE ? MOVEMENT_OFFSET : -MOVEMENT_OFFSET;
			const newLongitude = currentLongitude + offset;

			worldGlobeReference.current.pointOfView({ lng: newLongitude }, ANIMATION_DURATION);
		} else if (type === MovementType.ZOOM) {
			const newZoom = movementDirection === Zoom.IN ? currentZoom - ZOOM_OFFSET : currentZoom + ZOOM_OFFSET;

			worldGlobeReference.current.pointOfView({ altitude: newZoom }, ANIMATION_DURATION);
		}
	}, []);

	return (
		<aside className="world-globe__wrapper">
			<Globe
				ref={worldGlobeReference}
				height={worldGlobeSize.height}
				width={width}
				onGlobeReady={onGlobeReady}
				pointsMerge={POINTS_MERGE}
				animateIn={ANIMATE_IN}
				showAtmosphere={SHOW_ATMOSPHERE}
				backgroundColor={BACKGROUND_COLOR}
				hexPolygonsData={countries.features}
				hexPolygonColor={() => HEXAGON_POLYGON_COLOR}
				globeMaterial={
					new Three.MeshPhongMaterial({
						color: MESH_PHONG_MATERIAL_CONFIG.COLOR,
						opacity: MESH_PHONG_MATERIAL_CONFIG.OPACITY,
						transparent: MESH_PHONG_MATERIAL_CONFIG.TRANSPARENT,
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
								movementDirection: Direction.COUNTERCLOCKWISE,
								type: MovementType.MOVE,
							})
						}
					>
						<Image src={(horizontalArrow as unknown as ProtoImage).src} alt="Move left" />
					</button>
					<button
						className="world-globe__controls__move --right flex clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Direction.CLOCKWISE,
								type: MovementType.MOVE,
							})
						}
					>
						<Image src={(horizontalArrow as unknown as ProtoImage).src} alt="Move Right" />
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
						<Image src={(zoomIn as unknown as ProtoImage).src} alt="Zoom in" />
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
						<Image src={(zoomOut as unknown as ProtoImage).src} alt="Zoom out" />
					</button>
				</div>
			</div>
		</aside>
	);
});

WorldGlobe.displayName = "WorldGlobe";

export default WorldGlobe;
