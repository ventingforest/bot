import env from "$shared/env";

export * from "$shared/data";

/**
 * Is the bot running in production mode?
 */
export const isProduction = env.environment === "production";

export const staff = {
	/**
	 * The ID of the staff channel in the guild.
	 */
	channelId: "452905389596475404",
	/**
	 * The ID of the staff role in the guild.
	 */
	roleId: "452662935035052032",
};

export const anonConf = {
	/**
	 * The channel ID for the anonymous vent channel.
	 */
	channelId: isProduction ? "1398297367752605826" : "1397637713980817520",
	/**
	 * The emoji used to query the author of an anonymous vent.
	 */
	queryReaction: "❓",
	/**
	 * How long a session lasts before it is cleaned up.
	 */
	sessionTimeout: 1000 * 60 * 5, // 5 minutes
};
