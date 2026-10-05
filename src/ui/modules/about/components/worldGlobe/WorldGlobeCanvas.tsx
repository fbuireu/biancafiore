import { StretchArrow } from "@assets/images/svg-components/stretchArrow/StretchArrow";
import { ZoomIn } from "@assets/images/svg-components/zoomIn/ZoomIn";
import { ZoomOut } from "@assets/images/svg-components/zoomOut/ZoomOut";
import { prefersReducedMotion } from "@modules/core/utils/motion";
import { use, useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import Globe from "react-globe.gl";
import * as Three from "three";
import { TabVisibility, useTabVisibility } from "../../hooks/useTabVisibility/useTabVisibility";
import { type CityPoint, calculateCenter, renderPin } from "../../utils/globe";
import { WORLD_GLOBE_CONFIG } from "./const";
import { type CountryFeature, fetchCountries } from "./utils/countries";
import { observeTheme, readGlobePalette } from "./utils/palette";

interface WorldGlobeCanvasProps {
	points: CityPoint[];
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

const Zoom = {
	IN: "in",
	OUT: "out",
} as const;

interface HandleActionParams {
	movementDirection: (typeof Direction)[keyof typeof Direction] | (typeof Zoom)[keyof typeof Zoom];
	type: (typeof MovementType)[keyof typeof MovementType];
}

const {
	HEIGHT,
	MESH_PHONG_MATERIAL_CONFIG,
	BACKGROUND_COLOR,
	SHOW_ATMOSPHERE,
	ANIMATE_IN,
	ANIMATION_DURATION,
	MOVEMENT_OFFSET,
	ZOOM_OFFSET,
} = WORLD_GLOBE_CONFIG;

let countries: Promise<CountryFeature[]> | undefined;

const loadCountries = (): Promise<CountryFeature[]> => (countries ??= fetchCountries());

const WorldGlobeCanvas = ({ points, width }: WorldGlobeCanvasProps) => {
	const tabVisibility = useTabVisibility();
	const hexPolygons = use(loadCountries());
	const worldGlobeReference = useRef<GlobeMethods | undefined>(undefined);
	const [palette, setPalette] = useState(readGlobePalette);
	const [globeMaterial] = useState(
		() =>
			new Three.MeshPhongMaterial({
				color: palette.ocean,
				opacity: MESH_PHONG_MATERIAL_CONFIG.OPACITY,
				transparent: MESH_PHONG_MATERIAL_CONFIG.TRANSPARENT,
			}),
	);

	useEffect(() => observeTheme(() => setPalette(readGlobePalette())), []);

	useEffect(() => {
		globeMaterial.color.set(palette.ocean);
	}, [globeMaterial, palette.ocean]);

	const onGlobeReady = () => {
		if (!worldGlobeReference.current) {
			return;
		}

		const { latitude, longitude } = calculateCenter(points);
		worldGlobeReference.current.controls().autoRotate = !prefersReducedMotion();
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
		worldGlobeReference.current.controls().autoRotate =
			tabVisibility === TabVisibility.VISIBLE && !prefersReducedMotion();
	}, [tabVisibility]);

	const handleAction = ({ movementDirection, type }: HandleActionParams) => {
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
	};

	return (
		<>
			<Globe
				ref={worldGlobeReference}
				height={HEIGHT}
				width={width}
				onGlobeReady={onGlobeReady}
				animateIn={ANIMATE_IN}
				showAtmosphere={SHOW_ATMOSPHERE}
				backgroundColor={BACKGROUND_COLOR}
				hexPolygonsData={hexPolygons}
				hexPolygonColor={() => palette.land}
				globeMaterial={globeMaterial}
				htmlElementsData={points}
				htmlElement={(data) => renderPin(data as CityPoint)}
			/>
			<div className="world-globe__controls flex row-wrap justify-center">
				<div className="world-globe__direction-wrapper flex row-wrap">
					<button
						className="world-globe__controls__move world-globe__controls__move--left flex clickable"
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
						className="world-globe__controls__move flex clickable"
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
						className="world-globe__controls__move clickable"
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
						className="world-globe__controls__move clickable"
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
