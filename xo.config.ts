/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { FlatXoConfig } from "xo";

export default [
	{
		plugins: {
			"sort-keys-fix": await import("eslint-plugin-sort-keys"),
		},
		prettier: true,
		rules: {
			"@typescript-eslint/no-unsafe-return": "off",
			"capitalized-comments": "off",
			"import-x/extensions": "off",
			"n/prefer-global/process": ["error", "always"],
			"sort-keys-fix/sort-keys-fix": "error",
		},
	},
] satisfies FlatXoConfig;
