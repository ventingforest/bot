/**
 * The ID of the guild the bot operates in.
 */
export const guildId = "435894444101861408";

/**
 * The token used to connect to Discord.
 */
export const token =
	process.env.DISCORD_TOKEN ??
	(process.env.NODE_ENV === "production"
		? (process.env.PROD_DISCORD_TOKEN ?? process.env.DEV_DISCORD_TOKEN)
		: (process.env.DEV_DISCORD_TOKEN ?? process.env.PROD_DISCORD_TOKEN));

if (!token) {
	throw new Error(
		"No token provided. Please set the TOKEN environment variable.",
	);
}
