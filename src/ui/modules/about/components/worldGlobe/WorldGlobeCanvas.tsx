import type { CollectionEntry } from "astro:content";
import { StretchArrow } from "@assets/images/svg-components/stretchArrow";
import { ZoomIn } from "@assets/images/svg-components/zoomIn/ZoomIn";
import { ZoomOut } from "@assets/images/svg-components/zoomOut/ZoomOut";
import countries from "@data/countries.geojson.json";
import { TabVisibility, useTabVisibility } from "@modules/about/hooks/useTabVisibility/useTabVisibility";
import { calculateCenter, refineCities, renderPin } from "@modules/about/utils/globe";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { GlobeMethods } from "react-globe.gl";
import Globe from "react-globe.gl";
import * as Three from "three";
import { WORLD_GLOBE_CONFIG } from "./const";
import type { ReactGlobePoint } from "./WorldGlobe";

interface WorldGlobeCanvasProps {
	cities: CollectionEntry<"cities">[];
	width?: number;
}

const MovementType = {
	MOVE: "move",
	ZOOM: "zoom",
} as const;

const Direction = {
	CLOCKWISE: "clockwise",
	COUNTERCLOCKWISE: "counterClockwise",
} as const;

export const Zoom = {
	IN: "in",
	OUT: "out",
} as const;

interface HandleActionParams {
	movementDirection: (typeof Direction)[keyof typeof Direction] | (typeof Zoom)[keyof typeof Zoom];
	type: (typeof MovementType)[keyof typeof MovementType];
}

const worldGlobeHeight = 458;

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

const WorldGlobeCanvas = ({ cities, width }: WorldGlobeCanvasProps) => {
	const tabVisibility = useTabVisibility();
	const worldGlobeReference = useRef<GlobeMethods | undefined>(undefined);

	const globeMaterial = useMemo(
		() =>
			new Three.MeshPhongMaterial({
				color: MESH_PHONG_MATERIAL_CONFIG.COLOR,
				opacity: MESH_PHONG_MATERIAL_CONFIG.OPACITY,
				transparent: MESH_PHONG_MATERIAL_CONFIG.TRANSPARENT,
			}),
		[],
	);

	const points = useMemo(() => refineCities(cities), [cities]);

	const onGlobeReady = () => {
		if (!worldGlobeReference.current || !cities) {
			return;
		}

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
		if (!worldGlobeReference.current) {
			return;
		}
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
		<>
			<Globe
				ref={worldGlobeReference}
				height={worldGlobeHeight}
				width={width}
				onGlobeReady={onGlobeReady}
				pointsMerge={POINTS_MERGE}
				animateIn={ANIMATE_IN}
				showAtmosphere={SHOW_ATMOSPHERE}
				backgroundColor={BACKGROUND_COLOR}
				hexPolygonsData={countries.features}
				hexPolygonColor={() => HEXAGON_POLYGON_COLOR}
				globeMaterial={globeMaterial}
				pointsData={points}
				pointAltitude="altitude"
				pointRadius="radius"
				pointColor="color"
				htmlElementsData={points}
				htmlElement={(data) => renderPin({ markerData: data as ReactGlobePoint })}
			/>
			<div className="world-globe__controls flex row-wrap justify-center">
				<div className="world-globe__direction-wrapper flex row-wrap">
					<button
						className="world-globe__controls__move --left flex --is-clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Direction.COUNTERCLOCKWISE,
								type: MovementType.MOVE,
							})
						}
					>
						<StretchArrow title="Move left" />
					</button>
					<button
						className="world-globe__controls__move --right flex --is-clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Direction.CLOCKWISE,
								type: MovementType.MOVE,
							})
						}
					>
						<StretchArrow title="Move Right" />
					</button>
				</div>
				<div className="world-globe__zoom-wrapper flex row-wrap">
					<button
						className="world-globe__controls__move --zoom-in --is-clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Zoom.IN,
								type: MovementType.ZOOM,
							})
						}
					>
						<ZoomIn />
					</button>
					<button
						className="world-globe__controls__move --zoom-out --is-clickable"
						type="button"
						onClick={() =>
							handleAction({
								movementDirection: Zoom.OUT,
								type: MovementType.ZOOM,
							})
						}
					>
						<ZoomOut />
					</button>
				</div>
			</div>
		</>
	);
};

export default WorldGlobeCanvas;
