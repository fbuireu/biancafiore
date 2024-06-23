import { useEffect, useState } from "react";

export enum TabVisibility {
	VISIBLE = "visible",
	HIDDEN = "hidden",
	UNDEFINED = "undefined",
}

function useTabVisibility(): TabVisibility {
	const [tabVisibility, setTabVisibility] = useState<TabVisibility>(document.visibilityState as TabVisibility);

	useEffect(() => {
		const handleVisibilityChange = () => {
			setTabVisibility(document.visibilityState as TabVisibility);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	return tabVisibility;
}

export default useTabVisibility;
