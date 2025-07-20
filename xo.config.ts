/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import prisma from "eslint-plugin-prisma";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import type { FlatXoConfig } from "xo";

export default [
	// xo
	{
		prettier: "compat",
		rules: {
			...prisma.configs.recommended.rules,
			"@typescript-eslint/no-unsafe-return": "off",
			"capitalized-comments": "off",
			"import-x/extensions": "off",
			"n/prefer-global/process": ["error", "always"],
		},
	},
	// custom plugins
	{
		plugins: {
			// @ts-expect-error - prisma plugin is typed wrong, but works fine
			prisma,
			"simple-import-sort": simpleImportSort,
			"sort-keys-fix": await import("eslint-plugin-sort-keys"),
			"unused-imports": unusedImports,
		},
		rules: {
			"import-x/order": "off",
			"simple-import-sort/exports": "error",
			"simple-import-sort/imports": "error",
			"sort-keys-fix/sort-keys-fix": "error",
			"unused-imports/no-unused-imports": "error",
			...prisma.configs.recommended.rules,
		},
	},
] satisfies FlatXoConfig;
