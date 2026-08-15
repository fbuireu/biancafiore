import type { CityPoint } from "@modules/about/utils/globe";
import { lazy, memo, Suspense, useEffect, useRef, useState } from "react";
import { WORLD_GLOBE_CONFIG } from "./const";
import "./world-globe.css";

interface WorldGlobeProps {
	points: CityPoint[];
	width?: number;
}

const WorldGlobeCanvas = lazy(() => import("./WorldGlobeCanvas"));

const { HEIGHT } = WORLD_GLOBE_CONFIG;

const getResponsiveWidth = () => (window.innerWidth > 720 ? 680 : undefined);

export const WorldGlobe = memo(({ points, width: widthProp }: WorldGlobeProps) => {
	const [autoWidth, setAutoWidth] = useState<number | undefined>(() => getResponsiveWidth());
	const width = widthProp ?? autoWidth;

	useEffect(() => {
		if (widthProp !== undefined) {
			return;
		}

		const handleResize = () => setAutoWidth(getResponsiveWidth());
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, [widthProp]);

	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const node = containerRef.current;
		if (!node || isVisible) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ rootMargin: "200px" },
		);

		observer.observe(node);

		return () => observer.disconnect();
	}, [isVisible]);

	return (
		<aside
			ref={containerRef}
			className="world-globe-wrapper reveal reveal--fade"
			style={!isVisible ? { height: HEIGHT, width } : undefined}
		>
			{isVisible && (
				<Suspense fallback={null}>
					<WorldGlobeCanvas points={points} width={width} />
				</Suspense>
			)}
		</aside>
	);
});

WorldGlobe.displayName = "WorldGlobe";
