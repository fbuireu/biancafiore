export const TabId = {
	EMAIL: "email",
	APPOINTMENT: "appointment",
} as const;

export type TabId = (typeof TabId)[keyof typeof TabId];

export const TAB_QUERY_KEY = "tab" as const;
export const TAB_CLASS = "tabs__tab" as const;
export const TAB_ACTIVE_CLASS = `${TAB_CLASS}--active` as const;
export const TAB_CONTENT_CLASS = "tabs__content" as const;
export const TAB_CONTENT_ACTIVE_CLASS = `${TAB_CONTENT_CLASS}--active` as const;
