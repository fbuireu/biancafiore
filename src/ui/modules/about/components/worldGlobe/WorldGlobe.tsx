import type { CityPoint } from "@modules/about/utils/globe";
import { lazy, memo, Suspense, use, useEffect, useRef, useState } from "react";
import { browser } from "react-dom";
import { WORLD_GLOBE_CONFIG } from "./const";
import "./world-globe.css";

interface WorldGlobeProps {
	points: CityPoint[];
	width?: number;
}

const WorldGlobeCanvas = lazy(() => import("./WorldGlobeCanvas"));

const { HEIGHT } = WORLD_GLOBE_CONFIG;

const WRAPPER_CLASS_NAME = "world-globe-wrapper reveal reveal--fade";

const getResponsiveWidth = () => (window.innerWidth > 720 ? 680 : undefined);

const BrowserWorldGlobe = ({ points, width: widthProp }: WorldGlobeProps) => {
	use(browser());

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
		<aside ref={containerRef} className={WRAPPER_CLASS_NAME} style={!isVisible ? { height: HEIGHT, width } : undefined}>
			{isVisible && (
				<Suspense fallback={null}>
					<WorldGlobeCanvas points={points} width={width} />
				</Suspense>
			)}
		</aside>
	);
};

export const WorldGlobe = memo(({ points, width }: WorldGlobeProps) => (
	<Suspense fallback={<aside className={WRAPPER_CLASS_NAME} style={{ height: HEIGHT, width }} />}>
		<BrowserWorldGlobe points={points} width={width} />
	</Suspense>
));

WorldGlobe.displayName = "WorldGlobe";
