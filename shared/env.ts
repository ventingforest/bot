import process from "node:process";

import { z } from "zod";

const rawEnv: Partial<z.infer<typeof schema>> = {
	database: process.env.DATABASE,
	environment: process.env.NODE_ENV as z.infer<typeof schema>["environment"],
	token: process.env.TOKEN,
};
const schema = z.object({
	database: z.url(),
	environment: z.enum(["development", "production"]).default("development"),
	token: z.string(),
});

const env = schema.parse(rawEnv);

if (!env.database) {
	throw new Error(
		"No database URL provided. Please set the DATABASE environment variable.",
	);
}

if (!env.token) {
	throw new Error(
		"Missing bot token in environment variables. Please set the TOKEN variable.",
	);
}

export default env;
