/** @type {import('prettier').Config} */
const config = {
	arrowParens: "always",
	bracketSpacing: true,
	htmlWhitespaceSensitivity: "ignore",
	printWidth: 120,
	proseWrap: "always",
	semi: true,
	singleQuote: true,
	trailingComma: "es5",
	plugins: ["prettier-plugin-astro"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
			rules: {
				astroAllowShorthand: true,
			},
		},
	],
};

export default config;
