import { lazy, Suspense, use, useEffect, useRef, useState } from "react";
import { browser } from "react-dom";
import type { CityPoint } from "../../utils/globe";
import { WORLD_GLOBE_CONFIG } from "./const";
import "./world-globe.css";

interface WorldGlobeProps {
	points: CityPoint[];
}

const WorldGlobeCanvas = lazy(() => import("./WorldGlobeCanvas"));

const { HEIGHT } = WORLD_GLOBE_CONFIG;

const WRAPPER_CLASS_NAME = "world-globe-wrapper reveal reveal--fade";

const getResponsiveWidth = () => (window.innerWidth > 720 ? 680 : undefined);

const BrowserWorldGlobe = ({ points }: WorldGlobeProps) => {
	use(browser());

	const [width, setWidth] = useState<number | undefined>(() => getResponsiveWidth());

	useEffect(() => {
		const handleResize = () => setWidth(getResponsiveWidth());
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

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

export const WorldGlobe = ({ points }: WorldGlobeProps) => (
	<Suspense fallback={<aside className={WRAPPER_CLASS_NAME} style={{ height: HEIGHT }} />}>
		<BrowserWorldGlobe points={points} />
	</Suspense>
);
