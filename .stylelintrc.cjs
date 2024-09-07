/** @type {import('stylelint').Config} */

module.exports = {
	extends: "stylelint-config-recommended",
	plugins: ["stylelint-order"],
	allowEmptyInput: true,
	rules: {
		"order/properties-alphabetical-order": true,
	},
};
