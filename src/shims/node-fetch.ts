export const fetch = globalThis.fetch.bind(globalThis);
export default fetch;
export const { Headers, Request, Response, FormData, Blob, File } = globalThis;
