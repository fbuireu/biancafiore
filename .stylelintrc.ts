import type { Config } from "stylelint";

const config: Config = {
    extends: "stylelint-config-recommended",
    plugins: ["stylelint-order"],
    allowEmptyInput: true,
    maxWarnings: 0,
    rules: {
        "order/properties-alphabetical-order": true,
    },
};

export default config;
