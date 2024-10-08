import { useSyncExternalStore } from "react";

export enum TabVisibility {
	VISIBLE = "visible",
	HIDDEN = "hidden",
	UNDEFINED = "undefined",
}

export function useTabVisibility(): TabVisibility {
	const subscribe = (callback: () => void) => {
		document.addEventListener("visibilitychange", callback);
		return () => {
			document.removeEventListener("visibilitychange", callback);
		};
	};

	const getSnapshot = () => document.visibilityState as TabVisibility;

	return useSyncExternalStore(subscribe, getSnapshot);
}
