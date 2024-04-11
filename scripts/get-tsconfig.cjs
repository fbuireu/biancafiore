// @ts-check
const ts = require("typescript");
const { readFileSync } = require("node:fs");
const assert = require("node:assert");

const tsconfigPath = require.resolve("../tsconfig.json");
const { config, error } = ts.readConfigFile(tsconfigPath, (path) =>
	readFileSync(path, "utf-8"),
);

assert(!error);

module.exports = config;
