import process from "node:process";

import { z } from "zod";

const env: Partial<z.infer<typeof schema>> = {
	database: process.env.DATABASE,
	environment: process.env.NODE_ENV as z.infer<typeof schema>["environment"],
	token: process.env.TOKEN,
};
const schema = z.object({
	database: z.url(),
	environment: z.enum(["development", "production"]).default("development"),
	token: z.string(),
});

const parsed = await schema.safeParseAsync(env);

if (!parsed.success) {
	const { issues } = parsed.error;
	const vars = issues.map(({ path }) => path.join(".").toUpperCase());
	throw new Error(
		`Missing or invalid environment variable(s): ${vars.join(", ")}. Please check your .env file or environment variables.`,
	);
}

export default parsed.data;
