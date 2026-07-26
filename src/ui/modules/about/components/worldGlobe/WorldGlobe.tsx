import type { CollectionEntry } from "astro:content";
import { lazy, memo, Suspense, useEffect, useRef, useState } from "react";
import "./world-globe.css";

interface GlobeAllCitiesProps {
	cities: CollectionEntry<"cities">[];
	width?: number;
}

export interface ReactGlobePoint {
	lat: number;
	lng: number;
	label: string;
}

const WorldGlobeCanvas = lazy(() => import("./WorldGlobeCanvas"));

const WORLD_GLOBE_HEIGHT = 458;

const getResponsiveWidth = () => (window.innerWidth > 720 ? 680 : undefined);

const WorldGlobe = memo(({ cities, width: widthProp }: GlobeAllCitiesProps) => {
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
			style={!isVisible ? { height: WORLD_GLOBE_HEIGHT, width } : undefined}
		>
			{isVisible && (
				<Suspense fallback={null}>
					<WorldGlobeCanvas cities={cities} width={width} />
				</Suspense>
			)}
		</aside>
	);
});

WorldGlobe.displayName = "WorldGlobe";

export default WorldGlobe;
