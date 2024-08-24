import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
    extends: ["@commitlint/config-conventional"],
    parserPreset: "conventional-changelog-atom",
    formatter: "@commitlint/format",
    rules: {
        "scope-case": [
            2,
            "always",
            ["lower-case", "pascal-case", "camel-case"],
        ],
        "scope-enum": [2, "always", ["deps", "other"]],
        "header-max-length": [2, "always", 130],
    },
};

export default Configuration;
