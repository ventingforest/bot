import { env } from "node:process";

/**
 * The ID of the guild the bot operates in.
 */
export const guildId = "435894444101861408";

/**
 * The token used to connect to Discord.
 */
export const token = (env.DISCORD_TOKEN ??
	(env.NODE_ENV === "production"
		? (env.PROD_DISCORD_TOKEN ?? env.DEV_DISCORD_TOKEN)
		: (env.DEV_DISCORD_TOKEN ?? env.PROD_DISCORD_TOKEN)))!;

if (!token) {
	throw new Error(
		"No token provided. Please set the TOKEN environment variable.",
	);
}
