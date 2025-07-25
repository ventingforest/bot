/**
 * Is the bot running in production mode?
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * The ID of the guild the bot operates in.
 */
export const guildId = "435894444101861408";

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

export const anon = {
	/**
	 * The channel ID for the anonymous vent channel.
	 */
	channelId: isProduction ? "" : "1397637713980817520",
	/**
	 * The emoji used to query the author of an anonymous vent.
	 */
	queryReaction: "❓",
	/**
	 * How long a session lasts before it is cleaned up.
	 */
	sessionTimeout: 1000 * 60 * 5, // 5 minutes
};

export const xp = {
	/**
	 * The number of characters in a message required to receive 1 XP.
	 */
	charsPerPoint: 20,
	/**
	 * The cooldown period in milliseconds before a user can receive XP for sending another message.
	 */
	cooldown: 1000 * 10, // 10 seconds

	/**
	 * The maximum amount of XP a user can receive for a message.
	 */
	maximum: 10,

	/**
	 * The minimum amount of XP a user can receive for a message.
	 */
	minimum: 5,
};
