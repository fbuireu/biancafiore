export const CALENDLY = {
	ASSETS_ORIGIN: "https://assets.calendly.com",
	BOOKING_ORIGIN: "https://calendly.com",
	WIDGET_CLASS: "calendly-inline-widget",
	MEETING_PATH: "/fbuireu/45min-meeting",
	MEETING_OPTIONS: "hide_event_type_details=1&hide_gdpr_banner=1",
} as const;

export const CALENDLY_WIDGET_SCRIPT = `${CALENDLY.ASSETS_ORIGIN}/assets/external/widget.js`;

export const CALENDLY_MEETING_URL = `${CALENDLY.BOOKING_ORIGIN}${CALENDLY.MEETING_PATH}?${CALENDLY.MEETING_OPTIONS}`;
