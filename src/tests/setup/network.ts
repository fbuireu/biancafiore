import { afterAll, afterEach, beforeAll } from "vitest";
import { escapedRequests, server } from "../doubles/network";

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
	server.resetHandlers();

	const escaped = escapedRequests.splice(0);

	if (escaped.length > 0) {
		throw new Error(
			`This test asked the network for ${escaped.join(", ")}. Register a double for it in src/tests/doubles/network.ts.`,
		);
	}
});

afterAll(() => {
	server.close();
});
